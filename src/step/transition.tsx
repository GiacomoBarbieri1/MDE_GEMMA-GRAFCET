import { computed, observable } from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";
import { FieldSpec, StrFieldSpec } from "../fields";
import { ConnModel } from "../node/node-model";
import { PropertiesTable } from "../properties/properties-table";
import { GemmaGraphcet } from "./gemma";
import { Step } from "./step";

type GemmaConn = ConnModel<Step, GemmaGraphcet, Transition>;

export class Transition {
  name: string;
  // condition: Condition;
  @computed
  get condition(): Condition {
    return new Condition(this.conditionExpression);
  }
  @observable
  conditionExpression: string;
  errors = observable.map<string, string>();

  spec: { [key: string]: FieldSpec } = {
    conditionExpression: new StrFieldSpec({ default: "" }),
  };

  constructor(
    private connection: GemmaConn,
    d?: {
      name: string;
      condition: Condition;
    }
  ) {
    this.name = d?.name ?? "";
    // this.condition = d?.condition ?? new Condition("");
    this.conditionExpression =
      d?.condition.expression ?? this.spec["conditionExpression"].default;
    console.log(this.conditionExpression);
  }

  get from(): Step {
    return this.connection.from.data;
  }

  get to(): Step {
    return this.connection.to.data;
  }

  @computed
  get connectionText(): string {
    return this.conditionExpression;
  }

  ConnectionView = observer(() => {
    return (
      <PropertiesTable>
        <tr key="conditionExpression">
          <td>conditionExpression</td>
          <td>{<ConditionInput m={this} />}</td>
        </tr>
      </PropertiesTable>
    );
  });
}

const ConditionInput = observer(
  ({ m }: { m: { conditionExpression: string } }) => {
    const _tokens = tokens(m.conditionExpression);
    let prevIndex = 0;

    return (
      <div style={{ width: "180px", position: "relative" }} className="center">
        <span
          style={{
            font: "400 15px monospace",
            position: "absolute",
            top: 0,
            margin: "3px",
            width: "180px",
            textAlign: "initial",
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
            font: "400 15px monospace",
            color: "transparent",
            caretColor: "black",
            width: "180px",
            position: "relative",
            background: "transparent",
          }}
          value={m.conditionExpression}
          onSelect={(e) => {
            console.log(e.currentTarget.selectionStart);
          }}
          onChange={(e) => {
            m.conditionExpression = e.currentTarget.value;
            // console.log(tokens(e.currentTarget.value));
          }}
        ></textarea>
      </div>
    );
  }
);

export class Condition {
  constructor(public expression: string) {}
}

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
        const prevToken = l[l.length - 1];
        const prev = prevToken[0];
        const strPrev = prev instanceof VarId ? prev.text : prev;
        if (["<", ">"].includes(strPrev) && prevToken[1] === i - 1) {
          l[l.length - 1][0] = (prev + "=") as any;
        } else {
          add(c);
        }
        break;
      case "A":
        if (t.substring(i, i + 3) === "AND") {
          omit = 2;
          add("AND");
          continue;
        }
      // ignore: no-fallthrough
      case "O":
        if (t.substring(i, i + 2) === "OR") {
          omit = 1;
          add("OR");
          continue;
        }
      // ignore: no-fallthrough
      case "N":
        if (t.substring(i, i + 3) === "NOT") {
          omit = 2;
          add("NOT");
          continue;
        }
      // ignore: no-fallthrough
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
