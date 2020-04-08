import { decorate, IObservableArray, observable, ObservableMap } from "mobx";
import { BoolFieldSpec, NumFieldSpec } from "../../fields/";
import { Shape } from "../operation";
import { mobxDecorators, OperationI, OperationModel } from "../operation-model";
import { toPythonStr } from "../operation-utils";

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

  get pythonCode() {
    return `
    tf.keras.layers.Dense(
      ${this.units}, activation=None, use_bias=${toPythonStr(this.useBias)}, 
      kernel_initializer='glorot_uniform',
      bias_initializer='zeros', kernel_regularizer=None, 
      bias_regularizer=None, activity_regularizer=None, 
      kernel_constraint=None, bias_constraint=None,
    )
  `;
  }

  inputs: IObservableArray<OperationModel>;
  errors: ObservableMap<keyof typeof DenseOpData, string> = observable.map();
}

decorate(DenseOp, mobxDecorators(DenseOpData));
