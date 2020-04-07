import { computed, decorate, IObservableArray, observable, ObservableMap } from "mobx";
import { SnapshotIn, types } from "mobx-state-tree";
import { BoolFieldSpec, ChoiceFieldSpec, FieldSpec, NumFieldSpec, PatternFieldSpec } from "../fields/";
import { listToMap } from "../utils";
import { Shape } from "./operation";
import { OperationModel } from "./operation-model";

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

const parseArrayFromString = (value: string) => {
  const ans = JSON.parse(value.replace(",]", "]"));
  if (typeof ans === "number") return [ans];
  return ans;
};

const parseArrayFromStringWithUndefined = (value: string) => {
  const ans = JSON.parse(value.replace("?", "null").replace(",]", "]"));
  if (typeof ans === "number") return [ans];
  if (ans === null) return [undefined];
  return ans.map((v: number | null) => (v === null ? undefined : v));
};

const extractShapePattern = (s: any) =>
  shapeFromDim(dimensionMap[s.dimensions as keyof typeof dimensionMap]);

export type OperationI<V extends { [key: string]: FieldSpec }> = {
  [key in keyof V]: SnapshotIn<ReturnType<V[key]["mobxProp"]>>;
} & {
  NAME: string;
  spec: V;
  outputShape: Shape;
  inputs: IObservableArray<OperationModel>;
  nInputs: number;
  validInput(op: OperationModel): boolean;
  errors: ObservableMap<keyof V, string>;
};

const mobxDecorators = <V extends { [key: string]: FieldSpec }>(spec: V) => {
  return {
    ...Object.keys(spec).reduce((p, c) => {
      p[c as keyof V] = observable;
      return p;
    }, {} as { [key in keyof V]: PropertyDecorator }),
    inputs: observable,
    errors: observable,
    outputShape: computed,
  };
};

const ConvolutionOpData = {
  dimensions: new ChoiceFieldSpec({
    choices: dimensionMap,
    default: "1D",
  }),
  filters: new NumFieldSpec({ default: 32, min: 1, isInt: true }),
  kernelSize: new PatternFieldSpec({
    default: [3],
    pattern: extractShapePattern,
    deps: ["dimensions"],
    transform: parseArrayFromString,
    transformInto: types.union(types.number, types.array(types.number)),
  }),
  padding: new ChoiceFieldSpec({
    choices: listToMap(["VALID", "SAME", "CAUSAL"]),
    default: "SAME",
  }),
  // filterType: new ChoiceFieldSpec({
  //   choices: { STRIDED: "STRIDED", DILATED: "DILATED" },
  //   default: "STRIDED",
  // }),
  stride: new PatternFieldSpec({
    default: [2],
    pattern: extractShapePattern,
    deps: ["dimensions"],
    transform: parseArrayFromString,
    transformInto: types.union(types.number, types.array(types.number)),
  }),
  dilationRate: new PatternFieldSpec({
    default: [1],
    pattern: extractShapePattern,
    deps: ["dimensions"],
    transform: parseArrayFromString,
    transformInto: types.union(types.number, types.array(types.number)),
  }),
  trainable: new BoolFieldSpec({ default: true }),
};

const replicateIfOne = (initial: number[], len: number) => {
  let v;
  if (initial.length === 1) {
    v = Array(len).fill(initial[0]) as number[];
  } else {
    v = initial;
  }
  return v;
};

export class ConvolutionOp implements OperationI<typeof ConvolutionOpData> {
  NAME: string = "Convolution";
  spec = ConvolutionOpData;

