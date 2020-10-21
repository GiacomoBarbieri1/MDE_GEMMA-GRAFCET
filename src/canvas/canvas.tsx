import { observer } from "mobx-react-lite";
import React from "react";
import { useStore } from "../App";
import { ArrowView } from "./arrow";

type Props = {};

export const MainCanvas: React.FC<Props> = observer(() => {
  const rootStore = useStore();
  const ops = [...rootStore.nodes.values()];
  return (
    <div style={{ overflow: "auto", flex: "1" }}>
      <div
        style={{
          position: "relative",
          border: "1px solid #eee",
          background: "#fff",
          margin: "10px",
          borderRadius: "6px",
          flex: 1,
          height: "1000px",
          width: "1200px",
        }}
      >
        <rootStore.globalData.CanvasView/>
        <svg style={{ width: "100%", height: "100%", position: "absolute" }}>
          {ops
            .flatMap((op) => op.inputs)
            .map((connection) => (
              <ArrowView
                connection={connection}
                key={connection.from.key + connection.to.key}
              />
            ))}
        </svg>
      </div>
    </div>
  );
});
