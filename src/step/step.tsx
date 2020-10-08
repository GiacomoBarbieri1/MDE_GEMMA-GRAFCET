import React from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react-lite";
import { StrFieldSpec } from "../fields";
import { ChoiceFieldSpec } from "../fields/choice-field";
import { NodeData, NodeModel } from "../node/node-model";
import { listToMap } from "../utils";
import { GemmaGraphcet } from "./gemma";
import { Transition } from "./transition";
import { JsonType } from "../canvas/store";

export type Step = SimpleStep | EnclosingStep | MacroStep | InitialStep;
export enum StepType {
  ENCLOSING = "ENCLOSING",
  INITIAL = "INITIAL",
  MACRO = "MACRO",
  SIMPLE = "SIMPLE",
}

type GemmaNode = NodeModel<Step, GemmaGraphcet, Transition>;

export enum ProcedureType {
  F = "F", // Operational
  D = "D", // Failure
  A = "A", // Stop
}

abstract class BaseStep implements NodeData<Step, GemmaGraphcet, Transition> {
  abstract type: StepType;
  nInputs = Number.POSITIVE_INFINITY;
  errors = observable.map<string, string>();

  constructor(
    private node: GemmaNode,
    d?: {
      description?: string;
      family?: ProcedureType;
    }
  ) {
    this.description = d?.description ?? "";
    this.family = d?.family ?? ProcedureType.F;
  }

  @computed
  get name(): string {
    return this.node.name;
  }
  @observable
  description: string;
  @observable
  family: ProcedureType;

  get automationSystem(): GemmaGraphcet {
    return this.node.graph.globalData;
  }

  @computed
  private get _transitions(): Transition[] {
    return this.node.outputs
      .map((t) => t.data)
      .sort((a, b) => a.priority - b.priority);
  }
  @computed
  get innerTransitionsLength(): number {
    return this._transitions.length;
  }
  @computed
  get transitions(): Transition[] {
    return this.family === ProcedureType.F
      ? this.automationSystem.workingFamilyTransitions.concat(this._transitions)
      : this._transitions;
  }
  @computed
  get id(): number {
    return this.automationSystem.steps.indexOf(this as any) + 1;
  }

  spec = {
    family: new ChoiceFieldSpec({
      default: ProcedureType.F,
      choices: listToMap(Object.values(ProcedureType)),
    }),
    description: new StrFieldSpec({ default: "" }),
  };

  isValidInput(n: GemmaNode): boolean {
    return this.node.inputNodes.every((t) => t.data !== n.data);
  }
  @computed
  get toJson(): JsonType {
    return {
      family: this.family, 
      description: this.description, 
      type: this.type
    };
  }

  View = observer(() => {
    let style: React.CSSProperties = {};
    let innerStyle: React.CSSProperties = { padding: "12px" };
    switch (this.type) {
      case StepType.ENCLOSING:
        style = { padding: "0 0",  display: "flex" };
        // TODO: 
        return (
          <div style={style}>
            <span />
            <div style={{ ...innerStyle, }}>
              {this.node.name}
            </div>
            <span />
          </div>
        );
      case StepType.MACRO:
        style = { padding: "5px 0" };
        innerStyle = {
          border: "1.5px solid",
          borderRight: "0",
          borderLeft: "0",
          padding: "5px 12px",
        };
        break;
      case StepType.INITIAL:
        style = { padding: "5px" };
        innerStyle = {
          border: "1.5px solid",
          padding: "7px",
        };
        break;
      default:
        break;
    }

    return (
      <div style={style}>
        <div style={innerStyle}>{this.node.name}</div>
      </div>
    );
  });
}

export class SimpleStep extends BaseStep {
  type = StepType.SIMPLE;
}

export class InitialStep extends BaseStep {
  type = StepType.INITIAL;
}

export class EnclosingStep extends BaseStep {
  type = StepType.ENCLOSING;
}

export class MacroStep extends BaseStep {
  type = StepType.MACRO;
}
