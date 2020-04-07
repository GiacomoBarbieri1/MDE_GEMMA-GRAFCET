import { action, observable } from "mobx";
import { ConvolutionOp, DenseOp, InputOp } from "./layers";

type OperationData = ConvolutionOp | DenseOp | InputOp;

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
