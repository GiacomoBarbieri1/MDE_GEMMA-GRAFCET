import { observer } from "mobx-react-lite";
import { Resizable } from "re-resizable";
import React from "react";
import { useStore } from "../App";
import { NodeModel } from "../node/node-model";
import { resizableEnable } from "../utils";
import { GlobalData } from "./store";

type Props = {};

export const ConfigView: React.FC<Props> = observer(<
  G extends GlobalData<any>
>() => {
  const rootStore = useStore<any, G, any>();
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

  return (
    <Resizable
      minWidth={200}
      defaultSize={{ height: "auto", width: 400 }}
      style={{
        position: "relative",
        background: "white",
        boxShadow: "0 1px 4px 1px #eee",
        border: "1px solid #eee",
      }}
      enable={resizableEnable({ left: true })}
    >
      <div style={{ overflow: "auto", height: "100%", padding: "0 10px" }}>
        <pre>{rootStore.globalData.generateCode()}</pre>
        {/* {ops.map((op) => {
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
                {`${op.name}_output = ${op.name}(${op.inputs
                  .map((inp) => inp.to.name)
                  .join(",")});`}
              </pre>
            );
          }
          return null;
        })} */}
      </div>
    </Resizable>
  );
});
