import { observer } from "mobx-react-lite";
import { Resizable } from "re-resizable";
import React from "react";
import { rootStore } from "../App";

type Props = {};

const defaultResizeEnable = {
  top: false,
  right: false,
  bottom: false,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false,
};

function resizableEnable(f: {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  topRight?: boolean;
  bottomRight?: boolean;
  bottomLeft?: boolean;
  topLeft?: boolean;
}) {
  return Object.entries(f).reduce((p, [k, v]) => {
    if (v !== undefined) {
      p[k as keyof typeof defaultResizeEnable] = v;
    }
    return p;
  }, defaultResizeEnable);
}

export const PropertiesView: React.FC<Props> = observer(() => {
  let inner;
  if (rootStore.selection != null) {
    const operation = rootStore.selection;
    inner = (
      <div style={{ overflowY: "auto", maxHeight: "100%" }}>
        <input
          type="text"
          value={operation.name}
          onInput={(e) => operation.setName(e.currentTarget.value)}
          onChange={() => {}}
        ></input>
        {operation.data.form}
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
