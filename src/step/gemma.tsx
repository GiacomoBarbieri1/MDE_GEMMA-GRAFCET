import { templateGemmaGrafcet, templateGlobals } from "./gemma-templates";
import {
  GlobalData,
  RootStoreModel,
  DataBuilder,
  JsonType,
} from "../canvas/store";
import { action, computed, IObservableArray, observable } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { ChoiceField } from "../fields/choice-field";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "@material-ui/core/IconButton";
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
import { enclosingStepTemplate } from "./enclosing-step";
import { macroStepTemplate } from "./macro-step";
import { NodeView } from "../node/node";
import { Tooltip } from "@material-ui/core";

enum SignalTypeBase {
  bool = "bool",
  int = "int",
  uint = "uint",
  real = "real",
}

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

enum SignalTypeSize {
  s = "s",
  i = "i",
  l = "l",
  d = "d",
}

const signalTypeToPrimitives = (
  type?: SignalType
): { base: SignalTypeBase; size: SignalTypeSize } | undefined => {
  if (type === undefined) {
    return undefined;
  }
  switch (type) {
    case SignalType.bool:
      return { base: SignalTypeBase.bool, size: SignalTypeSize.i };
    case SignalType.real:
      return { base: SignalTypeBase.real, size: SignalTypeSize.i };
    case SignalType.lreal:
      return { base: SignalTypeBase.real, size: SignalTypeSize.l };
  }
  let base: SignalTypeBase;
  let index: number;
  if (type.startsWith("u")) {
    base = SignalTypeBase.uint;
    index = 1;
  } else {
    base = SignalTypeBase.int;
    index = 0;
  }

  const size = type.charAt(index) as SignalTypeSize;

  if (!Object.keys(SignalTypeSize).includes(size)) {
    return undefined;
  }

  return { base, size };
};

const signalSizeMap: { [key in SignalTypeBase]: SignalTypeSize[] } = {
  [SignalType.bool]: [SignalTypeSize.i],
  [SignalType.int]: [...Object.keys(SignalTypeSize)] as SignalTypeSize[],
  [SignalType.uint]: [...Object.keys(SignalTypeSize)] as SignalTypeSize[],
  [SignalType.real]: [SignalTypeSize.i, SignalTypeSize.l],
};

export class GemmaGrafcet implements GlobalData<Step> {
  constructor(
    private graph: RootStoreModel<Step, GemmaGrafcet, Transition>,
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
    return true;
  };

  initState(): void {
    const nodes = [...this.graph.nodes.values()];
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

  private _hasInitialStep(): boolean {
    return [...this.graph.nodes.values()].some((n) => n.data.isInitial);
  }

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
    return this.steps.find((s) => s.isInitial);
  }

  @computed
  get generateMainFile(): string {
    return templateGemmaGrafcet(this);
  }

  @computed
  get generateSourceCode(): SourceDirectory {
    const main = templateGemmaGrafcet(this);
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
                error={
                  this.signals.findIndex(
                    (s2) => s2.name === s.name && s !== s2
                  ) !== -1
                    ? "Duplicate name"
                    : undefined
                }
              />
            ))}
          </TableBody>
        </Table>
        <Button
          style={{ alignSelf: "flex-end" }}
          onClick={(_) => this.signals.push(new Signal())}
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

