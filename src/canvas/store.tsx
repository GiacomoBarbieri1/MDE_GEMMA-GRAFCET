import { action, observable, ObservableMap } from "mobx";
import { v4 } from "uuid";
import { NodeModel, NodeData, ConnModel } from "../node/node-model";

export type DataBuilder<
  D extends NodeData<D, G, C>,
  G extends GlobalData<D>,
  C extends ConnectionData<D>
> = {
  connectionBuilder: (connection: ConnModel<D, G, C>) => C;
  nodeBuilder: { [key: string]: (node: NodeModel<D, G, C>) => D };
  graphBuilder: (connection: RootStoreModel<D, G, C>) => G;
};

export interface GlobalData<D extends NodeData<D, any, any>> {
  generateCode(): string;
  canAddNode(nodeType: string): boolean;
  View: React.FunctionComponent;
}

export type ConnectionData<D> = {
  ConnectionView: React.FunctionComponent;
  connectionText: string;
};

export class RootStoreModel<
  D extends NodeData<D, G, C>,
  G extends GlobalData<D>,
  C extends ConnectionData<D>
> {
  @action
  removeConnection(connection: ConnModel<D, G, C>): void {
    if (connection === this.selectedConnection) {
      this.selectedConnection = undefined;
    }
    connection.from.outputs.remove(connection);
    connection.to.inputs.remove(connection);
  }

  constructor(d: { builders: DataBuilder<D, G, C> }) {
    this.builders = d.builders;
    this.globalData = d.builders.graphBuilder(this);
  }

  // Builders to create graph, node and transition instances
  builders: DataBuilder<D, G, C>;
  // Global generic data
  globalData: G;

  // All nodes
  @observable
  nodes: ObservableMap<string, NodeModel<D, G, C>> = observable.map({});
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
      const dataBuilder = this.builders.nodeBuilder[nodeType];
      if (dataBuilder !== undefined) {
        const op = new NodeModel(this, {
          dataBuilder,
          key: v4(),
          name: nodeType,
          x: pos?.x ?? 100,
          y: pos?.y ?? 100,
        });
        this.nodes.set(op.key, op);
        return op;
      }
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
    return conn;
  };

  @action
  private _selectingInputKeyListener = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") {
      this.selectingInputFor = undefined;
      window.removeEventListener("keyup", this._selectingInputKeyListener);
    }
  };
}
