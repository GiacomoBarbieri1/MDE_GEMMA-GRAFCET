import { templateGemmaGrafcet, templateGlobals } from "./gemma-templates";
import {
  GlobalData,
  RootStoreModel,
  DataBuilder,
  JsonType,
  GraphWarnings,
} from "../canvas/store";
import { computed, IObservableArray, observable } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Transition } from "./transition";
import { Step, StepType, ProcedureType, BaseStep } from "./step";
import { NodeModel } from "../node/node-model";
import { IndexedDB } from "../canvas/persistence";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import "./gemma-styles.css";
import { SourceDirectory, SourceFile } from "../codegen/file-system";
import { macroStepTemplate } from "./macro-step";
import { NodeView } from "../node/node";
import { Signal, SignalRow, SignalType } from "./signal";
import mm from "../gemma-model.json";
import { projectTemplate } from "./openxml-templates";

export class GemmaGrafcet implements GlobalData<Step> {
  constructor(
    private graph: RootStoreModel<Step, GemmaGrafcet, Transition>,
    json?: JsonType
  ) {
    let signals: Signal[] = [];
    if (Array.isArray(json?.signals)) {
      signals = json?.signals
        .map((s) =>
          typeof s === "object" ? Signal.fromJson(this, s) : undefined
        )
        .filter((s) => s !== undefined) as Signal[];
    }
    this.signals = observable.array<Signal>(signals);
  }

  get key(): string {
    return this.graph.key;
  }
  get codesysVersion(): string | null {
    return this.graph.codesysVersion;
  }

  canAddNode = (nodeType: string): boolean => {
    return true;
  };

  generatingXML = false;

  initState(): void {
    const nodes = [...this.graph.nodes.values()];
    const _selected = nodes.find(
      (n) => n.data.type !== StepType.CONTAINER && !n.isHidden
    );
    if (_selected !== undefined) {
      this.graph.selectNode(_selected);
    }
    const _selectedTrans = nodes
      .flatMap((n) => n.inputs)
      .find((t) => !t.isHidden);
    if (_selectedTrans !== undefined) {
      this.graph.selectConnection(_selectedTrans);
    }

    this.fFamily =
      nodes.find(
        (n) =>
          n.data.type === StepType.CONTAINER &&
          n.data.family === ProcedureType.F
      ) ?? this.graph.addNode(StepType.CONTAINER, { x: 600, y: 0 })!;
    this.fFamily.setName("F family");
    this.fFamily.data.family = ProcedureType.F;

    this.aFamily =
      nodes.find(
        (n) =>
          n.data.type === StepType.CONTAINER &&
          n.data.family === ProcedureType.A
      ) ?? this.graph.addNode(StepType.CONTAINER, { x: 0, y: 0 })!;
    this.aFamily.setName("A family");
    this.aFamily.data.family = ProcedureType.A;

    this.dFamily =
      nodes.find(
        (n) =>
          n.data.type === StepType.CONTAINER &&
          n.data.family === ProcedureType.D
      ) ?? this.graph.addNode(StepType.CONTAINER, { x: 0, y: 500 })!;
    this.dFamily.setName("D family");
    this.dFamily.data.family = ProcedureType.D;
  }

  fFamily?: NodeModel<Step, GemmaGrafcet, Transition>;
  aFamily?: NodeModel<Step, GemmaGrafcet, Transition>;
  dFamily?: NodeModel<Step, GemmaGrafcet, Transition>;

  @computed
  get steps(): Step[] {
    return [...this.graph.nodes.values()]
      .filter((node) => !node.isHidden && node.data.type !== StepType.CONTAINER)
      .sort((a, b) => a.data.id - b.data.id)
      .map((node) => node.data);
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
    return this.steps.find((s) => s.isInitial);
  }

  @computed
  get generateMainFile(): string {
    return templateGemmaGrafcet(this);
  }

  generateProjectInFormat = (format: string): string => {
    this.generatingXML = true;
    const result = projectTemplate(this);
    this.generatingXML = false;
    return result;
  };

