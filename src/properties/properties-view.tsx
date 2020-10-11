import { observer } from "mobx-react-lite";
import { Resizable } from "re-resizable";
import React from "react";
import { resizableEnable } from "../utils";
import { PropertiesTableNode } from "./properties-table";
import { useStore } from "../App";
import IconButton from "@material-ui/core/IconButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./properties-view.css";

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
          justifyContent: "space-around",
          backgroundColor: "#fafafa",
          display: "flex",
        }}
        className="row"
      >
        <div className="properties-view" key="node-properties">
          <div
            className="row"
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <h2 style={{ margin: "5px 0px 10px" }}>
              {`Step: ${selectedNode.name}`}
            </h2>
            <IconButton onClick={(e) => rootStore.removeNode(selectedNode)}>
              <FontAwesomeIcon icon={"trash-alt"} color={"#000"} />
            </IconButton>
          </div>
          <PropertiesTableNode self={rootStore.selectedNode} />
        </div>
        <div className="properties-view" key="connection-properties">
          {selectedConnection !== undefined && (
            <div className="col">
              <div
                className="row"
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2 style={{ margin: "5px 0px 10px" }}>
                  {`Transition: ${selectedConnection.from.name} -> ${selectedConnection.to.name}`}
                </h2>
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
        <div
          style={{ minWidth: "270px" }}
          className="properties-view"
          key="graph-properties"
        >
          <rootStore.globalData.View />
        </div>
      </div>
    );
  } else {
    inner = (
      <div style={{ width: "150px" }} className="row">
        <div style={{ width: "150px" }} className="center">
          Not selected
        </div>
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