  constructor(
    d: {
      dimensions?: keyof typeof dimensionMap;
      filters?: number;
      kernelSize?: number[];
      padding?: "VALID" | "SAME" | "CAUSAL";
      stride?: number[];
      dilationRate?: number[];
      trainable?: boolean;
      inputs?: OperationModel[];
    } = {}
  ) {
    this.dimensions = d.dimensions ?? ConvolutionOpData.dimensions.default;
    this.filters = d.filters ?? ConvolutionOpData.filters.default;
    this.kernelSize = d.kernelSize ?? ConvolutionOpData.kernelSize.default;
    this.padding = d.padding ?? ConvolutionOpData.padding.default;
    this.stride = d.stride ?? ConvolutionOpData.stride.default;
    this.dilationRate =
      d.dilationRate ?? ConvolutionOpData.dilationRate.default;
    this.trainable = d.trainable ?? ConvolutionOpData.trainable.default;
    this.inputs = d.inputs ? observable.array(d.inputs) : observable.array([]);
  }

  nInputs: number = 1;
  validInput = (op: OperationModel): boolean => {
    return op.data.outputShape.length === dimensionMap[this.dimensions] + 2;
  };

  dimensions: keyof typeof dimensionMap;
  filters: number = ConvolutionOpData.filters.default;
  kernelSize: number[] = ConvolutionOpData.kernelSize.default;
  padding: "VALID" | "SAME" | "CAUSAL" = ConvolutionOpData.padding.default;
  // filterType: "STRIDED" | "DILATED" = ConvolutionOpData.filterType.default;
  stride: number[] = ConvolutionOpData.stride.default;
  dilationRate: number[] = ConvolutionOpData.dilationRate.default;
  trainable: boolean = ConvolutionOpData.trainable.default;

  inputs: IObservableArray<OperationModel>;
  errors = observable.map<keyof typeof ConvolutionOpData, string>();

  get outputShape(): Shape {
    if (this.inputs.length === 0 || this.errors.size > 0) return [];
    const input = this.inputs[0].data.outputShape;
    if (input.length === 0) return [];

    const stride = replicateIfOne(this.stride, dimensionMap[this.dimensions]);

    const result: Shape = [input[0]];
    switch (this.padding) {
      case "CAUSAL":
      case "SAME":
        for (let i = 0; i < stride.length; i++) {
          const v = input[i + 1];
          result.push(v !== undefined ? Math.ceil(v / stride[i]) : undefined);
        }
        break;
      case "VALID": {
        const kernelSize = replicateIfOne(
          this.kernelSize,
          dimensionMap[this.dimensions]
        );
        for (let i = 0; i < stride.length; i++) {
          const v = input[i + 1];
          if (v === undefined) {
            result.push(undefined);
            continue;
          }
          result.push(Math.ceil((v - kernelSize[i] + 1) / stride[i]));
        }
        break;
      }
    }
    return result;
  }
}

decorate(ConvolutionOp, mobxDecorators(ConvolutionOpData));

const DenseOpData = {
  units: new NumFieldSpec({ default: 32, min: 1, isInt: true }),
  useBias: new BoolFieldSpec({ default: true }),
};

export class DenseOp implements OperationI<typeof DenseOpData> {
  spec = DenseOpData;
  NAME = "Dense";

  constructor(
    d: {
      units?: number;
      useBias?: boolean;
      inputs?: OperationModel[];
    } = {}
  ) {
    this.units = d.units ?? DenseOpData.units.default;
    this.useBias = d.useBias ?? DenseOpData.useBias.default;
    this.inputs = d.inputs ? observable.array(d.inputs) : observable.array([]);
  }
  units: number;
  useBias: boolean;

  nInputs = 1;
  validInput = (op: OperationModel): boolean => {
    return op.data.outputShape.length === 2;
  };

  get outputShape(): Shape {
    if (this.inputs.length === 0 || this.errors.size > 0) return [];
    const input = this.inputs[0].data.outputShape;
    if (input.length === 0) return [];
    
    return [input[0], this.units];
  }

  inputs: IObservableArray<OperationModel>;
  errors: ObservableMap<keyof typeof DenseOpData, string> = observable.map();
}

decorate(DenseOp, mobxDecorators(DenseOpData));

