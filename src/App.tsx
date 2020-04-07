import { observable } from "mobx";
import React from "react";
import { MainCanvas } from "./canvas/canvas";
import { RootStoreModel } from "./canvas/store";
import { MainMenu } from "./graph-menu/main-menu";
import { ConvolutionOp, DenseOp } from "./operation/layers";
import { OperationModel } from "./operation/operation-model";
import { PropertiesView } from "./properties/properties-view";

// Regularizer, Constraint, Initializer,
// dilationRate (number|[number]|[number, number]|[number, number, number])
// The dilation rate to use for the dilated convolution in each dimension.
// Should be an integer or array of two or three integers.

// strides (number|number[]) The strides of the convolution in each dimension.
// If strides is a number, strides in both dimensions are equal.
// Specifying any stride value != 1 is incompatible with specifying any dilationRate value != 1.

const conv1 = new OperationModel({
  key: "conv1",
  name: "Conv 1",
  x: 350,
  y: 300,
  data: new ConvolutionOp(),
});

const dense1 = new OperationModel({
  key: "dense1",
  name: "Dense 1",
  x: 100,
  y: 100,
  data: new DenseOp({ inputs: [conv1] }),
});

const dense2 = new OperationModel({
  key: "dense2",
  name: "Dense 2",
  x: 150,
  y: 350,
  data: new DenseOp({ inputs: [conv1, dense1] }),
});

export const rootStore = new RootStoreModel({
  operations: observable.map({
    dense1,
    conv1,
    dense2,
  }),
  arrows: observable.array([]),
});

export function App() {
  return (
    <div
      className="row"
      style={{ background: "rgba(250,250,250,0.7)", height: "100%" }}
    >
      <MainMenu />
      <div
        className="col"
        style={{ width: "100%", background: "rgba(250,250,250,0.7)" }}
      >
        <MainCanvas />
        <PropertiesView />
      </div>
    </div>
  );
}
