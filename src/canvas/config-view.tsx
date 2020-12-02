import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { observer } from "mobx-react-lite";
import { Resizable } from "re-resizable";
import React, { useEffect, useState } from "react";
import { useStore, WarningsDialog } from "../App";
import { NodeModel } from "../node/node-model";
import { resizableEnable } from "../utils";
import { GlobalData } from "./store";

type Props = {};

export const ConfigView: React.FC<Props> = observer(<
  G extends GlobalData<any>
>() => {
  const rootStore = useStore<any, G, any>();
  const [isWarningsDialogOpen, setIsWarningsDialogOpen] = useState<
    "XML" | "TXT" | undefined
  >(undefined);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isCodesysVersionOpen, setIsCodesysVersionOpen] = useState(false);
  const [anchorElem, setAnchorElem] = useState<HTMLButtonElement | null>(null);

  const ops = [...rootStore.nodes.values()];
  const connections = ops.reduce((p, c) => {
    c.inputs.forEach((v) => {
      let m = p.get(v.to);
      if (m === undefined) {
        m = [];
        p.set(v.to, m);
      }
      m.push(c);
    });
    return p;
  }, new Map<NodeModel<any, any, any>, NodeModel<any, any, any>[]>());

  const orderedOps: NodeModel<any, any, any>[] = [];
  const counts = new Map(
    ops
      .filter((op) => {
        const withDependencies = op.data.length !== 0;
        if (!withDependencies) {
          orderedOps.push(op);
        }
        return withDependencies;
      })
      .map((op) => [op, op.data.length])
  );
  let numProcessed = 0;
  while (counts.size !== 0 && orderedOps.length !== numProcessed) {
    for (let k of orderedOps.slice(numProcessed)) {
      numProcessed += 1;
      const outs = connections.get(k);
      if (outs === undefined) continue;

      for (let dep of outs) {
        const m = counts.get(dep)!;
        if (m === 1) {
          counts.delete(dep);
          orderedOps.push(dep);
        } else {
          counts.set(dep, m - 1);
        }
      }
    }
  }

  if (counts.size !== 0) {
    // CICLE ?
  }

  const toggleDownloadMenu = () => {
    setIsDownloadMenuOpen(!isDownloadMenuOpen);
  };

  const toggleCodesysVersion = () => {
    setIsCodesysVersionOpen(!isCodesysVersionOpen);
  };

  const tryDownload = (format: "XML" | "TXT") => () => {
    if (format === "XML" && rootStore.codesysVersion === null) {
      toggleCodesysVersion();
      return;
    }
    const hasWarnings = Object.values(rootStore.globalData.warnings).some(
      (v) => v.length > 0
    );
    if (hasWarnings) {
      setIsWarningsDialogOpen(format);
    } else {
      rootStore.downloadSourceCode(format);
    }
    toggleDownloadMenu();
  };

  return (
    <Resizable
      minWidth={200}
      defaultSize={{ height: "auto", width: 350 }}
      style={{
        position: "relative",
        background: "white",
        boxShadow: "0 1px 4px 1px #eee",
        border: "1px solid #eee",
      }}
      enable={resizableEnable({ left: true })}
    >
      <div className="col" style={{ height: "100%" }}>
        <div style={{ borderBottom: "rgb(221 220 220) solid 1.5px" }}>
          <Button
            onClick={toggleDownloadMenu}
            ref={(ref) => {
              if (ref !== null) {
                setAnchorElem(ref);
              }
            }}
          >
            Download Code
          </Button>
          <Menu
            anchorEl={anchorElem}
            keepMounted
            open={isDownloadMenuOpen}
            onClose={toggleDownloadMenu}
          >
            <MenuItem
              onClick={tryDownload("XML")}
              style={{ paddingTop: "1px", paddingBottom: "1px" }}
            >
              PLCopen XML
              {rootStore.codesysVersion !== null && (
                <div
                  className="col"
                  style={{ fontSize: "0.7em", paddingLeft: "10px" }}
                >
                  <div>CodeSys version</div>
                  <div
                    className="row"
                    style={{ justifyContent: "space-between" }}
                  >
                    {rootStore.codesysVersion}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCodesysVersion();
                      }}
                      style={{ fontSize: "0.8em" }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </MenuItem>
            <MenuItem onClick={tryDownload("TXT")}>Text Files</MenuItem>
          </Menu>
          <CodesysVesionDialog
            open={isCodesysVersionOpen}
            toggleDialog={toggleCodesysVersion}
            accept={(version: string) => {
              rootStore.setCodesysVersion(version);
              toggleCodesysVersion();
              tryDownload("XML")();
            }}
          />
          <WarningsDialog
            open={isWarningsDialogOpen !== undefined}
            toggleDialog={() => setIsWarningsDialogOpen(undefined)}
            warnings={rootStore.globalData.warnings}
            accept={() => rootStore.downloadSourceCode(isWarningsDialogOpen!)}
          />
        </div>
        <div
          style={{
            overflow: "auto",
            height: "100%",
            padding: "0 10px",
            flex: 1,
          }}
        >
          <pre>{rootStore.globalData.generateMainFile}</pre>
        </div>
      </div>
    </Resizable>
  );
});

export const CodesysVesionDialog = ({
  open,
  toggleDialog,
  accept,
}: {
  open: boolean;
  toggleDialog: () => void;
  accept: (version: string) => void;
}) => {
  const [version, setVersion] = useState("");
  const [versionInput, setVersionInput] = useState<HTMLElement | null>(null);
  const [error, setError] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);

  useEffect(() => {
    if (open && !prevOpen) {
      setError("");
    }
    if (open !== prevOpen) {
      setPrevOpen(open);
    }
  }, [open, prevOpen]);

  const updateError = (version: string) => {
    const hasError = version.match("^[0-9]+.[0-9]+.[0-9]+.[0-9]+$") === null;
    if (hasError) {
      setError("Should be 4 numbers separated by points, e.g. 3.5.9.40");
    } else {
      setError("");
    }
    return hasError;
  };
  const send = () => {
    if (updateError(version)) {
      versionInput?.focus();
    } else {
      accept(version);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={toggleDialog}
      keepMounted
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle id="alert-dialog-slide-title">CoDeSys Version</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          We require your CoDeSys version to export the project as a PLCopen
          XML. It can be found in the 'Help' - 'Information' toolbar menu in
          CoDeSys.
          <br />
          <br />
          Example:
          <br />
          3.5.11.30 = CODESYS V3.5 SP11 Patch 3
        </DialogContentText>
        <div className="col">
          <TextField
            type="text"
            value={version}
            onChange={(e) => {
              const value = e.target.value.replace(/(\s|[a-zA-Z])/g, "");
              if (error.length !== 0) {
                updateError(value);
              }
              setVersion(value);
            }}
            style={{ width: "180px" }}
            label="CoDeSys version"
            helperText={
              error.length !== 0 ? error : "4 integers separeted by points"
            }
            error={error.length !== 0}
            inputRef={(ref) => {
              if (ref !== null) {
                ref.focus();
                setVersionInput(ref);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                send();
              }
            }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={toggleDialog} color="primary">
          Close
        </Button>
        <Button onClick={send} color="primary">
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};
