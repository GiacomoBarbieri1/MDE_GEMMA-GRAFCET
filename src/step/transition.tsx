import { action, computed, observable } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { JsonType } from "../canvas/store";
import { FieldSpec, StrFieldSpec } from "../fields";
import { ChoiceField } from "../fields/choice-field";
import { ConnModel } from "../node/node-model";
import { PropertiesTable } from "../properties/properties-table";
import { parseBoolExpression } from "./antlr_parser";
import { getCustomTokens, VarId } from "./custom_parser";
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
  @observable
  priority: number;
  @computed
  get priorityChoices() {
    return [...Array(this.connection.from.outputs.length)].map(
      (v, i) => "" + (i + 1)
    );
  }

  errors = observable.map<string, string>();

  spec: { [key: string]: FieldSpec } = {
    conditionExpression: new StrFieldSpec({ default: "" }),
  };

  constructor(
    private connection: GemmaConn,
    d?: {
      name?: string;
      conditionExpression?: string;
      priority?: number;
    }
  ) {
    this.name = d?.name ?? "";
    // this.condition = d?.condition ?? new Condition("");
    this.conditionExpression =
      d?.conditionExpression ?? this.spec["conditionExpression"].default;
    this.priority = d?.priority ?? connection.from.outputs.length + 1;
  }

  @action.bound
  setPriority = (v: string): void => {
    const priority = parseInt(v);
    if (this.priority === priority) {
      return;
    }
    const transitions = this.connection.from.outputs;
    if (this.priority > priority) {
      transitions
        .filter(
          (t) => t.data.priority >= priority && t.data.priority < this.priority
        )
        .forEach((t) => t.data.priority++);
    } else {
      transitions
        .filter(
          (t) => t.data.priority <= priority && t.data.priority > this.priority
        )
        .forEach((t) => t.data.priority--);
    }
    this.priority = priority;
  };

  get from(): Step {
    return this.connection.from.data;
  }

  get to(): Step {
    return this.connection.to.data;
  }

  @computed
  get connectionText(): string {
    const cond = this.conditionExpression.substring(0, 20);
    return `${this.priority}: ${cond}${
      this.conditionExpression.length > 20 ? "..." : ""
    }`;
  }

  @computed
  get toJson(): JsonType {
    return {
      conditionExpression: this.conditionExpression,
      priority: this.priority,
    };
  }

  @computed
  get expressionErrors(): string[] {
    const gemma = this.connection.graph.globalData;
    try {
      const { tree, errors } = parseBoolExpression(this.conditionExpression, {
        boolSignals: gemma.boolSignals.map((s) => s.name),
        numSignals: gemma.numSignals.map((s) => s.name),
      });
      console.log(tree);

      return errors;
    } catch (e) {
      console.log(`EEEEEEEEEEEEEEEE ${e}`);
    }
    return [];
  }

  ConnectionView = observer(() => {
    return (
      <>
        <PropertiesTable key="table">
          <tr key="priority">
            <td>Priority</td>
            <td>
              <ChoiceField
                keys={this.priorityChoices}
                value={"" + this.priority}
                setValue={this.setPriority}
              />
            </td>
          </tr>
          <tr key="condition">
            <td>Condition</td>
            <td>{<ConditionInput m={this} />}</td>
          </tr>
        </PropertiesTable>
        <div>
          <h4 style={{ margin: "0" }}>Errors</h4>
          {this.expressionErrors.length === 0 && "No errors"}
          <ul style={{ color: "indianred", marginTop: "0" }} key="errors">
            {this.expressionErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      </>
    );
  });
}

const ConditionInput = observer(
  ({ m }: { m: { conditionExpression: string } }) => {
    const _tokens = getCustomTokens(m.conditionExpression);
    let prevIndex = 0;
    let _spanStyleRef = useRef<HTMLSpanElement>(null);
    const sharedStyle: React.CSSProperties = {
      font: "400 15px monospace",
      width: "180px",
      height: "60px",
      overflow: "auto",
      borderRadius: "5px",
    };

    return (
      <div style={{ width: "180px", position: "relative" }} className="center">
        <span
          style={{
            ...sharedStyle,
            position: "absolute",
            top: 0,
            padding: "3px",
            textAlign: "initial",
            whiteSpace: "pre-line",
          }}
          ref={_spanStyleRef}
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
            const text = " ".repeat(whiteSpace) + c.toString();
            prevIndex = textIndex + c.toString().length;
            return (
              <span key={index} style={{ color }}>
                {text}
              </span>
            );
          })}
        </span>
        <textarea
          onScroll={(s) => {
            _spanStyleRef.current!.scrollTo(0, s.currentTarget.scrollTop);
          }}
          style={{
            ...sharedStyle,
            background: "transparent",
            color: "transparent",
            caretColor: "black",
            position: "relative",
            resize: "none",
          }}
          spellCheck={false}
          value={m.conditionExpression}
          onSelect={(e) => {
            // console.log(e.currentTarget.selectionStart);
          }}
          onChange={(e) => {
            m.conditionExpression = e.currentTarget.value;
          }}
        ></textarea>
      </div>
    );
  }
);

export class Condition {
  constructor(public expression: string) {}
}

// const processParsedExpression = (exp: ExpressionContext): {} => {
//   const toProcess = [...exp.children];
//   const numIds = [];
//   const boolIds = [];

//   while (toProcess.length !== 0) {
//     const n = toProcess.pop()!;
//   }

//   return {};
// };
