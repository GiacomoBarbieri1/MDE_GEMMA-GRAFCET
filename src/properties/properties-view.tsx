import { observer } from "mobx-react-lite";
import { Resizable } from "re-resizable";
import React, { useState } from "react";
import { resizableEnable } from "../utils";
import { PropertiesTableNode } from "./properties-table";
import { useStore } from "../App";
import IconButton from "@material-ui/core/IconButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TextField from "@material-ui/core/TextField";

type Props = {};

export const PropertiesView: React.FC<Props> = observer(() => {
  const rootStore = useStore();
  const [t, setT] = useState<string>("");

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
    const _tokens = tokens(t);
    console.log(_tokens);
    let prevIndex = 0;
    inner = (
      <div style={{ width: "150px" }} className="center">
        <span
          style={{
            font: "400 13.3333px monospace",
            position: "absolute",
            top: 0,
            margin: "3px",
            width: "180px",
          }}
        >
          {_tokens.map(([c, textIndex], index) => {
            let color: string;
            if (c instanceof VarId) {
              color = "black";
            } else if (["AND", "NOT", "OR"].includes(c)) {
              color = "blue";
            } else {
              color = "brown";
            }
            const whiteSpace = textIndex - prevIndex;
            console.log(whiteSpace);
            const text =
              (whiteSpace !== 0 ? " ".repeat(whiteSpace) : "") + c.toString();
            prevIndex = textIndex + c.toString().length;
            return (
              <span key={index} style={{ color }}>
                {text}
              </span>
            );
          })}
        </span>
        <textarea
          style={{
            font: "400 13.3333px monospace",
            color: "transparent",
            caretColor: "black",
            width: "180px",
            position: "relative",
            background: "transparent",
          }}
          value={t}
          onSelect={(e) => {
            console.log(e.currentTarget.selectionStart);
          }}
          onChange={(e) => {
            setT(e.currentTarget.value);
            // console.log(tokens(e.currentTarget.value));
          }}
        ></textarea>
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

class VarId {
  constructor(public text: string) {}

  toString(): string {
    return this.text;
  }
}
type Token =
  | "("
  | ")"
  | "AND"
  | "OR"
  | "NOT"
  | "<"
  | ">"
  | "="
  | "<="
  | ">="
  | VarId;

const tokens = (t: string): [Token, number][] => {
  const l: [Token, number][] = [];
  let i = -1;
  let omit = 0;
  let signal = "";
  const addSignal = () => {
    if (signal.length !== 0) {
      l.push([new VarId(signal), i - signal.length]);
      signal = "";
    }
  };
  const add = (v: Token) => {
    addSignal();
    l.push([v, i]);
  };

  for (const c of t) {
    i++;
    if (omit !== 0) {
      omit--;
      continue;
    }
    switch (c) {
      case " ":
        addSignal();
        break;
      case ")":
      case "(":
      case "<":
      case ">":
        add(c);
        break;
      case "=":
        const prev = l[l.length - 1][0];
        const strPrev = prev instanceof VarId ? prev.text : prev;
        if (["<", ">"].includes(strPrev)) {
          l[l.length - 1][0] = (prev + "=") as any;
        } else {
          add(c);
        }
        break;
      case "A":
        if (t.substring(i, i + 3) == "AND") {
          omit = 2;
          add("AND");
          continue;
        }
      case "O":
        if (t.substring(i, i + 2) == "OR") {
          omit = 1;
          add("OR");
          continue;
        }
      case "N":
        if (t.substring(i, i + 3) == "NOT") {
          omit = 2;
          add("NOT");
          continue;
        }

      default:
        signal += c;
        break;
    }
  }
  if (signal.length !== 0) {
    l.push([new VarId(signal), i - signal.length + 1]);
  }
  return l;
};

const term = (t: string) => {
  for (const c of t) {
  }
};

const parseBool = (t: string) => {
  for (const c of t) {
  }
};
