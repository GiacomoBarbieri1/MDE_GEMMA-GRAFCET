import { decorate, IObservableArray, observable, ObservableMap } from "mobx";
import { types } from "mobx-state-tree";
import { ChoiceFieldSpec, PatternFieldSpec } from "../../fields/";
import { listToMap } from "../../utils";
import { Shape } from "../operation";
import { mobxDecorators, OperationI, OperationModel } from "../operation-model";
import { parseArrayFromStringWithUndefined, toPythonStr } from "../operation-utils";

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

  get pythonCode() {
    return `
    tf.keras.Input(
      shape=${toPythonStr(this.shape)}, batch_size=None, name=None, 
      dtype="${this.dtype}", sparse=False, ragged=False
    )
  `;
  }

  inputs: IObservableArray<OperationModel>;
  errors: ObservableMap<keyof typeof InputOpData, string> = observable.map();
}

decorate(InputOp, mobxDecorators(InputOpData));