enum DType {
  float32 = "float32",
  int32 = "int32",
  bool = "bool",
  complex64 = "complex64",
  string = "string",
}

const InputOpData = {
  shape: new PatternFieldSpec({
    default: [undefined, 10],
    pattern: /(\d+|\?)|\[(\d+|\?)(,\d+)*(,)?\]/,
    transform: parseArrayFromStringWithUndefined,
    transformFrom: (v) => JSON.stringify(v).replace("null", "?"),
    transformInto: types.union(
      types.maybe(types.number),
      types.array(types.maybe(types.number))
    ),
  }),
  dtype: new ChoiceFieldSpec({
    default: "float32",
    choices: listToMap(Object.values(DType)),
  }),
};

export class InputOp implements OperationI<typeof InputOpData> {
  NAME: string = "Input";
  spec = InputOpData;

  constructor(
    d: {
      shape?: (number | undefined)[];
      dtype?: keyof typeof DType;
      inputs?: OperationModel[];
    } = {}
  ) {
    this.shape = d.shape ?? InputOpData.shape.default;
    this.dtype = d.dtype ?? InputOpData.dtype.default;
    this.inputs = d.inputs ? observable.array(d.inputs) : observable.array([]);
  }
  shape: Shape;
  dtype: keyof typeof DType;

  nInputs: number = 0;
  validInput = (_: OperationModel): boolean => {
    return false;
  };

  get outputShape(): Shape {
    return this.shape;
  }

  inputs: IObservableArray<OperationModel>;
  errors: ObservableMap<keyof typeof InputOpData, string> = observable.map();
}

decorate(InputOp, mobxDecorators(InputOpData));

// export const _DenseOp = createOp(
//   "Dense",
//   {
//     units: new NumFieldSpec({ default: 32, min: 1, isInt: true }),
//     useBias: new BoolFieldSpec({ default: true }),
//   },
//   (m) => {
//     return [];
//   }
// );

// export const _ConvolutionOp = createOp(
//   "Convolution",
//   {
//     dimensions: new ChoiceFieldSpec({
//       choices: dimensionMap,
//       default: "1D",
//     }),
//     filters: new NumFieldSpec({ default: 32, min: 1, isInt: true }),
//     kernelSize: (() =>
//       new PatternFieldSpec({
//         default: [3],
//         pattern: extractShapePattern,
//         deps: ["dimensions"],
//         transform: (value: string) => JSON.parse(value),
//         transformInto: types.union(types.number, types.array(types.number)),
//       }))(),
//     padding: new ChoiceFieldSpec({
//       choices: listToMap(["VALID", "SAME", "CAUSAL"]),
//       default: "SAME",
//     }),
//     filterType: new ChoiceFieldSpec({
//       choices: { STRIDED: "STRIDED", DILATED: "DILATED" },
//       default: "STRIDED",
//     }),
//     filter: new PatternFieldSpec({
//       default: [1],
//       pattern: extractShapePattern,
//       deps: ["dimensions"],
//       transform: (value: string) => JSON.parse(value),
//       transformInto: types.union(types.number, types.array(types.number)),
//     }),
//     trainable: new BoolFieldSpec({ default: true }),
//   },
//   (m, l) => {
//     l[0].from.data.outputShape();
//     return [];
//   }
// );

// export const InputOp = createOp(
//   "Input",
//   {
//     shape: new PatternFieldSpec({
//       default: [undefined, 10],
//       pattern: /(\d+|\?)|\[(\d+|\?)(,\d+)+ (,)?\]/,
//       transform: (value: string) =>
//         JSON.parse(value.replace("?", "undefined").replace(",]", "]")),
//       transformInto: types.union(
//         types.maybe(types.number),
//         types.array(types.maybe(types.number))
//       ),
//     }),
//     dtype: new ChoiceFieldSpec({
//       default: "float32",
//       choices: listToMap(Object.values(DType)),
//     }),
//   },
//   (m, b) => {
//     return [];
//   }
// );
