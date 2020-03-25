import { observable } from "mobx";
import { observer } from "mobx-react-lite";
import { types } from "mobx-state-tree";
import React from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import styled from "styled-components";
import { rootStore } from "../App";
import { FieldSpec } from "../fields";
import { PropertiesTable } from "../properties/properties-table";
import { OperationModelT } from "./operation-model";

export const createOp = <V extends { [key: string]: FieldSpec }>(
  name: string,
  data: V
) => {
  const props = Object.entries(data).reduce(
    (acc, [k, v]) => {
      acc[k as keyof V] = v.mobxProp() as any;
      return acc;
    },
    {} as {
      [key in keyof V]: ReturnType<V[key]["mobxProp"]>;
    }
  );

  return types
    .model(name, {
      ...props,
      OP_TYPE: types.optional(types.literal(name), name)
    })
    .actions(self => ({
      setValue<K extends string & keyof V>(name: K, value: any) {
        self[name] = value;
      }
    }))
    .views(self => {
      const errors = observable.map<string, string>();
      return {
        form() {
          return <PropertiesTable self={self} errors={errors} data={data} />;
        }
      };
    });
};

const StyledOperation = styled.div`
  z-index: 1;
  cursor: pointer;
  position: absolute;
  box-shadow: 0 1px 4px 1px #eee;
  padding: 6px;
  background: #fff;
  border-radius: 6;
  border: 1px solid #eee;
`;

type OperationViewProps = { operation: OperationModelT };
export const OperationView: React.FC<OperationViewProps> = observer(
  ({ operation }) => {
    const onDrag = React.useCallback(
      (_: DraggableEvent, data: DraggableData) => {
        operation.move(data.deltaX, data.deltaY);
      },
      [operation]
    );
    const onClick = React.useCallback(
      (_: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        console.log(operation);
        rootStore.selectOperation(operation);
      },
      [operation]
    );
    const [_divRef, setDivRef] = React.useState<HTMLDivElement | null>(null);
    const { x, y, name } = operation;
    return (
      <Draggable onDrag={onDrag} position={{ x, y }} bounds="parent">
        <StyledOperation
          ref={e => {
            if (e === null) return;
            operation.setSize(e.getBoundingClientRect());
            setDivRef(e);
          }}
          onClick={onClick}
        >
          {`Layer ${name}`}
        </StyledOperation>
      </Draggable>
    );
  }
);
