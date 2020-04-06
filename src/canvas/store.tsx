import { action, IObservableArray, observable, ObservableMap } from "mobx";
import { OperationModel } from "../operation/operation-model";
import { ArrowModel } from "./arrow";

export class RootStoreModel {
  constructor(d: {
    operations: ObservableMap<string, OperationModel>;
    arrows: IObservableArray<ArrowModel>;
  }) {
    this.operations = d.operations;
    this.arrows = d.arrows;
  }
  @observable
  operations: ObservableMap<string, OperationModel>;
  @observable
  arrows: IObservableArray<ArrowModel>;
  @observable
  selection?: OperationModel;

  @action
  selectOperation = (operation: OperationModel) => {
    this.selection = operation;
  };
}

// export const RootStoreModel = types
//   .model("RootStore", {
//     operations: types.map(OperationModel),
//     arrows: types.array(ArrowModel),
//     selection: types.maybeNull(types.reference(OperationModel)),
//   })
//   .actions((self) => ({
//     selectOperation(operation: OperationModelT) {
//       self.selection = operation;
//     },
//   }));

// export interface RootStoreModelI extends Instance<typeof RootStoreModel> {}
