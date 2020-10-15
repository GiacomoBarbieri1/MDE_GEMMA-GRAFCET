import { templateGemmaGraphcet, templateGlobals } from "./gemma-templates";
import {
  GlobalData,
  RootStoreModel,
  DataBuilder,
  JsonType,
} from "../canvas/store";
import { computed, IObservableArray, observable } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { ChoiceField } from "../fields/choice-field";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "@material-ui/core/IconButton";
import { Transition } from "./transition";
import {
  Step,
  SimpleStep,
  EnclosingStep,
  StepType,
  InitialStep,
  MacroStep,
  ProcedureType,
  ContainerStep,
} from "./step";
import { ConnModel, NodeModel } from "../node/node-model";
import { IndexedDB } from "../canvas/persistence";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import "./gemma-styles.css";
import { SourceDirectory, SourceFile } from "../codegen/file-system";
import { enclosingStepTemplate } from "./enclosing-step";
import { macroStepTemplate } from "./macro-step";
import { NodeView } from "../node/node";
import { Divider } from "@material-ui/core";

enum SignalType {
  bool = "bool",

  sint = "sint",
  int = "int",
  lint = "lint",
  dint = "dint",

  usint = "usint",
  uint = "uint",
  ulint = "ulint",
  udint = "udint",

  real = "real",
  lreal = "lreal",
}

export class GemmaGraphcet implements GlobalData<Step> {
  constructor(
    private graph: RootStoreModel<Step, GemmaGraphcet, Transition>,
    json?: JsonType
  ) {
    let signals: Signal[] = [];
    if (Array.isArray(json?.signals)) {
      signals = json?.signals
        .map((s) => (typeof s === "object" ? Signal.fromJson(s) : undefined))
        .filter((s) => s !== undefined) as Signal[];
    }
    this.signals = observable.array<Signal>(signals);
  }

  canAddNode = (nodeType: string): boolean => {
    if (nodeType === StepType.INITIAL) {
      return !this._hasInitialStep();
    }
    return true;
  };

  initState(): void {
    this.fFamily = this.graph.addNode(StepType.CONTAINER, { x: 600, y: 0 })!;
    this.fFamily.setName("F family");
    this.fFamily.data.family = ProcedureType.F;

    this.aFamily = this.graph.addNode(StepType.CONTAINER, { x: 0, y: 0 })!;
    this.aFamily.setName("A family");
    this.aFamily.data.family = ProcedureType.A;

    this.dFamily = this.graph.addNode(StepType.CONTAINER, { x: 0, y: 500 })!;
    this.dFamily.setName("D family");
    this.dFamily.data.family = ProcedureType.D;
  }

  fFamily?: NodeModel<Step, GemmaGraphcet, Transition>;
  aFamily?: NodeModel<Step, GemmaGraphcet, Transition>;
  dFamily?: NodeModel<Step, GemmaGraphcet, Transition>;

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

  readonly signals: IObservableArray<Signal>;

  @computed
  get numSignals(): Signal[] {
    return this.signals.filter((s) => s.type !== SignalType.bool);
  }

  @computed
  get boolSignals(): Signal[] {
    return this.signals.filter((s) => s.type === SignalType.bool);
  }

  @computed
  get initialStep(): Step | undefined {
    return this.steps.find((s) => s.type === StepType.INITIAL);
  }

  @computed
  get generateMainFile(): string {
    return templateGemmaGraphcet(this);
  }

  @computed
  get generateSourceCode(): SourceDirectory {
    const main = templateGemmaGraphcet(this);
    const globals = templateGlobals(this.signals);
    const files = [
      new SourceFile("main.txt", main),
      new SourceFile("GVL.txt", globals),
    ];

    for (const s of this.steps.values()) {
      if (s.type === StepType.ENCLOSING) {
        files.push(
          new SourceFile(s.name + "_FB.txt", enclosingStepTemplate(s))
        );
      } else if (s.type === StepType.MACRO) {
        files.push(new SourceFile(s.name + "_FB.txt", macroStepTemplate(s)));
      }
    }

    return new SourceDirectory("gemma_grafcet", files);
  }

  @computed
  get toJson(): JsonType {
    return {
      signals: this.signals.map((s) => s.toJson),
    };
  }

