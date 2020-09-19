import React from "react";
import { MainCanvas } from "./canvas/canvas";
import { ConfigView } from "./canvas/config-view";
import { RootStoreModel, GlobalData, ConnectionData } from "./canvas/store";
import { MainMenu } from "./graph-menu/main-menu";
import { NodeData } from "./node/node-model";
import { PropertiesView } from "./properties/properties-view";
import { make5NodesGraph } from "./step/gemma";

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

const rootStore = make5NodesGraph();

export function App() {
  return (
    <storeContext.Provider value={rootStore}>
      <div
        className="row"
        style={{ background: "rgba(250,250,250,0.7)", height: "100%" }}
      >
        <div className="col">
          <MainMenu items={Object.keys(rootStore.builders.nodeBuilder)} />
        </div>
        <div
          className="col"
          style={{
            width: "0px",
            background: "rgba(250,250,250,0.7)",
            flex: "1 0 auto",
          }}
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
