import { Instance, types } from "mobx-state-tree";
import { ConvolutionOp, DenseOp } from "./layers";

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