  @computed
  get generateSourceCode(): SourceDirectory {
    const main = templateGemmaGrafcet(this);
    const globals = templateGlobals(this.signals);
    const files = [
      new SourceFile("GEMMA.txt", main),
      new SourceFile("GVL.txt", globals),
    ];

    for (const s of this.steps.values()) {
      // if (s.type === StepType.ENCLOSING) {
      //   files.push(
      //     new SourceFile(s.name + "_FB.txt", enclosingStepTemplate(s))
      //   );
      // } else
      if (s.type === StepType.ENCLOSING || s.type === StepType.MACRO) {
        files.push(new SourceFile(s.name + "_FB.txt", macroStepTemplate(s)));
      }
    }

    return new SourceDirectory("gemma_grafcet", files);
  }

  @computed
  get warnings(): GraphWarnings {
    const signalsErrors = new Set<string>();
    let unnamedSignals = 0;
    for (const s of this.signals) {
      const isUnnamed = s.name.trim() === "";
      if (isUnnamed) {
        unnamedSignals++;
      } else if (!!s.errors["Name"]) {
        signalsErrors.add(`${s.name}. Name: ${s.errors["Name"]}.`);
      }
      if (!!s.errors["Default Value"]) {
        signalsErrors.add(
          `${isUnnamed ? "<UNNAMED>" : s.name}. Default value: ${
            s.errors["Default Value"]
          }.`
        );
      }
    }
    if (unnamedSignals > 0) {
      signalsErrors.add(
        `${unnamedSignals} signal${
          unnamedSignals === 1 ? "" : "s"
        } with no name.`
      );
    }

    const hasInitialStep = this.steps.some((s) => s.isInitial);
    const stepsWithNoInputTransitions = this.steps.filter(
      (s) => !s.node.inputs.some((n) => !n.isHidden)
    );
    const stepsWithNoOutputTransitions = this.steps.filter(
      (s) => !s.node.outputs.some((n) => !n.isHidden)
    );
    const stepsErrors = [];
    if (!hasInitialStep) {
      stepsErrors.push("No initial step.");
    }
    if (stepsWithNoOutputTransitions.length !== 0) {
      stepsErrors.push(
        `Steps with no output transitions: ${stepsWithNoOutputTransitions
          .map((s) => s.name)
          .join(", ")}`
      );
    }
    if (stepsWithNoInputTransitions.length !== 0) {
      stepsErrors.push(
        `Steps with no input transitions: ${stepsWithNoInputTransitions
          .map((s) => s.name)
          .join(", ")}`
      );
    }

    const transitionErrors = this.steps
      .flatMap((s) => s._transitions)
      .filter(
        (t) =>
          t.parsedExpression?.errors !== undefined &&
          t.parsedExpression?.errors.length > 0
      )
      .map((t) => [
        `${t.from.name} -> ${t.to.name}`,
        t.parsedExpression?.errors,
      ]);

    return {
      Steps: stepsErrors,
      Transitions: transitionErrors as any,
      Signals: [...signalsErrors.values()],
    };
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
              <TableCell>Size</TableCell>
              <TableCell>Default</TableCell>
              {showDelete && <TableCell>Delete</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {this.signals.map((s, index) => (
              <SignalRow
                signal={s}
                key={index}
                showDelete={showDelete}
                removeSignal={(s) => this.signals.remove(s)}
              />
            ))}
          </TableBody>
        </Table>
        <Button
          style={{ alignSelf: "flex-end" }}
          onClick={(_) => this.signals.push(new Signal(this))}
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
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          paddingRight: "15px",
        }}
      >
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
                ref={(e) => {
                  if (e === null) return;
                  n.setSize(e.getBoundingClientRect());
                }}
              >
                {_nodesFromFamily(n.data.family)}
              </div>
            );
          })}
      </div>
    );
  });
}

export const gemmaBuilders: DataBuilder<Step, GemmaGrafcet, Transition> = {
  graphBuilder: (g, json) => new GemmaGrafcet(g, json),
  nodeBuilder: (n, json) => {
    const type = json !== undefined ? json["type"] : undefined;
    if (typeof type === "string" && Object.keys(StepType).includes(type)) {
      return new BaseStep(n, json);
    }

    return new BaseStep(n);
  },
  connectionBuilder: (c, json) => new Transition(c, json),
};

