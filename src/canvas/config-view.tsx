import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { observer } from "mobx-react-lite";
import { Resizable } from "re-resizable";
import React, { useState } from "react";
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

  const tryDownload = (format: "XML" | "TXT") => () => {
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
            <MenuItem onClick={tryDownload("XML")}>Open XML</MenuItem>
            <MenuItem onClick={tryDownload("TXT")}>Text Files</MenuItem>
          </Menu>
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
