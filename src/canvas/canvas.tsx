import { observer } from "mobx-react-lite";
import React from "react";
import { rootStore } from "../App";
import { OperationView } from "../operation/operation";
import { ArrowView } from "./arrow";

type Props = {};

export const MainCanvas: React.FC<Props> = observer(() => {
  const ops = [...rootStore.operations.values()];
  return (
    <div
      style={{
        position: "relative",
        border: "1px solid #eee",
        height: "auto",
        background: "#fff",
        margin: "10px",
        borderRadius: "6px",
        flex: 1
      }}
    >
      {ops.map((operation) => {
        console.log(operation);
        return <OperationView operation={operation} key={operation.key} />;
      })}
      <svg style={{ width: "100%", height: "100%" }}>
        {ops
          .flatMap((op) => op.data.inputs.map((inp) => ({ from: inp, to: op })))
          .map((arrow) => (
            <ArrowView arrow={arrow} key={arrow.from.key + arrow.to.key} />
          ))}
      </svg>
    </div>
  );
});
