import { observer } from "mobx-react-lite";
import { Instance, types } from "mobx-state-tree";
import React from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { rootStore } from "../App";
import { BoolFieldSpec, ChoiceFieldSpec, NumFieldSpec, PatternFieldSpec } from "../fields/";
import { listToMap } from "../utils";
import { createOp } from "./op-model-spec";

const dimensionMap = { "1D": 1, "2D": 2, "3D": 3 };
function shapeFromDim(dim: number) {
  if (dim === 3) {
    return /\d+|\[\d+\]|\[\d+,\d+\]|\[\d+,\d+,\d+\]/;
  } else if (dim === 2) {
    return /\d+|\[\d+\]|\[\d+,\d+\]/;
  } else {
    return /\d+|\[\d+\]/;
  }
}

const extractShapePattern = (s: any) =>
  shapeFromDim(dimensionMap[s.dimensions as keyof typeof dimensionMap]);

const ConvolutionOp = createOp("Convolution", {
  dimensions: new ChoiceFieldSpec({
    choices: dimensionMap,
    default: "1D"
  }),
  filters: new NumFieldSpec({ default: 32, min: 1, isInt: true }),
  kernelSize: (() =>
    new PatternFieldSpec({
      default: [3],
      pattern: extractShapePattern,
      deps: ["dimensions"],
      transform: (value: string) => JSON.parse(value),
      transformInto: types.union(types.number, types.array(types.number))
    }))(),
  padding: new ChoiceFieldSpec({
    choices: listToMap(["VALID", "SAME", "CAUSAL"]),
    default: "SAME"
  }),
  filterType: new ChoiceFieldSpec({
    choices: {"STRIDED": "STRIDED", "DILATED":"DILATED"},
    default: "STRIDED"
  }),
  filter: new PatternFieldSpec({
    default: [1],
    pattern: extractShapePattern,
    deps: ["dimensions"],
    transform: (value: string) => JSON.parse(value),
    transformInto: types.union(types.number, types.array(types.number))
  }),
  trainable: new BoolFieldSpec({ default: true })
});

export const DenseOp = createOp("Dense", {
  units: new NumFieldSpec({ default: 32, min: 1, isInt: true }),
  useBias: new BoolFieldSpec({ default: true })
});

export const OperationModel = types
  .model("Operation", {
    key: types.identifier,
    name: types.string,
    x: types.number,
    y: types.number,
    width: types.maybe(types.number),
    height: types.maybe(types.number),
    data: types.union(ConvolutionOp, DenseOp)
  })
  .actions(self => ({
    move(dx: number, dy: number) {
      self.x += dx;
      self.y += dy;
    },
    setSize(rect: DOMRect) {
      self.width = rect.width;
      self.height = rect.height;
    },
    setName(name: string) {
      self.name = name;
    }
  }));

export interface OperationModelT extends Instance<typeof OperationModel> {}

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
    const [divRef, setDivRef] = React.useState<HTMLDivElement | null>(null);
    const { x, y, name } = operation;
    return (
      <Draggable onDrag={onDrag} position={{ x, y }} bounds="parent">
        <div
          ref={e => {
            if (e === null) return;
            operation.setSize(e.getBoundingClientRect());
            setDivRef(e);
          }}
          onClick={onClick}
          style={{
            zIndex: 1,
            cursor: "pointer",
            position: "absolute",
            boxShadow: "0 1px 4px 1px #eee",
            padding: "6px",
            background: "#fff",
            borderRadius: 6,
            border: "1px solid #eee"
          }}
        >{`Layer ${name}`}</div>
      </Draggable>
    );
  }
);
