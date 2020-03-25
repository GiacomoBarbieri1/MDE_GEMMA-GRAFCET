import { Instance, types } from "mobx-state-tree";
import { OperationModel, OperationModelT } from "../operation/operation-model";
import { ArrowModel } from "./arrow";

export const RootStoreModel = types
  .model("RootStore", {
    operations: types.map(OperationModel),
    arrows: types.array(ArrowModel), 
    selection: types.maybeNull(types.reference(OperationModel))
  })
  .actions(self => ({
    selectOperation(operation: OperationModelT) {
      self.selection = operation;
    }
  }));
export type StoreModelT = Instance<typeof RootStoreModel>;



