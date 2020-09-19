import { templateGemmaGraphcet } from "./gemma-templates";
import { GlobalData, RootStoreModel, DataBuilder } from "../canvas/store";
import { computed, observable } from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { ChoiceField } from "../fields/choice-field";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "@material-ui/core/IconButton";
import { Condition, Transition } from "./transition";
import {
  Step,
  SimpleStep,
  EnclosingStep,
  StepType,
  InitialStep,
  MacroStep,
  ProcedureType,
} from "./step";
import { ConnModel } from "../node/node-model";

enum SignalType {
  bool = "bool",
  num = "num",
}

export class GemmaGraphcet implements GlobalData<Step> {
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
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h2 style={{ margin: "0 0 10px 0" }}>Signals</h2>
        {this.signals.map((s, index) => (
          <div
            className="row"
            style={{ alignItems: "center", padding: "2px 0" }}
          >
            <TextField
              type="text"
              label="name"
              value={s.name}
              onChange={(e) => (s.name = e.target.value)}
              style={{ width: "150px" }}
            ></TextField>
            <div style={{ padding: "0 5px 0 5px" }}>
              <ChoiceField
                keys={Object.keys(SignalType)}
                setValue={(v) => (s.type = v as any)}
                value={s.type}
              />
            </div>
            <IconButton onClick={(e) => this.signals.remove(s)}>
              <FontAwesomeIcon icon={"trash-alt"} color={"#000"} />
            </IconButton>
          </div>
        ))}
        <Button
          style={{ alignSelf: "flex-end" }}
          onClick={(e) => this.signals.push(new Signal({ name: "" }))}
        >
          Add Signal
        </Button>
      </div>
    );
  });
}

export class Signal {
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

export const make5NodesGraph = (): RootStoreModel<
  Step,
  GemmaGraphcet,
  Transition
> => {
  const rootStore = new RootStoreModel<Step, GemmaGraphcet, Transition>({
    builders: gemmaBuilders,
  });

  const s1 = rootStore.addNode(StepType.INITIAL, { x: 72, y: 60 });
  const s2 = rootStore.addNode(StepType.MACRO, { x: 261, y: 170 });

  const _t = new ConnModel(
    s1!,
    s2!,
    (c) =>
      new Transition(c, {
        name: "Emergency",
        condition: new Condition("I1 & I2"),
      })
  );
  rootStore.globalData.workingFamilyTransitions.push(_t.data);

  [
    s1,
    s2,
    rootStore.addNode(StepType.ENCLOSING, { x: 441, y: 316 }),
    rootStore.addNode(StepType.SIMPLE, { x: 211, y: 410 }),
    rootStore.addNode(StepType.SIMPLE, { x: 441, y: 500 }),
  ].forEach((s, index) => s?.setName(`S${index + 1}`));

  s1!.data.family = ProcedureType.A;
  s2!.data.family = ProcedureType.D;
  rootStore.selectNode(s1!);

  rootStore.selectingInput(s1!);
  const conn = rootStore.assignInput(s2!);

  rootStore.selectConnection(conn);
  return rootStore;
};

export const makeBaseGemmaTemplate = (): RootStoreModel<
  Step,
  GemmaGraphcet,
  Transition
> => {
  // TODO:
  const rootStore = new RootStoreModel<Step, GemmaGraphcet, Transition>({
    builders: gemmaBuilders,
  });

  const s1 = rootStore.addNode(StepType.INITIAL, { x: 72, y: 60 });
  const s2 = rootStore.addNode(StepType.MACRO, { x: 261, y: 170 });

  const _t = new ConnModel(
    s1!,
    s2!,
    (c) =>
      new Transition(c, {
        name: "Emergency",
        condition: new Condition("I1 & I2"),
      })
  );
  rootStore.globalData.workingFamilyTransitions.push(_t.data);

  [
    s1,
    s2,
    rootStore.addNode(StepType.ENCLOSING, { x: 441, y: 316 }),
    rootStore.addNode(StepType.SIMPLE, { x: 211, y: 410 }),
    rootStore.addNode(StepType.SIMPLE, { x: 441, y: 500 }),
  ].forEach((s, index) => s?.setName(`S${index + 1}`));

  s1!.data.family = ProcedureType.A;
  s2!.data.family = ProcedureType.D;

  return rootStore;
};
