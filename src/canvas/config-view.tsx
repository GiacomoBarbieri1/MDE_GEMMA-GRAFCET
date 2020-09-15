import { observer } from "mobx-react-lite";
import { Resizable } from "re-resizable";
import React from "react";
import { rootStore } from "../App";
import { OperationModel } from "../operation/operation-model";
import { resizableEnable } from "../utils";

type Props = {};

export const ConfigView: React.FC<Props> = observer(() => {
  const ops = [...rootStore.operations.values()];
  const connections = ops.reduce((p, c) => {
    c.data.inputs.forEach((v) => {
      let m = p.get(v);
      if (m === undefined) {
        m = [];
        p.set(v, m);
      }
      m.push(c);
    });
    return p;
  }, new Map<OperationModel, OperationModel[]>());

  const orderedOps: OperationModel[] = [];
  const counts = new Map(
    ops
      .filter((op) => {
        const withDependencies = op.data.inputs.length !== 0;
        if (!withDependencies) {
          orderedOps.push(op);
        }
        return withDependencies;
      })
      .map((op) => [op, op.data.inputs.length])
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

  return (
    <Resizable
      minWidth={200}
      defaultSize={{ height: "auto", width: 300 }}
      style={{
        position: "relative",
        background: "white",
        boxShadow: "0 1px 4px 1px #eee",
        border: "1px solid #eee",
      }}
      enable={resizableEnable({ left: true })}
    >
      <div style={{ overflow: "auto", height: "100%", padding: "0 10px" }}>
        {ops.map((op) => {
          return (
            <pre key={op.key}>
              {op.name + " = " + op.data.pythonCode + "\n"}
            </pre>
          );
        })}

        {orderedOps.map((op) => {
          if (op.data.inputs.length > 0) {
            return (
              <pre key={op.key + "input"}>
                {`${op.name}_output = ${op.name}(${op.data.inputs
                  .map((inp) => inp.name)
                  .join(",")});`}
              </pre>
            );
          }
          return null;
        })}
      </div>
    </Resizable>
  );
});
