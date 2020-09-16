import { observer } from "mobx-react-lite";
import { Resizable } from "re-resizable";
import React from "react";
import { resizableEnable } from "../utils";
import { PropertiesTableNode } from "./properties-table";
import { useStore } from "../App";
import IconButton from "@material-ui/core/IconButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TextField from "@material-ui/core/TextField";

type Props = {};

export const PropertiesView: React.FC<Props> = observer(() => {
  const rootStore = useStore();
  let inner;
  if (rootStore.selectedNode != null) {
    const selectedNode = rootStore.selectedNode;
    const selectedConnection = rootStore.selectedConnection;
    inner = (
      <div
        style={{
          overflow: "auto",
          maxHeight: "100%",
          maxWidth: "100%",
        }}
        key={rootStore.selectedNode.key}
        className="row"
      >
        <div style={{ padding: "15px" }}>
          <div
            className="row"
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <TextField
              type="text"
              value={selectedNode.name}
              onChange={(e) => selectedNode.setName(e.target.value)}
              style={{ width: "150px" }}
            ></TextField>
            <IconButton onClick={(e) => rootStore.removeNode(selectedNode)}>
              <FontAwesomeIcon icon={"trash-alt"} color={"#000"} />
            </IconButton>
          </div>
          <PropertiesTableNode self={rootStore.selectedNode} />
        </div>
        <div style={{ padding: "15px" }}>
          {selectedConnection !== undefined && (
            <div className="col">
              <div
                className="row"
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>{`${selectedConnection.from.name} -> ${selectedConnection.to.name}`}</div>
                <IconButton
                  onClick={(e) =>
                    rootStore.removeConnection(selectedConnection)
                  }
                >
                  <FontAwesomeIcon icon={"trash-alt"} color={"#000"} />
                </IconButton>
              </div>
              <selectedConnection.data.ConnectionView />
            </div>
          )}
        </div>
      </div>
    );
  } else {
    inner = (
      <div style={{ width: "150px" }} className="center">
        Not Selected
      </div>
    );
  }

  return (
    <Resizable
      minHeight={200}
      defaultSize={{ height: 280, width: "auto" }}
      style={{
        position: "relative",
        background: "white",
        boxShadow: "0 1px 4px 1px #eee",
        border: "1px solid #eee",
      }}
      enable={resizableEnable({ top: true })}
    >
      {inner}
    </Resizable>
  );
});
