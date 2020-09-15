import { observer } from "mobx-react-lite";
import { Resizable } from "re-resizable";
import React from "react";
import { rootStore } from "../App";
import { resizableEnable } from "../utils";
import { PropertiesTable } from "./properties-table";

type Props = {};

export const PropertiesView: React.FC<Props> = observer(() => {
  let inner;
  if (rootStore.selection != null) {
    const operation = rootStore.selection;
    inner = (
      <div
        style={{
          overflow: "auto",
          maxHeight: "100%",
          maxWidth: "100%",
        }}
        key={rootStore.selection.key}
        className="row"
      >
        <div style={{padding: "15px"}}>
          <input
            type="text"
            value={operation.name}
            onInput={(e) => operation.setName(e.currentTarget.value)}
            onChange={() => {}}
          ></input>
          <PropertiesTable model={rootStore.selection} />
        </div>
        <div>
          <pre>{rootStore.selection.data.pythonCode}</pre>
        </div>
      </div>
    );
  } else {
    inner = (
      <div className="row">
        <div className="center">Not Selected</div>
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
