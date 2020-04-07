import { action, IObservableArray, observable, ObservableMap } from "mobx";
import { v4 } from "uuid";
import { OperationData, OperationModel } from "../operation/operation-model";
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
  @observable
  selectingInputFor?: OperationModel;

  @action
  selectOperation = (operation: OperationModel) => {
    this.selection = operation;
  };

  @action
  addOperation = (data: OperationData) => {
    const op = new OperationModel({
      data,
      key: v4(),
      name: data.NAME,
      x: 100,
      y: 100,
    });
    this.operations.set(op.key, op);
  };

  @action
  selectingInput = (operation: OperationModel) => {
    this.selectingInputFor = operation;
    window.addEventListener("keyup", this.selectingInputKeyListener);
  };

  @action
  assignInput = (operation: OperationModel) => {
    this.selectingInputFor!.data.inputs.push(operation);
    this.selectingInputFor = undefined;
  };

  @action
  selectingInputKeyListener = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") {
      this.selectingInputFor = undefined;
      window.removeEventListener("keyup", this.selectingInputKeyListener);
    }
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
