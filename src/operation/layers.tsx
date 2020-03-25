import { types } from "mobx-state-tree";
import { BoolFieldSpec, ChoiceFieldSpec, NumFieldSpec, PatternFieldSpec } from "../fields/";
import { listToMap } from "../utils";
import { createOp } from "./operation";

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

export const ConvolutionOp = createOp("Convolution", {
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
    choices: { STRIDED: "STRIDED", DILATED: "DILATED" },
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
