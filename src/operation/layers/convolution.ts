import { decorate, IObservableArray, observable } from "mobx";
import { types } from "mobx-state-tree";
import { BoolFieldSpec, ChoiceFieldSpec, NumFieldSpec, PatternFieldSpec } from "../../fields/";
import { listToMap } from "../../utils";
import { Shape } from "../operation";
import { mobxDecorators, OperationI, OperationModel } from "../operation-model";
import { dimensionMap, extractShapePattern, parseArrayFromString, replicateIfOne, toPythonStr } from "../operation-utils";

const ConvolutionOpData = {
  dimensions: new ChoiceFieldSpec({
    choices: dimensionMap,
    default: "1D",
  }),
  separable: new BoolFieldSpec({ default: true }),
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
  strides: new PatternFieldSpec({
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
  depthMultiplier: new NumFieldSpec({ default: 1, min: 0.1, step: 0.1 }),
  useBias: new BoolFieldSpec({ default: true }),
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
      strides?: number[];
      dilationRate?: number[];
      trainable?: boolean;
      separable?: boolean;
      depthMultiplier?: number;
      inputs?: OperationModel[];
    } = {}
  ) {
    this.dimensions = d.dimensions ?? ConvolutionOpData.dimensions.default;
    this.filters = d.filters ?? ConvolutionOpData.filters.default;
    this.kernelSize = d.kernelSize ?? ConvolutionOpData.kernelSize.default;
    this.padding = d.padding ?? ConvolutionOpData.padding.default;
    this.strides = d.strides ?? ConvolutionOpData.strides.default;
    this.dilationRate =
      d.dilationRate ?? ConvolutionOpData.dilationRate.default;
    this.useBias = d.trainable ?? ConvolutionOpData.useBias.default;
    this.inputs = d.inputs ? observable.array(d.inputs) : observable.array([]);
    this.separable = d.separable ?? ConvolutionOpData.useBias.default;
    this.depthMultiplier =
      d.depthMultiplier ?? ConvolutionOpData.depthMultiplier.default;
  }

  nInputs: number = 1;
  validInput = (op: OperationModel): boolean => {
    return op.data.outputShape.length === dimensionMap[this.dimensions] + 2;
  };

  depthMultiplier: number;
  separable: boolean;
  dimensions: keyof typeof dimensionMap;
  filters: number;
  kernelSize: number[];
  padding: "VALID" | "SAME" | "CAUSAL";
  strides: number[];
  dilationRate: number[];
  useBias: boolean;

  inputs: IObservableArray<OperationModel>;
  errors = observable.map<keyof typeof ConvolutionOpData, string>();

  get pythonCode() {
    return `
    tf.keras.layers.${this.separable ? "Separable" : ""}Conv${this.dimensions}(
      ${this.filters}, ${toPythonStr(this.kernelSize)}, strides=${toPythonStr(
      this.strides
    )},
      padding="${this.padding}", dilation_rate=${toPythonStr(
      this.dilationRate
    )}, 
      activation=None, use_bias=${toPythonStr(this.useBias)},${
      this.separable ? "\n      depth_multiplier=" + this.depthMultiplier : ""
    }
      kernel_initializer='glorot_uniform', 
      bias_initializer='zeros',
      kernel_regularizer=None, bias_regularizer=None, 
      activity_regularizer=None,
      kernel_constraint=None, bias_constraint=None,
    )
  `;
  }

  get outputShape(): Shape {
    if (this.inputs.length === 0 || this.errors.size > 0) return [];
    const input = this.inputs[0].data.outputShape;
    if (input.length === 0) return [];

    const strides = replicateIfOne(this.strides, dimensionMap[this.dimensions]);

    const result: Shape = [input[0]];
    switch (this.padding) {
      case "CAUSAL":
      case "SAME":
        for (let i = 0; i < strides.length; i++) {
          const v = input[i + 1];
          result.push(v !== undefined ? Math.ceil(v / strides[i]) : undefined);
        }
        break;
      case "VALID": {
        const kernelSize = replicateIfOne(
          this.kernelSize,
          dimensionMap[this.dimensions]
        );
        for (let i = 0; i < strides.length; i++) {
          const v = input[i + 1];
          if (v === undefined) {
            result.push(undefined);
            continue;
          }
          result.push(Math.ceil((v - kernelSize[i] + 1) / strides[i]));
        }
        break;
      }
    }
    return result;
  }
}

decorate(ConvolutionOp, mobxDecorators(ConvolutionOpData));
