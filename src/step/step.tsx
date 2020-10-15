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
  CONTAINER = "CONTAINER",
}

type GemmaNode = NodeModel<Step, GemmaGraphcet, Transition>;

export enum ProcedureType {
  F = "F", // Operational
  D = "D", // Failure
  A = "A", // Stop
}

abstract class BaseStep implements NodeData<Step, GemmaGraphcet, Transition> {
  @observable
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
  @computed
  get parent(): GemmaNode | undefined {
    if (this.type === StepType.CONTAINER) {
      return undefined;
    }
    switch (this.family) {
      case ProcedureType.A:
        return this.automationSystem.aFamily;
      case ProcedureType.D:
        return this.automationSystem.dFamily;
      case ProcedureType.F:
        return this.automationSystem.fFamily;
    }
  }

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
    type: new ChoiceFieldSpec({
      default: StepType.SIMPLE,
      choices: listToMap(
        Object.values(StepType).filter((t) => t !== StepType.CONTAINER)
      ),
      onChange: (n: StepType) => {
        if (n === StepType.INITIAL) {
          const otherIntial = this.automationSystem.steps.find(
            (s) => s.type === StepType.INITIAL && s !== this
          );
          if (otherIntial !== undefined) {
            otherIntial.type = StepType.SIMPLE;
          }
        }
      },
    }),
    description: new StrFieldSpec({ default: "", multiline: true}),
  };

  isValidInput(n: GemmaNode): boolean {
    return this.node.inputNodes.every((t) => t.data !== n.data);
  }

  @computed
  get toJson(): JsonType {
    return {
      family: this.family,
      description: this.description,
      type: this.type,
    };
  }

  View = observer(({ children }) => {
    const _color = {
      [ProcedureType.A]: "#ecf5ff",
      [ProcedureType.D]: "#ffd6d6",
      [ProcedureType.F]: "#ebffec",
    };

    if (this.type === StepType.CONTAINER) {
      return (
        <div
          style={{
            position: "relative",
            border: "1px solid #eee",
            background: _color[this.family],
            flex: 1,
            width: 400,
            height: 400,
          }}
        >
          {children}
        </div>
      );
    }
    let style: React.CSSProperties = {};
    let innerStyle: React.CSSProperties = { padding: "12px" };
    switch (this.type) {
      case StepType.ENCLOSING:
        style = { padding: "0 0", display: "flex" };
        // TODO:
        return (
          <div style={style}>
            <span />
            <div style={{ ...innerStyle }}>{this.node.name}</div>
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

export class ContainerStep extends BaseStep {
  type = StepType.CONTAINER;
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
