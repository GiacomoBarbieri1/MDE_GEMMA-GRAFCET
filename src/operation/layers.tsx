import { computed, IObservableArray, observable, ObservableMap } from "mobx";
import { types } from "mobx-state-tree";
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

const extractShapePattern = (s: any) =>
  shapeFromDim(dimensionMap[s.dimensions as keyof typeof dimensionMap]);

type OperationI<V extends { [key: string]: FieldSpec }> = {
  [key in keyof V]: ReturnType<V[key]["default"]>;
} & {
  outputShape: Shape;
  inputs: OperationModel[];
  errors: ObservableMap<string, string>;
  spec: V;
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
    transform: (value: string) => JSON.parse(value),
    transformInto: types.union(types.number, types.array(types.number)),
  }),
  padding: new ChoiceFieldSpec({
    choices: listToMap(["VALID", "SAME", "CAUSAL"]),
    default: "SAME",
  }),
  filterType: new ChoiceFieldSpec({
    choices: { STRIDED: "STRIDED", DILATED: "DILATED" },
    default: "STRIDED",
  }),
  filter: new PatternFieldSpec({
    default: [1],
    pattern: extractShapePattern,
    deps: ["dimensions"],
    transform: (value: string) => JSON.parse(value),
    transformInto: types.union(types.number, types.array(types.number)),
  }),
  trainable: new BoolFieldSpec({ default: true }),
};

export class ConvolutionOp implements OperationI<typeof ConvolutionOpData> {
  get spec() {
    return ConvolutionOpData;
  }
  constructor() {}

  @observable
  dimensions: string = ConvolutionOpData.dimensions.default;
  @observable
  filters: number = ConvolutionOpData.filters.default;
  @observable
  kernelSize: number[] = ConvolutionOpData.kernelSize.default;
  @observable
  padding: "VALID" | "SAME" | "CAUSAL" = ConvolutionOpData.padding.default;
  @observable
  filterType: "STRIDED" | "DILATED" = ConvolutionOpData.filterType.default;
  @observable
  filter: number[] = ConvolutionOpData.filter.default;
  @observable
  trainable: boolean = ConvolutionOpData.trainable.default;

  @observable
  inputs: OperationModel[] = [];
  @observable
  errors = observable.map<string, string>();

  @computed
  get outputShape(): Shape {
    return [];
  }
}

const DenseOpData = {
  units: new NumFieldSpec({ default: 32, min: 1, isInt: true }),
  useBias: new BoolFieldSpec({ default: true }),
};

export class DenseOp implements OperationI<typeof DenseOpData> {
  get spec() {
    return DenseOpData;
  }

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

  @observable
  units: number;
  @observable
  useBias: boolean;

  validInput = (op: OperationModel): boolean => {
    return op.data.outputShape.length == 2;
  };

  @computed
  get outputShape(): Shape {
    const input = this.inputs[0];
    if (!input) {
      return [undefined];
    }
    return [input.data.outputShape[0], this.units];
  }

  @observable
  inputs: IObservableArray<OperationModel>;
  @observable
  errors: ObservableMap<keyof typeof DenseOpData, string> = observable.map();
}

enum DType {
  float32 = "float32",
  int32 = "int32",
  bool = "bool",
  complex64 = "complex64",
  string = "string",
}

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
