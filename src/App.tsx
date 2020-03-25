import React from "react";
import { MainCanvas } from "./canvas/canvas";
import { PropertiesView } from "./canvas/properties-view";
import { RootStoreModel } from "./canvas/store";
import { MainMenu } from "./graph-menu/main-menu";
import { DenseOp } from "./operation/operation";

// Regularizer, Constraint, Initializer,
// dilationRate (number|[number]|[number, number]|[number, number, number])
// The dilation rate to use for the dilated convolution in each dimension.
// Should be an integer or array of two or three integers.

// strides (number|number[]) The strides of the convolution in each dimension.
// If strides is a number, strides in both dimensions are equal.
// Specifying any stride value != 1 is incompatible with specifying any dilationRate value != 1.

export const rootStore = RootStoreModel.create({
  operations: {
    "ce9131ee-f528-4952-a012-543780c5e66d": {
      key: "ce9131ee-f528-4952-a012-543780c5e66d",
      name: "Rotterdam",
      x: 100,
      y: 100,
      data: DenseOp.create({ units: 23, useBias: true })
    },
    "14194d76-aa31-45c5-a00c-104cc550430f": {
      key: "14194d76-aa31-45c5-a00c-104cc550430f",
      name: "Bratislava",
      x: 350,
      y: 300,
      data: {
        OP_TYPE: "Convolution",
        filter: [1],
        padding: "SAME",
        kernelSize: 3
      }
    },
    "24194d76-aa31-45c5-a00c-104cc550430f": {
      key: "24194d76-aa31-45c5-a00c-104cc550430f",
      name: "Borneo",
      x: 150,
      y: 350,
      data: {
        OP_TYPE: "Dense",
        units: 24,
        useBias: false
      }
    }
  },
  arrows: [
    {
      key: "7b5d33c1-5e12-4278-b1c5-e4ae05c036bd",
      from: "ce9131ee-f528-4952-a012-543780c5e66d",
      to: "14194d76-aa31-45c5-a00c-104cc550430f",
      shape: [2, 4]
    },
    {
      key: "6b5d33c1-5e12-4278-b1c5-e4ae05c036bd",
      from: "ce9131ee-f528-4952-a012-543780c5e66d",
      to: "24194d76-aa31-45c5-a00c-104cc550430f",
      shape: [undefined, 80]
    },
    {
      key: "5b5d33c1-5e12-4278-b1c5-e4ae05c036bd",
      from: "24194d76-aa31-45c5-a00c-104cc550430f",
      to: "14194d76-aa31-45c5-a00c-104cc550430f",
      shape: [undefined, 20, 5]
    }
  ],
  selection: null
});
console.log(rootStore.operations.get("24194d76-aa31-45c5-a00c-104cc550430f"));

export function App() {
  return (
    <div className="row" style={{ background: "rgba(250,250,250,0.7)" }}>
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
