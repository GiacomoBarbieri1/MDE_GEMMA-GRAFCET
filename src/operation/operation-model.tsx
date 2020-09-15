import { action, computed, IObservableArray, observable, ObservableMap } from "mobx";
import { SnapshotIn } from "mobx-state-tree";
import { FieldSpec } from "../fields/";
import { ConvolutionOp } from "./layers/convolution";
import { DenseOp } from "./layers/dense";
import { InputOp } from "./model/input";
import { Shape } from "./operation";

export type OperationData = ConvolutionOp | DenseOp | InputOp;

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

export const mobxDecorators = <V extends { [key: string]: FieldSpec }>(
  spec: V
) => {
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

export class OperationModel {
  constructor(d: {
    key: string;
    name: string;
    x: number;
    y: number;
    data: OperationData;
  }) {
    this.key = d.key;
    this.name = d.name;
    this.x = d.x;
    this.y = d.y;
    this.data = d.data;
  }

  @observable
  key: string;
  @observable
  name: string;
  @observable
  x: number;
  @observable
  y: number;
  @observable
  width: number = 60;
  @observable
  height: number = 60;
  @observable
  data: OperationData;

  @action
  move = (dx: number, dy: number) => {
    this.x += dx;
    this.y += dy;
  };
  @action
  setSize = (rect: DOMRect) => {
    this.width = rect.width;
    this.height = rect.height;
  };
  @action
  setName = (name: string) => {
    this.name = name;
  };
}

// export const OperationModel = types
//   .model("Operation", {
//     key: types.identifier,
//     name: types.string,
//     x: types.number,
//     y: types.number,
//     width: types.maybe(types.number),
//     height: types.maybe(types.number),
//     data: types.union(ConvolutionOp, DenseOp),
//   })
//   .actions((self) => ({
//     move(dx: number, dy: number) {
//       self.x += dx;
//       self.y += dy;
//     },
//     setSize(rect: DOMRect) {
//       self.width = rect.width;
//       self.height = rect.height;
//     },
//     setName(name: string) {
//       self.name = name;
//     },
//   }));

// export interface OperationModelT extends Instance<typeof OperationModel> {}
