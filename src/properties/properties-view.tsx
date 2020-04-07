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
        style={{ overflowY: "auto", maxHeight: "100%" }}
        key={rootStore.selection.key}
      >
        <input
          type="text"
          value={operation.name}
          onInput={(e) => operation.setName(e.currentTarget.value)}
          onChange={() => {}}
        ></input>
        <PropertiesTable
          self={rootStore.selection.data}
        />
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
      style={{
        position: "relative",
        background: "white",
        boxShadow: "0 1px 4px 1px #eee",
        padding: "15px",
        borderRadius: "6px 6px 0 0",
        border: "1px solid #eee",
        margin: "0 10px",
      }}
      enable={resizableEnable({ top: true })}
    >
      {inner}
    </Resizable>
  );
});