export const make5NodesGraph = (
  db: IndexedDB
): RootStoreModel<Step, GemmaGrafcet, Transition> => {
  const rootStore = new RootStoreModel<Step, GemmaGrafcet, Transition>({
    db,
    builders: gemmaBuilders,
  });

  const s1 = rootStore.addNode(StepType.SIMPLE, { x: 72, y: 60 });
  if (s1 !== undefined) {
    s1.data.isInitial = true;
  }
  const s2 = rootStore.addNode(StepType.MACRO, { x: 261, y: 170 });

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
  rootStore.globalData.signals.push(
    new Signal(rootStore.globalData, { name: "" })
  );
  return rootStore;
};

export const makeBaseGemmaTemplate = (
  db: IndexedDB
): RootStoreModel<Step, GemmaGrafcet, Transition> => {
  const rootStore = new RootStoreModel<Step, GemmaGrafcet, Transition>({
    db,
    builders: gemmaBuilders,
    hideOnDelete: true,
    json: mm as any,
  });
  return rootStore;
};

export const makeBaseGemmaTemplateOld = (
  db: IndexedDB
): RootStoreModel<Step, GemmaGrafcet, Transition> => {
  const rootStore = new RootStoreModel<Step, GemmaGrafcet, Transition>({
    db,
    builders: gemmaBuilders,
    hideOnDelete: true,
  });

  const nodesRaw: {
    [key in ProcedureType]: {
      [key: string]: { type: StepType; x: number; y: number };
    };
  } = {
    [ProcedureType.A]: {
      A1: { type: StepType.SIMPLE, x: 517, y: 142 },
      A2: { type: StepType.SIMPLE, x: 240, y: 417 },
      A3: { type: StepType.SIMPLE, x: 418, y: 406 },
      A4: { type: StepType.SIMPLE, x: 479, y: 314 },
      A5: { type: StepType.MACRO, x: 86, y: 325 },
      A6: { type: StepType.SIMPLE, x: 156, y: 31 },
      A7: { type: StepType.MACRO, x: 239, y: 176 },
    },
    [ProcedureType.F]: {
      F1: { type: StepType.MACRO, x: 743, y: 709 },
      F2: { type: StepType.MACRO, x: 966, y: 683 },
      F3: { type: StepType.MACRO, x: 704, y: 171 },
      F4: { type: StepType.ENCLOSING, x: 848, y: 29 },
      F5: { type: StepType.ENCLOSING, x: 979, y: 478 },
      F6: { type: StepType.ENCLOSING, x: 729, y: 876 },
    },
    [ProcedureType.D]: {
      D1: { type: StepType.MACRO, x: 75, y: 895 },
      D2: { type: StepType.SIMPLE, x: 221, y: 573 },
      D3: { type: StepType.ENCLOSING, x: 309, y: 735 },
    },
  };

  const nodes: {
    [key: string]: NodeModel<Step, GemmaGrafcet, Transition>;
  } = {};

  for (const [family, nn] of Object.entries(nodesRaw)) {
    for (const [k, v] of Object.entries(nn)) {
      const n = rootStore.addNode(v.type, { x: v.x, y: v.y });
      n?.setName(k);
      n!.data.family = family as ProcedureType;
      nodes[k] = n!;
      if (k === "A6") {
        n!.data.isInitial = true;
      }
    }
  }

  const connections = {
    A1: ["F2", "F1", "F5", "F4"],
    A2: ["A1"],
    A3: ["A4"],
    A4: ["F1"],
    A5: ["A6", "A7"],
    A6: ["A1"],
    A7: ["A4"],
    F1: ["F3", "F4", "F5", "F6", "A2", "A3", "D1", "D2", "D3"],
    F2: ["F1"],
    F3: ["A1"],
    F4: ["A6"],
    F5: ["F1", "F4"],
    F6: ["F1", "D1"],
    D1: ["D2", "A5"],
    D2: ["A5"],
    D3: ["A2", "A3"],
  };

  for (const [from, v] of Object.entries(connections)) {
    for (const to of v) {
      rootStore.addConnection(nodes[from], nodes[to]);
    }
  }

  rootStore.addConnection(rootStore.globalData.fFamily!, nodes["D1"]!, {
    data: {
      conditionExpression: "I1 AND I2",
    },
  });

  const a1 = nodes["A1"]!;
  rootStore.selectNode(a1);
  rootStore.selectConnection(a1.outputs[0]);

  return rootStore;
};
