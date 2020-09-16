import { observer } from "mobx-react-lite";
import React from "react";
import { useStore } from "../App";
import { NodeView } from "../node/node";
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
          height: "1500px",
          width: "1500px",
        }}
      >
        {ops.map((operation) => {
          console.log(operation);
          return <NodeView operation={operation} key={operation.key} />;
        })}
        <svg style={{ width: "100%", height: "100%" }}>
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
