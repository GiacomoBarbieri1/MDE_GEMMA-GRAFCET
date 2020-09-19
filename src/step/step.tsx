import { computed, observable } from "mobx";
import { StrFieldSpec } from "../fields";
import { ChoiceFieldSpec } from "../fields/choice-field";
import { NodeData, NodeModel } from "../node/node-model";
import { listToMap } from "../utils";
import { GemmaGraphcet } from "./gemma";
import { Transition } from "./transition";

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
  nInputs = Number.POSITIVE_INFINITY;
  errors = observable.map<string, string>();

  constructor(
    private node: GemmaNode,
    d?: {
      description?: string;
      family: ProcedureType;
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
    return this.node.outputs.map((t) => t.data);
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
