import { observable } from "mobx";
import React from "react";
import { MainCanvas } from "./canvas/canvas";
import { ConfigView } from "./canvas/config-view";
import { RootStoreModel, GlobalData, ConnectionData } from "./canvas/store";
import { MainMenu } from "./graph-menu/main-menu";
import { NodeModel, NodeData, ConnModel } from "./node/node-model";
import { PropertiesView } from "./properties/properties-view";
import {
  GemmaGraphcet,
  ProcedureType,
  Transition,
  Step,
  Condition,
  gemmaBuilders,
  StepType,
} from "./step/gemma";

const rootStore = new RootStoreModel<Step, GemmaGraphcet, Transition>({
  builders: gemmaBuilders,
});

const s1 = rootStore.addNode(StepType.INITIAL, { x: 72, y: 60 });
const s2 = rootStore.addNode(StepType.MACRO, { x: 261, y: 170 });

const _t = new ConnModel(
  s1!,
  s2!,
  (c) =>
    new Transition(c, {
      name: "Emergency",
      condition: new Condition("I1 & I2"),
    })
);
rootStore.globalData.workingFamilyTransitions.push(_t.data);

[
  s1,
  s2,
  rootStore.addNode(StepType.ENCLOSING, { x: 441, y: 316 }),
  rootStore.addNode(StepType.SIMPLE, { x: 211, y: 410 }),
  rootStore.addNode(StepType.SIMPLE, { x: 441, y: 500 }),
].forEach((s, index) => s?.setName(`S${index + 1}`));

s1!.data.family = ProcedureType.A;
s2!.data.family = ProcedureType.D;

export const storeContext = React.createContext<RootStoreModel<
  any,
  any,
  any
> | null>(null);

export function useStore<
  D extends NodeData<D, G, C>,
  G extends GlobalData<D>,
  C extends ConnectionData<D>
>() {
  const store = React.useContext<RootStoreModel<D, G, C> | null>(storeContext);
  if (!store) {
    throw Error("useStore should be used inside a Store provider.");
  }
  return store;
}

export function App() {
  return (
    <storeContext.Provider value={rootStore}>
      <div
        className="row"
        style={{ background: "rgba(250,250,250,0.7)", height: "100%" }}
      >
        <MainMenu items={Object.keys(rootStore.builders.nodeBuilder)} />
        <div
          className="col"
          style={{ width: "100%", background: "rgba(250,250,250,0.7)" }}
        >
          <div className="row" style={{ minHeight: 0, flex: 1 }}>
            <MainCanvas />
            <ConfigView />
          </div>
          <PropertiesView />
        </div>
      </div>
    </storeContext.Provider>
  );
}
