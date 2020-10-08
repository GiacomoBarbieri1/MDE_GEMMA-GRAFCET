import Button from "@material-ui/core/Button";
import React from "react";
import { MainCanvas } from "./canvas/canvas";
import { ConfigView } from "./canvas/config-view";
import { createIndexedDB, IndexedDB } from "./canvas/persistence";
import { RootStoreModel, GlobalData } from "./canvas/store";
import { NodeData, ConnectionData } from "./node/node-model";
import { PropertiesView } from "./properties/properties-view";
import { gemmaBuilders, makeBaseGemmaTemplate } from "./step/gemma";
import { importJson } from "./utils";

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

type RootStore = RootStoreModel<any, any, any>;

export function App() {
  const [globalDB, setDB] = React.useState<IndexedDB | null>(null);
  const [store, setStore] = React.useState<RootStore | null>(null);
  const _isReset = store && store.resetStore;
  React.useEffect(() => {
    if (!store) {
      createIndexedDB().then(async (db) => {
        setDB(db);
        const graphs = await db.fetchGraphs();

        let _store: RootStore;
        const graph = graphs[0];
        if (graph !== undefined) {
          const graphExt = await db.loadGraph(graph.key);
          _store = new RootStoreModel({
            db,
            json: { graph, ...graphExt },
            builders: gemmaBuilders,
          });
        } else {
          _store = makeBaseGemmaTemplate(db);
        }

        (window as any).store = _store;
        setStore(_store);
      });
    } else if (store.resetStore) {
      setStore(null);
    }
  }, [store, _isReset]);

  if (!store) {
    return <div className="center">Cargando...</div>;
  }

  return (
    <storeContext.Provider value={store}>
      <div
        className="row"
        style={{ background: "rgba(250,250,250,0.7)", height: "100%" }}
      >
        {/* <div className="col">
          <MainMenu items={Object.keys(rootStore.builders.nodeBuilder)} />
        </div> */}
        <div
          className="col"
          style={{
            width: "0px",
            background: "rgba(250,250,250,0.7)",
            flex: "1 0 auto",
          }}
        >
          <div className="row" style={{ minHeight: 0, flex: 1 }}>
            <div className="col">
              <div className="row" style={{ justifyContent: "flex-end" }}>
                <Button
                  onClick={(e) => {
                    store.saveModel();
                  }}
                >
                  Save
                </Button>
                <Button
                  onClick={(e) => {
                    store.downloadModel();
                  }}
                >
                  Export
                </Button>
                <Button>
                  <label
                    htmlFor="import-file-input"
                    style={{ margin: 0, width: "100%", cursor: "pointer" }}
                  >
                    Import
                  </label>
                  <input
                    type="file"
                    id="import-file-input"
                    accept="application/json"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const json = await importJson(e);
                      if (typeof json === "string") {
                        try {
                          const val = JSON.parse(json);
                          const _store = new RootStoreModel({
                            db: globalDB!,
                            json: val,
                            builders: gemmaBuilders,
                          });
                          setStore(_store);
                        } catch (e) {
                          console.log(e);
                        }
                      }
                    }}
                  />
                </Button>
              </div>
              <MainCanvas />
            </div>
            <ConfigView />
          </div>
          <PropertiesView />
        </div>
      </div>
    </storeContext.Provider>
  );
}
