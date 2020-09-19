import { templateGemmaGraphcet } from "./gemma-templates";
import { NodeData, NodeModel, ConnModel } from "../node/node-model";
import { GlobalData, RootStoreModel, DataBuilder } from "../canvas/store";
import { computed, observable } from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";
import { FieldSpec, StrFieldSpec, ChoiceFieldSpec } from "../fields";
import { listToMap } from "../utils";
import { PropertiesTable } from "../properties/properties-table";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { ChoiceField } from "../fields/choice-field";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "@material-ui/core/IconButton";

enum StepType {
  ENCLOSING = "ENCLOSING",
  INITIAL = "INITIAL",
  MACRO = "MACRO",
  SIMPLE = "SIMPLE",
}

enum SignalType {
  bool = "bool",
  num = "num",
}

class GemmaGraphcet implements GlobalData<Step> {
  constructor(private graph: RootStoreModel<Step, GemmaGraphcet, Transition>) {}

  canAddNode(nodeType: string): boolean {
    if (nodeType === StepType.INITIAL) {
      return !this._hasInitialStep();
    }
    return true;
  }

  private _hasInitialStep(): boolean {
    return [...this.graph.nodes.values()].some(
      (n) => n.data.type === StepType.INITIAL
    );
  }

  workingFamilyTransitions: Transition[] = [];

  @computed
  get steps(): Step[] {
    return [...this.graph.nodes.values()].map((node) => node.data);
  }

  signals = observable.array<Signal>();

  @computed
  get initialStep(): Step | undefined {
    return this.steps.find((s) => s.type === StepType.INITIAL);
  }

  generateCode = (): string => {
    return templateGemmaGraphcet(this);
  };

  View = observer(() => {
    return (
      <div style={{ padding: "5px" }}>
        <h2>Signals</h2>
        {this.signals.map((s, index) => (
          <div className="row">
            <TextField
              type="text"
              label="name"
              value={s.name}
              onChange={(e) => (s.name = e.target.value)}
              style={{ width: "150px" }}
            ></TextField>
            <ChoiceField
              keys={Object.keys(SignalType)}
              setValue={(v) => (s.type = v as any)}
              value={s.type}
            />
            <IconButton onClick={(e) => this.signals.remove(s)}>
              <FontAwesomeIcon icon={"trash-alt"} color={"#000"} />
            </IconButton>
          </div>
        ))}
        <Button onClick={(e) => this.signals.push(new Signal({ name: "" }))}>
          Add Signal
        </Button>
      </div>
    );
  });
}

class Signal {
  @observable
  name: string;
  @observable
  type: SignalType;

  description?: string;

  constructor(d: { name: string; description?: string }) {
    this.name = d.name;
    this.description = d.description;
    this.type = SignalType.bool;
  }
}

export type Step = SimpleStep | EnclosingStep | MacroStep | InitialStep;

type GemmaNode = NodeModel<Step, GemmaGraphcet, Transition>;
type GemmaConn = ConnModel<Step, GemmaGraphcet, Transition>;

enum ProcedureType {
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

class SimpleStep extends BaseStep {
  type = StepType.SIMPLE;
}

class InitialStep extends BaseStep {
  type = StepType.INITIAL;
}

class EnclosingStep extends BaseStep {
  type = StepType.ENCLOSING;
}

class MacroStep extends BaseStep {
  type = StepType.MACRO;
}

class Transition {
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
        {Object.entries(this.spec).map(([k, v]) => (
          <tr key={k}>
            <td>{k}</td>
            <td>{<v.plotField name={k} model={this as any} />}</td>
          </tr>
        ))}
      </PropertiesTable>
    );
  });
}

class Condition {
  constructor(public expression: string) {}
}

const gemmaBuilders: DataBuilder<Step, GemmaGraphcet, Transition> = {
  graphBuilder: (g) => new GemmaGraphcet(g),
  nodeBuilder: {
    [StepType.SIMPLE]: (n) => new SimpleStep(n),
    [StepType.MACRO]: (n) => new MacroStep(n),
    [StepType.ENCLOSING]: (n) => new EnclosingStep(n),
    [StepType.INITIAL]: (n) => new InitialStep(n),
  },
  connectionBuilder: (c) => new Transition(c),
};

export {
  Condition,
  Transition,
  MacroStep,
  EnclosingStep,
  Signal,
  SimpleStep,
  GemmaGraphcet,
  InitialStep,
  ProcedureType,
  StepType,
  BaseStep,
  gemmaBuilders,
};
