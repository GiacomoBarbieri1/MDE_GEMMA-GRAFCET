import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContentText from "@material-ui/core/DialogContentText";
import React, { useCallback, useState } from "react";
import { MainCanvas } from "./canvas/canvas";
import { ConfigView } from "./canvas/config-view";
import { createIndexedDB, IndexedDB } from "./canvas/persistence";
import { RootStoreModel, GlobalData, GraphWarnings } from "./canvas/store";
import { NodeData, ConnectionData } from "./node/node-model";
import { PropertiesView } from "./properties/properties-view";
import { gemmaBuilders, makeBaseGemmaTemplate } from "./step/gemma";
import { importJson } from "./utils";
import { observer } from "mobx-react-lite";

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
  (window as any).store = store;
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
            hideOnDelete: true,
            builders: gemmaBuilders,
          });
        } else {
          _store = makeBaseGemmaTemplate(db);
        }
        setStore(_store);
      });
    } else if (store.resetStore) {
      setStore(null);
    }
  }, [store, _isReset]);

  if (!store) {
    return <div className="center">Loading...</div>;
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
            <div className="col" style={{ flex: 1 }}>
              <TopMenu store={store} globalDB={globalDB!} setStore={setStore} />
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

const ToggleShowHidden = observer(({ store }: { store: RootStore }) => (
  <Button
    onClick={(_) => {
      store.showHidden = !store.showHidden;
    }}
  >
    {store.showHidden ? "Hide Deleted" : "Show Deleted"}
  </Button>
));

function TopMenu<
  D extends NodeData<D, G, C>,
  G extends GlobalData<D>,
  C extends ConnectionData<D>
>({
  store,
  setStore,
  globalDB,
}: {
  store: RootStoreModel<D, G, C>;
  globalDB: IndexedDB;
  setStore: (store: RootStore) => void;
}) {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isWarningsDialogOpen, setIsWarningsDialogOpen] = useState(false);
  const toggleDialog = useCallback(() => {
    setIsResetDialogOpen(!isResetDialogOpen);
  }, [isResetDialogOpen]);

  return (
    <div
      className="row"
      style={{
        justifyContent: "space-between",
        borderBottom: "rgb(221 220 220) solid 1.5px",
      }}
    >
      <ToggleShowHidden store={store} />
      <div
        className="row"
        style={{
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={(_) => {
            store.saveModel();
          }}
        >
          Save
        </Button>
        <Button onClick={toggleDialog}>Reset</Button>
        <Dialog
          open={isResetDialogOpen}
          onClose={toggleDialog}
          keepMounted
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">
            Reset Diagram State
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Are you sure you want to reset the diagram state? All changes will
              be lost.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleDialog} color="primary">
              Close
            </Button>
            <Button
              onClick={async (_) => {
                const _store = makeBaseGemmaTemplate(globalDB);
                setStore(_store);
                toggleDialog();
              }}
              color="primary"
            >
              Reset Diagram
            </Button>
          </DialogActions>
        </Dialog>
        <Button
          onClick={(_) => {
            const hasWarnings = Object.values(store.globalData.warnings).some(
              (v) => v.length > 0
            );
            if (hasWarnings) {
              setIsWarningsDialogOpen(true);
            } else {
              store.downloadModel();
            }
          }}
        >
          Export
        </Button>
        <WarningsDialog
          open={isWarningsDialogOpen}
          toggleDialog={() => setIsWarningsDialogOpen(!isWarningsDialogOpen)}
          warnings={store.globalData.warnings}
          accept={store.downloadModel}
        />
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
                    db: globalDB,
                    json: val,
                    builders: gemmaBuilders,
                    hideOnDelete: true,
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
    </div>
  );
}

export const WarningsDialog = ({
  open,
  toggleDialog,
  warnings,
  accept,
}: {
  open: boolean;
  toggleDialog: () => void;
  warnings: GraphWarnings;
  accept: () => void;
}) => {
  return (
    <Dialog
      open={open}
      onClose={toggleDialog}
      keepMounted
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle id="alert-dialog-slide-title">Download Diagram</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          There are some warnings in the diagram configuration. Do you want to
          continue with the download?
        </DialogContentText>
        {Object.entries(warnings).map(([title, warnings]) => {
          if (warnings.length === 0) {
            return <div key={title}></div>;
          }
          return (
            <div key={title} className="warning-list">
              <h3>{title}</h3>
              <ul>
                {warnings[0].length === 2 && Array.isArray(warnings[0][1])
                  ? (warnings as [string, string[]][]).map(
                      ([sectionTitle, warnings], index) => (
                        <div key={sectionTitle}>
                          <h5>{sectionTitle}</h5>
                          {warnings.map((w, index) => (
                            <li key={`${sectionTitle}${index}`}>{w}</li>
                          ))}
                        </div>
                      )
                    )
                  : (warnings as string[]).map((w, index) => (
                      <li key={`${title}${index}`}>{w}</li>
                    ))}
              </ul>
            </div>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={toggleDialog} color="primary">
          Close
        </Button>
        <Button onClick={accept} color="primary">
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};
