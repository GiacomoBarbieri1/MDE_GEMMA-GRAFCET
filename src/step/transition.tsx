import { action, computed, observable } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { JsonType } from "../canvas/store";
import { FieldSpec, StrFieldSpec } from "../fields";
import { ChoiceField } from "../fields/choice-field";
import { ConnModel } from "../node/node-model";
import { PropertiesTable } from "../properties/properties-table";
import { parseBoolExpression } from "./antlr_parser";
import { CustomToken, getCustomTokens, VarId } from "./custom_parser";
import { GemmaGrafcet } from "./gemma";
import { Step } from "./step";

type GemmaConn = ConnModel<Step, GemmaGrafcet, Transition>;

export class Transition {
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
      conditionExpression?: string;
      priority?: number;
    }
  ) {
    this.conditionExpression = d?.conditionExpression ?? "";
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
  get expressionTokens(): [CustomToken, number][] {
    return getCustomTokens(this.conditionExpression);
  }

  @computed
  get expressionErrors(): string[] {
    const gemma = this.connection.graph.globalData;
    try {
      const { tree, errors } = parseBoolExpression(this.conditionExpression, {
        boolSignals: gemma.boolSignals.map((s) => s.name),
        numSignals: gemma.numSignals.map((s) => s.name),
      });
      return errors;
    } catch (e) {}
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
  ({
    m,
  }: {
    m: {
      conditionExpression: string;
      expressionTokens: [CustomToken, number][];
    };
  }) => {
    let prevIndex = 0;
    let _spanStyleRef = useRef<HTMLSpanElement>(null);
    const font = "400 15px monospace";

    return (
      <div style={{ width: "180px", position: "relative" }} className="center">
        <span
          style={{
            font,
            position: "absolute",
            top: 0,
            padding: "3px",
            textAlign: "initial",
            whiteSpace: "pre-line",
          }}
          ref={_spanStyleRef}
        >
          {m.expressionTokens.map(([c, textIndex], index) => {
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
          className="multiline-input"
          style={{
            font,
            background: "transparent",
            color: "transparent",
            caretColor: "black",
            position: "relative",
          }}
          spellCheck={false}
          value={m.conditionExpression}
          onChange={(e) => {
            m.conditionExpression = e.currentTarget.value;
          }}
        ></textarea>
      </div>
    );
  }
);
