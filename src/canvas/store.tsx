import {
  action,
  computed,
  IKeyValueMap,
  IMapEntries,
  observable,
  ObservableMap,
} from "mobx";
import { v4 } from "uuid";
import {
  NodeModel,
  NodeData,
  ConnModel,
  ConnectionData,
} from "../node/node-model";
import { downloadToClient } from "../utils";
import { ConnectionJson, GraphJson, IndexedDB, NodeJson } from "./persistence";

export type DataBuilder<
  D extends NodeData<D, G, C>,
  G extends GlobalData<D>,
  C extends ConnectionData<D>
> = {
  connectionBuilder: (connection: ConnModel<D, G, C>, json?: JsonType) => C;
  nodeBuilder: (node: NodeModel<D, G, C>, json?: JsonType) => D;
  graphBuilder: (graph: RootStoreModel<D, G, C>, json?: JsonType) => G;
};

type JsonTypeItem = number | string | boolean | JsonType;
export type JsonType = { [key: string]: JsonTypeItem | JsonTypeItem[] };

export interface GlobalData<D extends NodeData<D, any, any>> {
  generateMainFile: string;
  generateSourceCode: SourceDirectory;
  canAddNode(nodeType: string): boolean;
  View: React.FunctionComponent;
  toJson: JsonType;
}

type FullGraphJson = {
  graph: GraphJson;
  nodes: NodeJson[];
  connections: ConnectionJson[];
};

type ConstructParams<
  D extends NodeData<D, G, C>,
  G extends GlobalData<D>,
  C extends ConnectionData<D>
> = {
  builders: DataBuilder<D, G, C>;
  data?: G;
  key?: string;
  nodes?:
    | IMapEntries<string, NodeModel<D, G, C>>
    | IKeyValueMap<NodeModel<D, G, C>>;
};

export class RootStoreModel<
  D extends NodeData<D, G, C>,
  G extends GlobalData<D>,
  C extends ConnectionData<D>
> {
  constructor(d: {
    db: IndexedDB;
    builders: DataBuilder<D, G, C>;
    json?: FullGraphJson;
  }) {
    this.db = d.db;
    this.builders = d.builders;
    this.globalData = d.builders.graphBuilder(this, d.json?.graph.data);
    this.key = d.json?.graph.key ?? v4();

    const nodes = d.json?.nodes.reduce((m, n) => {
      const node = new NodeModel(this, {
        ...n,
        dataBuilder: d.builders.nodeBuilder,
      });

      m[n.key] = node;
      return m;
    }, {} as { [key: string]: NodeModel<D, G, C> });

    this.nodes = observable.map(nodes ?? {});

    d.json?.connections.forEach((c) => {
      // TODO:
      const from = this.nodes.get(c.from);
      const to = this.nodes.get(c.to);
      if (from !== undefined && to !== undefined) {
        this.addConnection(from, to, c.data);
      }
    });
  }

  // Builders to create graph, node and transition instances
  builders: DataBuilder<D, G, C>;
  // Global generic data
  globalData: G;
  db: IndexedDB;

  key: string;

  @observable
  resetStore: boolean = false;
  // All nodes
  @observable
  nodes: ObservableMap<string, NodeModel<D, G, C>>;
  // Selected node
  @observable
  selectedNode?: NodeModel<D, G, C>;
  // Selected connection
  @observable
  selectedConnection?: ConnModel<D, G, C>;
  // Selected input for transition
  @observable
  selectingInputFor?: NodeModel<D, G, C>;

  // Select a node
  @action
  selectNode = (node: NodeModel<D, G, C>) => {
    this.selectedNode = node;
  };

  // Select a connection
  @action
  selectConnection = (connection: ConnModel<D, G, C>) => {
    this.selectedConnection = connection;
  };

  // Add a node
  @action
  addNode = (
    nodeType: string,
    pos?: { x: number; y: number }
  ): NodeModel<D, G, C> | undefined => {
    if (this.globalData.canAddNode(nodeType)) {
      const op = new NodeModel(this, {
        dataBuilder: this.builders.nodeBuilder,
        key: v4(),
        name: nodeType,
        x: pos?.x ?? 100,
        y: pos?.y ?? 100,
        data: { type: nodeType },
      });
      this.nodes.set(op.key, op);
      return op;
    }
  };

  // remove a node
  @action
  removeNode(node: NodeModel<D, G, C>): void {
    if (node === this.selectedNode) {
      this.selectedNode = undefined;
    }
    if (this.nodes.delete(node.key)) {
      for (const _in of node.inputs) {
        _in.from.outputs.remove(_in);
      }
      for (const _out of node.outputs) {
        _out.to.inputs.remove(_out);
      }
    }
  }

  @action
  removeConnection(connection: ConnModel<D, G, C>): void {
    if (connection === this.selectedConnection) {
      this.selectedConnection = undefined;
    }
    connection.from.outputs.remove(connection);
    connection.to.inputs.remove(connection);
  }

  @computed
  get toJson(): GraphJson {
    return { data: this.globalData.toJson, key: this.key };
  }

  // Select a node
  @action
  selectingInput = (from: NodeModel<D, G, C>) => {
    this.selectingInputFor = from;
    window.addEventListener("keyup", this._selectingInputKeyListener);
  };

  @action
  assignInput = (to: NodeModel<D, G, C>): ConnModel<D, G, C> => {
    const conn = new ConnModel(
      this.selectingInputFor!,
      to,
      this.builders.connectionBuilder
    );
    conn.from.addOutput(conn);
    this.selectingInputFor = undefined;
    this.selectedConnection = conn;
    window.removeEventListener("keyup", this._selectingInputKeyListener);
    return conn;
  };

  @action
  addConnection = (
    from: NodeModel<D, G, C>,
    to: NodeModel<D, G, C>,
    json?: JsonType
  ): ConnModel<D, G, C> => {
    const conn = new ConnModel(from, to, this.builders.connectionBuilder, json);
    conn.from.addOutput(conn);
    return conn;
  };

  async saveModel() {
    const nodes = [...this.nodes.entries()];
    await this.db.clearDB();
    await Promise.all([
      this.db.updateGraph(this.toJson),
      this.db.addNodes(
        this.key,
        nodes.map(([_, value]) => value.toJson)
      ),
      this.db.addConnections(
        this.key,
        nodes.flatMap(([_, value]) => value.outputs).map((t) => t.toJson)
      ),
    ]);
  }

  downloadModel(): FullGraphJson {
    const nodes = [...this.nodes.entries()];
    const json = {
      graph: this.toJson,
      nodes: nodes.map(([_, value]) => value.toJson),
      connections: nodes
        .flatMap(([_, value]) => value.outputs)
        .map((t) => t.toJson),
    };

    console.log(json);
    downloadToClient(
      JSON.stringify(json),
      "gemma-model.json",
      "application/json"
    );
    return json;
  }

  @action
  private _selectingInputKeyListener = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") {
      this.selectingInputFor = undefined;
      window.removeEventListener("keyup", this._selectingInputKeyListener);
    }
  };
}
