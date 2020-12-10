import { Checkbox } from "@material-ui/core";
import Switch from "@material-ui/core/Switch";
import {
  action,
  computed,
  IKeyValueMap,
  observable,
  ObservableMap,
} from "mobx";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { JsonType } from "../canvas/store";
import { FieldSpec, StrFieldSpec } from "../fields";
import { ChoiceField } from "../fields/choice-field";
import { ConnModel } from "../node/node-model";
import { PropertiesTable } from "../properties/properties-table";
import { parseBoolExpression, ParsedOutput } from "./antlr_parser";
import { CustomToken, getCustomTokens, VarId } from "./custom_parser";
import { GemmaGrafcet } from "./gemma";
import { SignalType } from "./signal";
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
  savedSignalsWithMemory: ObservableMap<
    string,
    { behaviour: "NC" | "NO"; withMemory: boolean }
  >;

  @computed
  get priorityUi() {
    return (
      this.connection.from.data._transitions.findIndex((t) => t === this) + 1
    );
  }
  @computed
  get priorityChoices() {
    return [...Array(this.connection.from.data._transitions.length)].map(
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
      savedSignalsWithMemory?: IKeyValueMap<{
        behaviour: "NC" | "NO";
        withMemory: boolean;
      }>;
    }
  ) {
    this.conditionExpression = d?.conditionExpression ?? "";
    this.priority = d?.priority ?? connection.from.outputs.length + 1;
    this.isNegated = d?.isNegated ?? false;
    this.savedSignalsWithMemory = new ObservableMap<
      string,
      { behaviour: "NC" | "NO"; withMemory: boolean }
    >(d?.savedSignalsWithMemory);
  }

  @action.bound
  setPriority = (v: string): void => {
    const priority = parseInt(v);
    if (this.connection.isHidden) {
      return;
    }

    const transitions = this.connection.from.outputs;
    const hiddenTransitions = transitions
      .filter(
        (t) => t.isHidden && t.data.priority <= this.priorityChoices.length
      )
      .sort((a, b) => a.data.priority - b.data.priority)
      .map((t) => t.data);
    if (hiddenTransitions.length > 0) {
      let p = 1;
      [...this.connection.from.data._transitions, ...hiddenTransitions].forEach(
        (t, ind) => {
          t.priority = p++;
        }
      );
    }
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
        this.connection.from.data._transitions.length > 1);

    return [
      {
        text: showPriority ? `${this.priorityUi}: ` : "",
        style: { textDecoration: hasNegation ? "overline" : undefined },
      },
      { text: ` ${cond}${this.conditionExpression.length > 20 ? "..." : ""}` },
    ];
  }

  @computed
  get toJson(): JsonType {
    const json: JsonType = {
      conditionExpression: this.conditionExpression,
      priority: this.priority,
      isNegated: this.isNegated,
    };
    if (this.savedSignalsWithMemory.size > 0) {
      const _jsonSignals: {
        [key: string]: {
          behaviour: "NC" | "NO";
          withMemory: boolean;
        };
      } = {};
      for (const [k, v] of this.savedSignalsWithMemory.entries()) {
        _jsonSignals[k] = { ...v };
      }
      json["savedSignalsWithMemory"] = _jsonSignals;
    }
    return json;
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
      return output;
    } catch (e) {}
    return undefined;
  }

  @computed
  get signalsInCondition(): Array<string> {
    let _signals: string[];
    if (this.parsedExpression !== undefined) {
      _signals = this.parsedExpression.boolSignals.map((s) => s.text);
    } else {
      _signals = this.expressionTokens
        .map(([token, _]) => token)
        .filter((token) => token instanceof VarId)
        .map((s) => s.toString());
    }
    return [
      ..._signals
        .filter((token) =>
          this.from.automationSystem.signals.some(
            (s) => s.type === SignalType.bool && s.name === token
          )
        )
        .reduce((set, token) => {
          set.add(token.toString());
          return set;
        }, new Set<string>())
        .values(),
    ];
  }

  // @computed
  // get signalsInConditionWithDefault(): Array<[string, boolean]> | undefined {
  //   return this.parsedExpression?.boolSignals.map((s) => {
  //     if (s.parent === undefined) {
  //     }
  //     return [s.text, false];
  //   });
  // }

  // evaluateSignal = (s: IdentifierExpressionContext): boolean => {
  //   let result = false;
  //   let topOfNot = false;
  //   let topOfAnd = false;

  //   let parent = s.parent;
  //   while (parent !== undefined) {
  //     if (parent instanceof AndParentExpressionContext) {
  //       topOfAnd = !topOfAnd;
  //     } else if (parent instanceof NotExpressionContext) {
  //       topOfNot = !topOfNot;
  //     } else if (parent instanceof OrExpressionContext) {
  //     } else if (parent instanceof SimpleExpressionContext) {
  //     } else if (parent instanceof AndExpressionContext) {
  //     }
  //     parent = parent.parent;
  //   }
  //   return result;
  // };

  @computed
  get signalsWithMemory() {
    return this.signalsInCondition
      .filter((s) => this.savedSignalsWithMemory.get(s)?.withMemory ?? false)
      .map((value) => ({
        value,
        behaviour: this.savedSignalsWithMemory.get(value)!.behaviour,
      }));
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
                value={"" + this.priorityUi}
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
                  return (
                    <MemCheckbox
                      key={token}
                      token={token}
                      map={this.savedSignalsWithMemory}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </>
    );
  });
}

const MemCheckbox = observer(
  ({
    map,
    token,
  }: {
    map: ObservableMap<string, { behaviour: "NC" | "NO"; withMemory: boolean }>;
    token: string;
  }) => {
    const _update = (value: {
      behaviour: "NC" | "NO";
      withMemory: boolean;
    }) => {
      if (!value.withMemory && value.behaviour === "NO") {
        map.delete(token);
      } else {
        map.set(token, value);
      }
    };
    const state = map.get(token);
    const behaviour = state?.behaviour ?? "NO";
    const withMemory = state?.withMemory ?? false;

    return (
      <div className="row" style={{ alignItems: "center" }}>
        <div>
          <Checkbox
            checked={withMemory}
            size="small"
            color="primary"
            onChange={() => {
              _update({ withMemory: !withMemory, behaviour });
            }}
          />
        </div>
        <div style={{ flex: 1 }}>{token}</div>
        {withMemory && (
          <div style={{ paddingLeft: 3, paddingRight: 3 }}>
            <ChoiceField
              value={behaviour}
              keys={["NC", "NO"]}
              setValue={(v) => {
                _update({ withMemory, behaviour: v });
              }}
            />
          </div>
        )}
      </div>
    );
  }
);

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
