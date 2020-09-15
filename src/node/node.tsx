import { observer } from "mobx-react-lite";
import React from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import styled from "styled-components";
import { NodeModel } from "./node-model";
import { useStore } from "../App";

export type Shape = (number | undefined)[];

const StyledNode = styled.div`
  z-index: 1;
  cursor: pointer;
  position: absolute;
  box-shadow: 0 1px 4px 1px #eee;
  padding: 6px;
  background: #fff;
  border-radius: 6;
  border: 1px solid #eee;
`;

type NodeViewProps = { operation: NodeModel<any, any, any> };
export const NodeView: React.FC<NodeViewProps> = observer(
  ({ operation }) => {
    const rootStore = useStore();
    const onDrag = React.useCallback(
      (_: DraggableEvent, data: DraggableData) => {
        operation.move(data.deltaX, data.deltaY);
      },
      [operation]
    );
    const selectingInput = rootStore.selectingInputFor !== undefined;
    const isValidInput =
      selectingInput && rootStore.selectingInputFor!.data.isValidInput(operation);

    const onClick = React.useCallback(
      (_: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        console.log(operation);
        if (selectingInput) {
          if (isValidInput) {
            rootStore.assignInput(operation);
          }
        } else {
          rootStore.selectNode(operation);
        }
      },
      [operation, selectingInput, isValidInput]
    );
    // const [_, setDivRef] = React.useState<HTMLDivElement | null>(null);
    const { x, y, name } = operation;

    return (
      <Draggable onDrag={onDrag} position={{ x, y }} bounds="parent">
        <StyledNode
          ref={(e) => {
            if (e === null) return;
            operation.setSize(e.getBoundingClientRect());
          }}
          onClick={onClick}
          style={
            selectingInput
              ? { cursor: isValidInput ? "pointer" : "not-allowed" }
              : undefined
          }
        >
          {`Layer ${name}`}
        </StyledNode>
      </Draggable>
    );
  }
);