  View = observer(() => {
    const [showDelete, setShowDelete] = useState(false);
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <h3 style={{ margin: "5px 0 10px 5px" }}>Signals</h3>
          <Button onClick={(_) => setShowDelete(!showDelete)}>
            {showDelete ? "Hide Delete" : "Show Delete"}
            <FontAwesomeIcon
              style={{ paddingLeft: "7px" }}
              icon={"trash-alt"}
              color={"#000"}
            />
          </Button>
        </div>
        <Table
          id="signals-table"
          size="small"
          aria-label="a dense table"
          stickyHeader={true}
        >
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Default</TableCell>
              {showDelete && <TableCell>Delete</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {this.signals.map((s, index) => (
              <TableRow key={index}>
                <TableCell>
                  <TextField
                    type="text"
                    value={s.name}
                    onChange={(e) => (s.name = e.target.value)}
                    style={{ width: "110px" }}
                  />
                </TableCell>
                <TableCell>
                  <ChoiceField
                    keys={Object.keys(SignalType)}
                    setValue={(v) => (s.type = v as any)}
                    value={s.type}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="text"
                    value={s.defaultValue}
                    onChange={(e) => (s.defaultValue = e.target.value)}
                    style={{ width: "80px" }}
                  />
                </TableCell>
                {showDelete && (
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => this.signals.remove(s)}
                      size="small"
                    >
                      <FontAwesomeIcon icon={"trash-alt"} color={"#000"} />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          style={{ alignSelf: "flex-end" }}
          onClick={(e) => this.signals.push(new Signal())}
        >
          Add Signal
        </Button>
      </div>
    );
  });

  CanvasView = observer(() => {
    const nodes = [...this.graph.nodes.values()];
    const _nodesFromFamily = (family: ProcedureType) => {
      return nodes
        .filter(
          (n) => n.data.family === family && n.data.type !== StepType.CONTAINER
        )
        .map((n) => {
          return <NodeView node={n} key={n.key} />;
        });
    };

    const _color = {
      [ProcedureType.A]: { color: "#ecf5ff", size: { w: 600, h: 500 } },
      [ProcedureType.D]: { color: "#ffd6d6", size: { w: 600, h: 500 } },
      [ProcedureType.F]: { color: "#ebffec", size: { w: 600, h: 1000 } },
    };

    return (
      <div style={{ width: "100%", height: "100%", position: "absolute" }}>
        {nodes
          .filter((n) => n.data.type === StepType.CONTAINER)
          .map((n) => {
            const _d = _color[n.data.family]!;
            return (
              <div
                style={{
                  background: _d.color,
                  width: _d.size.w,
                  height: _d.size.h,
                  position: "absolute",
                  top: n.y,
                  left: n.x,
                }}
                key={n.key}
              >
                {_nodesFromFamily(n.data.family)}
              </div>
            );
          })}
      </div>
    );
  });
}

export class Signal {
  @observable
  name: string;
  @observable
  type: SignalType;
  @observable
  defaultValue: string;

  description?: string;

  @computed
  get toJson(): JsonType {
    return {
      name: this.name,
      type: this.type,
      defaultValue: this.defaultValue,
    };
  }

  static fromJson(json: JsonType): Signal | undefined {
    if (
      typeof json["name"] === "string" &&
      Object.keys(SignalType).includes(json["type"] as any)
    ) {
      return new Signal(json);
    } else {
      return undefined;
    }
  }

  constructor(d?: {
    name?: string;
    description?: string;
    type?: SignalType;
    defaultValue?: string;
  }) {
    this.name = d?.name ?? "";
    this.description = d?.description;
    this.type = d?.type ?? SignalType.bool;
    this.defaultValue = d?.defaultValue ?? "";
  }
}

export const gemmaBuilders: DataBuilder<Step, GemmaGraphcet, Transition> = {
  graphBuilder: (g, json) => new GemmaGraphcet(g, json),
  nodeBuilder: (n, json) => {
    console.log(json);
    const type = json !== undefined ? json["type"] : undefined;
    if (typeof type === "string" && Object.keys(StepType).includes(type)) {
      switch (type) {
        case StepType.ENCLOSING:
          return new EnclosingStep(n, json);
        case StepType.INITIAL:
          return new InitialStep(n, json);
        case StepType.MACRO:
          return new MacroStep(n, json);
        case StepType.SIMPLE:
          return new SimpleStep(n, json);
        case StepType.CONTAINER:
          return new ContainerStep(n, json);
      }
    }
    return new SimpleStep(n);
  },
  connectionBuilder: (c, json) => new Transition(c, json),
};

export const make5NodesGraph = (
  db: IndexedDB
): RootStoreModel<Step, GemmaGraphcet, Transition> => {
  const rootStore = new RootStoreModel<Step, GemmaGraphcet, Transition>({
    db,
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
        conditionExpression: "I1 & I2",
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
  rootStore.globalData.signals.push(new Signal({ name: "" }));
  return rootStore;
};

export const makeBaseGemmaTemplate = (
  db: IndexedDB
): RootStoreModel<Step, GemmaGraphcet, Transition> => {
  const rootStore = new RootStoreModel<Step, GemmaGraphcet, Transition>({
    db,
    builders: gemmaBuilders,
  });

  const nodesRaw: {
    [key in ProcedureType]: {
      [key: string]: { type: StepType; x: number; y: number };
    };
  } = {
    [ProcedureType.A]: {
      A6: { type: StepType.INITIAL, x: 60, y: 60 },
      A1: { type: StepType.SIMPLE, x: 200, y: 25 },
      A2: { type: StepType.SIMPLE, x: 180, y: 300 },
      A3: { type: StepType.SIMPLE, x: 270, y: 300 },
      A4: { type: StepType.SIMPLE, x: 360, y: 200 },
      A5: { type: StepType.MACRO, x: 60, y: 300 },
      A7: { type: StepType.MACRO, x: 160, y: 200 },
    },
    [ProcedureType.D]: {
      D1: { type: StepType.MACRO, x: 60, y: 800 },
      D2: { type: StepType.SIMPLE, x: 90, y: 700 },
      D3: { type: StepType.ENCLOSING, x: 200, y: 700 },
    },
    [ProcedureType.F]: {
      F1: { type: StepType.MACRO, x: 800, y: 500 },
      F2: { type: StepType.MACRO, x: 800, y: 200 },
      F3: { type: StepType.MACRO, x: 840, y: 200 },
      F4: { type: StepType.ENCLOSING, x: 850, y: 60 },
      F5: { type: StepType.ENCLOSING, x: 850, y: 350 },
      F6: { type: StepType.ENCLOSING, x: 850, y: 500 },
    },
  };

  const nodes: {
    [key: string]: NodeModel<Step, GemmaGraphcet, Transition>;
  } = {};

  for (const [family, nn] of Object.entries(nodesRaw)) {
    for (const [k, v] of Object.entries(nn)) {
      const n = rootStore.addNode(v.type, { x: v.x, y: v.y });
      n?.setName(k);
      n!.data.family = family as ProcedureType;
      nodes[k] = n!;
    }
  }

  const connextions = {
    A1: ["F2", "F1", "F6", "F5", "F4"],
    A2: ["A1"],
    A3: ["A4"],
    A4: ["F1"],
    A5: ["A7"],
    A6: ["A1"],
    A7: ["A4"],
    F1: ["F3", "A2", "A3", "D1", "D3"],
    F2: ["F1"],
    F3: ["A1"],
    F4: ["A6"],
    D1: ["D2", "A5"],
    D2: ["A5"],
    D3: ["A2", "A3"],
  };

  for (const [k, v] of Object.entries(connextions)) {
    for (const to of v) {
      rootStore.addConnection(nodes[k], nodes[to]);
    }
  }

  const _t = new ConnModel(
    nodes["A1"]!,
    nodes["D1"]!,
    (c) =>
      new Transition(c, {
        name: "Emergency",
        conditionExpression: "I1 & I2",
      })
  );
  rootStore.globalData.workingFamilyTransitions.push(_t.data);

  const a1 = nodes["A1"]!;
  rootStore.selectNode(a1);
  rootStore.selectConnection(a1.outputs[0]);

  return rootStore;
};