const SignalRow = observer(
  ({
    signal: s,
    showDelete,
    removeSignal,
    error,
  }: {
    signal: Signal;
    showDelete: boolean;
    removeSignal: (s: Signal) => void;
    error?: string;
  }) => (
    <TableRow>
      <TableCell>
        <Tooltip title={error !== undefined ? error : ""}>
          <TextField
            type="text"
            value={s.name}
            onChange={(e) => (s.name = e.target.value)}
            style={{ width: "110px" }}
            error={error !== undefined}
          />
        </Tooltip>
      </TableCell>
      <TableCell>
        <ChoiceField
          keys={Object.keys(SignalTypeBase)}
          setValue={(v) => s.setTypeBase(v as any)}
          value={s.typeBase}
        />
      </TableCell>
      <TableCell>
        <ChoiceField
          keys={signalSizeMap[s.typeBase]}
          setValue={(v) => (s.typeSize = v as any)}
          value={s.typeSize}
          maxButton={0}
        />
      </TableCell>
      <TableCell>
        <TextField
          type="text"
          value={s.defaultValue}
          onChange={(e) => {
            s.defaultValue = e.target.value.replace(/\s/g, "");
          }}
          style={{ width: "80px" }}
          error={
            s.didBlur
              ? !regexSignalDefaultValid[s.typeBase].test(s.defaultValue)
              : false
          }
          onBlur={(_) => (s.didBlur = true)}
        />
      </TableCell>
      {showDelete && (
        <TableCell align="center">
          <IconButton onClick={(_) => removeSignal(s)} size="small">
            <FontAwesomeIcon icon={"trash-alt"} color={"#000"} />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  )
);

const regexSignalDefaultValid = {
  [SignalTypeBase.bool]: /^(TRUE|FALSE)$/,
  [SignalTypeBase.int]: /^-?[1-9][0-9]*$/,
  [SignalTypeBase.uint]: /^[1-9][0-9]*$/,
  [SignalTypeBase.real]: /^-?[0-9]*\.?[0-9]+$/,
};

export class Signal {
  @observable
  didBlur: boolean = false;

  @observable
  name: string;
  @observable
  defaultValue: string;
  @observable
  typeSize: SignalTypeSize;
  @observable
  typeBase: SignalTypeBase;
  @computed
  get type(): SignalType {
    if (this.typeBase === SignalTypeBase.bool) {
      return SignalType.bool;
    }
    const sizeStr = this.typeSize === SignalTypeSize.i ? "" : this.typeSize!;
    if (this.typeBase.startsWith("u")) {
      return ("u" + sizeStr + this.typeBase.substring(1)) as SignalType;
    } else {
      return (sizeStr + this.typeBase) as SignalType;
    }
  }

  @action.bound
  setTypeBase = (base: SignalTypeBase) => {
    this.typeBase = base;
    if (!signalSizeMap[base].includes(this.typeSize)) {
      this.typeSize = signalSizeMap[base][0];
    }
  };

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
    const typePrim = signalTypeToPrimitives(d?.type);
    this.typeBase = typePrim?.base ?? SignalTypeBase.bool;
    this.typeSize = typePrim?.size ?? SignalTypeSize.i;
    this.defaultValue = d?.defaultValue ?? "";
  }
}

export const gemmaBuilders: DataBuilder<Step, GemmaGrafcet, Transition> = {
  graphBuilder: (g, json) => new GemmaGrafcet(g, json),
  nodeBuilder: (n, json) => {
    console.log(json);
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
  rootStore.globalData.signals.push(new Signal({ name: "" }));
  return rootStore;
};

export const makeBaseGemmaTemplate = (
  db: IndexedDB
): RootStoreModel<Step, GemmaGrafcet, Transition> => {
  const rootStore = new RootStoreModel<Step, GemmaGrafcet, Transition>({
    db,
    builders: gemmaBuilders,
  });

  const nodesRaw: {
    [key in ProcedureType]: {
      [key: string]: { type: StepType; x: number; y: number };
    };
  } = {
    [ProcedureType.A]: {
      A1: { type: StepType.SIMPLE, x: 497, y: 125 },
      A2: { type: StepType.SIMPLE, x: 260, y: 364 },
      A3: { type: StepType.SIMPLE, x: 444, y: 400 },
      A4: { type: StepType.SIMPLE, x: 457, y: 246 },
      A5: { type: StepType.MACRO, x: 100, y: 301 },
      A6: { type: StepType.SIMPLE, x: 173, y: 54 },
      A7: { type: StepType.MACRO, x: 239, y: 176 },
    },
    [ProcedureType.D]: {
      D1: { type: StepType.MACRO, x: 146, y: 767 },
      D2: { type: StepType.SIMPLE, x: 221, y: 573 },
      D3: { type: StepType.ENCLOSING, x: 381, y: 639 },
    },
    [ProcedureType.F]: {
      F1: { type: StepType.MACRO, x: 768, y: 707 },
      F2: { type: StepType.MACRO, x: 846, y: 233 },
      F3: { type: StepType.MACRO, x: 982, y: 147 },
      F4: { type: StepType.ENCLOSING, x: 848, y: 29 },
      F5: { type: StepType.ENCLOSING, x: 734, y: 282 },
      F6: { type: StepType.ENCLOSING, x: 722, y: 378 },
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

  for (const [from, v] of Object.entries(connections)) {
    for (const to of v) {
      rootStore.addConnection(nodes[from], nodes[to]);
    }
  }

  rootStore.addConnection(rootStore.globalData.fFamily!, nodes["D1"]!, {
    conditionExpression: "I1 AND I2",
  });

  const a1 = nodes["A1"]!;
  rootStore.selectNode(a1);
  rootStore.selectConnection(a1.outputs[0]);

  return rootStore;
};
