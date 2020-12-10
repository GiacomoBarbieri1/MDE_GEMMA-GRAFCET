import React from "react";
import { computed, observable, reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { ChoiceFieldSpec } from "../fields/choice-field";
import { ConnectionPosition, NodeData, NodeModel } from "../node/node-model";
import { listToMap } from "../utils";
import { GemmaGrafcet } from "./gemma";
import { Transition } from "./transition";
import { JsonType } from "../canvas/store";
import { BoolFieldSpec } from "../fields/primitive-field";

export enum StepType {
  ENCLOSING = "ENCLOSING",
  MACRO = "MACRO",
  SIMPLE = "SIMPLE",
  CONTAINER = "CONTAINER",
}

type GemmaNode = NodeModel<Step, GemmaGrafcet, Transition>;

export enum ProcedureType {
  F = "F", // Operational
  D = "D", // Failure
  A = "A", // Stop
}

export type Step = SimpleStep | EnclosingStep | MacroStep | ContainerStep;

export class BaseStep implements NodeData<Step, GemmaGrafcet, Transition> {
  @observable
  type: StepType;

  nInputs = Number.POSITIVE_INFINITY;
  errors = observable.map<string, string>();

  constructor(
    public node: GemmaNode,
    d?: {
      description?: string;
      family?: ProcedureType;
      isInitial?: boolean;
      type?: StepType;
    }
  ) {
    this.description = d?.description ?? "";
    this.family = d?.family ?? ProcedureType.F;
    this.isInitial = d?.isInitial ?? false;
    this.type = d?.type ?? StepType.SIMPLE;
    reaction(
      (_) => this.isInitial,
      (isInitial, _) => {
        if (isInitial) {
          const otherInitial = this.automationSystem.steps.find(
            (s) => s.isInitial && s !== this
          );
          if (otherInitial !== undefined) {
            otherInitial.isInitial = false;
          }
        }
      }
    );
  }

  @computed
  get name(): string {
    return this.node.name;
  }
  @observable
  description: string;
  @observable
  isInitial: boolean;
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
    throw new Error("");
  }
  get key(): string {
    return this.node.key;
  }
  get automationSystem(): GemmaGrafcet {
    return this.node.graph.globalData;
  }

  connectionStartPosition = (): undefined | ConnectionPosition => {
    if (this.type === StepType.CONTAINER) {
      return { bottom: 40, left: 50 };
    }
    return undefined;
  };

  @computed
  get _transitions(): Transition[] {
    return this.node.outputs
      .filter((t) => !t.isHidden)
      .map((t) => t.data)
      .sort((a, b) => a.priority - b.priority);
  }
  @computed
  get innerTransitionsLength(): number {
    return this._transitions.length;
  }
  @computed
  get transitions(): Transition[] {
    if (this === this.automationSystem.fFamily!.data) {
      return this._transitions;
    }
    return this.family === ProcedureType.F
      ? this.automationSystem.fFamily!.data.transitions.concat(
          this._transitions
        )
      : this._transitions;
  }
  @computed
  get id(): number {
    if (this.name.length === 2) {
      let delta: number;
      switch (this.family) {
        case ProcedureType.A:
          delta = 0;
          break;
        case ProcedureType.F:
          delta = 7;
          break;
        case ProcedureType.D:
          delta = 7 + 6;
          break;
      }
      return delta + Number.parseInt(this.name[1]);
    }
    return 0;
  }

  spec = {
    isInitial: new BoolFieldSpec({
      label: "Initial",
      default: false,
      required: true,
    }),
    type: new ChoiceFieldSpec({
      label: "Type",
      default: StepType.SIMPLE,
      choices: listToMap(
        Object.values(StepType).filter((t) => t !== StepType.CONTAINER)
      ),
    }),
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
      isInitial: this.isInitial,
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
    let wrapper: (p: React.ReactElement) => React.ReactElement = (p) => p;

    if (this.isInitial) {
      wrapper = (p) => (
        <div style={{ padding: "5px" }}>
          <div
            style={{
              border: "1.5px solid",
            }}
          >
            {p}
          </div>
        </div>
      );
    }

    const nodeHeight = this.node.height - 2 - (this.isInitial ? 12 : 0);
    switch (this.type) {
      case StepType.ENCLOSING:
        style = { padding: "0 0", display: "flex" };
        return wrapper(
          <div style={{ ...style, position: "relative" }}>
            <EnclosingDecoration left={true} nodeHeight={nodeHeight} />
            <div style={{ ...innerStyle, padding: "12px 18px" }}>
              {this.node.name}
            </div>
            <EnclosingDecoration left={false} nodeHeight={nodeHeight} />
          </div>
        );
      case StepType.MACRO:
        style = { padding: "5px 0" };
        innerStyle = {
          borderTop: "1.5px solid",
          borderBottom: "1.5px solid",
          borderRight: "0",
          borderLeft: "0",
          padding: "5px 12px",
        };
        break;
    }

    return wrapper(
      <div style={style}>
        <div style={innerStyle}>{this.node.name}</div>
      </div>
    );
  });
}

export type SimpleStep = BaseStep & {
  type: StepType.SIMPLE;
};

export type ContainerStep = BaseStep & {
  type: StepType.CONTAINER;
};

export type EnclosingStep = BaseStep & {
  type: StepType.ENCLOSING;
};

export type MacroStep = BaseStep & {
  type: StepType.MACRO;
};

export const EnclosingDecoration = ({
  nodeHeight,
  left,
}: {
  nodeHeight: number;
  left: boolean;
}) => {
  return (
    <svg
      style={{
        width: "10px",
        height: "" + nodeHeight + "px",
        position: "absolute",
        right: left ? undefined : 0,
      }}
    >
      <path
        d={
          left
            ? `M 10 0 L 0 ${nodeHeight / 2} L 10 ${nodeHeight}`
            : `M 0 0 L 10 ${nodeHeight / 2} L 0 ${nodeHeight}`
        }
        stroke="black"
        fill="transparent"
      ></path>
    </svg>
  );
};
