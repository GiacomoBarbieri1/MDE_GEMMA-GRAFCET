import { Checkbox } from "@material-ui/core";
import Switch from "@material-ui/core/Switch";
import { action, computed, observable, ObservableSet } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { JsonType } from "../canvas/store";
import { FieldSpec, StrFieldSpec } from "../fields";
import { ChoiceField } from "../fields/choice-field";
import {
  AndExpressionContext,
  AndParentExpressionContext,
  IdentifierExpressionContext,
  NotExpressionContext,
  OrExpressionContext,
  SimpleExpressionContext,
} from "../grammar/SimpleBooleanParser";
import { ConnModel } from "../node/node-model";
import { PropertiesTable } from "../properties/properties-table";
import { parseBoolExpression, ParsedOutput } from "./antlr_parser";
import { CustomToken, getCustomTokens, VarId } from "./custom_parser";
import { GemmaGrafcet } from "./gemma";
import { Step, StepType } from "./step";

type GemmaConn = ConnModel<Step, GemmaGrafcet, Transition>;

export class Transition {
  @observable
  conditionExpression: string;
  @observable
  priority: number;
  @observable
  isNegated: boolean;
  @observable
  savedSignalsWithMemory: ObservableSet<string> = new ObservableSet();
  @computed
  get priorityChoices() {
    return [...Array(this.connection.from.outputs.length)].map(
      (_, i) => "" + (i + 1)
    );
  }

  errors = observable.map<string, string>();

  spec: { [key: string]: FieldSpec } = {
    conditionExpression: new StrFieldSpec({ default: "" }),
  };

  constructor(
    public connection: GemmaConn,
    d?: {
      conditionExpression?: string;
      priority?: number;
      isNegated?: boolean;
    }
  ) {
    this.conditionExpression = d?.conditionExpression ?? "";
    this.priority = d?.priority ?? connection.from.outputs.length + 1;
    this.isNegated = d?.isNegated ?? false;
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
  get connectionText(): { text: string; style?: React.CSSProperties }[] {
    const cond = this.conditionExpression.substring(0, 20);
    const hasNegation =
      this.isNegated &&
      (this.from.type === StepType.MACRO ||
        this.from.type === StepType.ENCLOSING);
    const showPriority =
      hasNegation ||
      (this.from.type !== StepType.CONTAINER &&
        this.connection.from.outputs.length > 1);

    return [
      {
        text: showPriority ? `${this.priority}: ` : "",
        style: { textDecoration: hasNegation ? "overline" : undefined },
      },
      { text: ` ${cond}${this.conditionExpression.length > 20 ? "..." : ""}` },
    ];
  }

  @computed
  get toJson(): JsonType {
    return {
      conditionExpression: this.conditionExpression,
      priority: this.priority,
      isNegated: this.isNegated,
    };
  }

  @computed
  get expressionTokens(): [CustomToken, number][] {
    return getCustomTokens(this.conditionExpression);
  }

  @computed
  get parsedExpression(): ParsedOutput | undefined {
    const gemma = this.connection.graph.globalData;
    try {
      const output = parseBoolExpression(this.conditionExpression, {
        boolSignals: gemma.boolSignals.map((s) => s.name),
        numSignals: gemma.numSignals.map((s) => s.name),
      });
      console.log(output.boolSignals);
      return output;
    } catch (e) {}
    return undefined;
  }

  @computed
  get signalsInCondition(): Array<string> {
    if (this.parsedExpression !== undefined) {
      return this.parsedExpression.boolSignals.map((s) => s.text);
    }
    return [
      ...this.expressionTokens
        .map(([token, _]) => token)
        .filter(
          (token) =>
            token instanceof VarId &&
            this.from.automationSystem.signals.some(
              (s) => s.name === token.toString()
            )
        )
        .reduce((set, token) => {
          set.add(token.toString());
          return set;
        }, new Set<string>())
        .values(),
    ];
  }

  @computed
  get signalsInConditionWithDefault(): Array<[string, boolean]> | undefined {
    return this.parsedExpression?.boolSignals.map((s) => {
      if (s.parent === undefined) {
      }
      return [s.text, false];
    });
  }

  evaluateSignal = (s: IdentifierExpressionContext): boolean => {
    let result = false;
    let topOfNot = false;
    let topOfAnd = false;

    let parent = s.parent;
    while (parent != undefined) {
      if (parent instanceof AndParentExpressionContext) {
        topOfAnd = !topOfAnd;
      } else if (parent instanceof NotExpressionContext) {
        topOfNot = !topOfNot;
      } else if (parent instanceof OrExpressionContext) {
      } else if (parent instanceof SimpleExpressionContext) {
      } else if (parent instanceof AndExpressionContext) {
      }
      parent = parent.parent;
    }
    return result;
  };

  @computed
  get signalsWithMemory() {
    return this.signalsInCondition.filter((s) =>
      this.savedSignalsWithMemory.has(s)
    );
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
          {(this.from.type === StepType.MACRO ||
            this.from.type === StepType.ENCLOSING) && (
            <tr key="isNegated">
              <td>Negated</td>
              <td>
                {
                  <Switch
                    checked={this.isNegated}
                    onChange={() => {
                      this.isNegated = !this.isNegated;
                    }}
                    color="primary"
                  />
                }
              </td>
            </tr>
          )}
        </PropertiesTable>
        <div className="row">
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: "0" }}>Errors</h4>
            {this.parsedExpression?.errors.length === 0 && "No errors"}
            <ul
              style={{
                color: "indianred",
                marginTop: "0",
                paddingLeft: "20px",
              }}
              key="errors"
            >
              {this.parsedExpression?.errors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
          {((this.from.type === StepType.MACRO && !this.isNegated) ||
            (this.from.type === StepType.ENCLOSING && this.isNegated)) && (
            <>
              <div style={{ width: "10px" }} />
              <div style={{ flex: 1 }}>
                <h4 key="title" style={{ margin: "0" }}>
                  With Memory
                </h4>
                {this.signalsInCondition.length === 0 &&
                  "No signals in transition"}
                {this.signalsInCondition.map((token) => {
                  const withMemory = this.savedSignalsWithMemory.has(token);
                  const MemCheckbox = observer(() => (
                    <div className="row" style={{ alignItems: "center" }}>
                      <div>
                        <Checkbox
                          checked={withMemory}
                          size="small"
                          color="primary"
                          onChange={() => {
                            if (withMemory) {
                              this.savedSignalsWithMemory.delete(token);
                            } else {
                              this.savedSignalsWithMemory.add(token);
                            }
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>{token}</div>
                    </div>
                  ));
                  return <MemCheckbox key={token} />;
                })}
              </div>
            </>
          )}
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
      <div style={{ width: "206px", position: "relative" }} className="center">
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
            const value = e.currentTarget.value;
            if (value.match(/^\s$/) === null) {
              m.conditionExpression = value.replace(/\s[^\S\r\n]/g, " ");
            }
          }}
        ></textarea>
      </div>
    );
  }
);
