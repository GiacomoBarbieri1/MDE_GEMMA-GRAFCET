import { DBSchema, IDBPDatabase, openDB } from "idb";
import { JsonType } from "./store";

const DB_NAME = "GemmaGrafcet";
enum DBStores {
  graph = "graph",
  node = "node",
  connection = "connection",
}

export type GraphJson = {
  key: string;
  data: JsonType;
};

export type NodeJson = {
  key: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isHidden: boolean;
  data: JsonType;
};

type _NodeJson = NodeJson & {
  graphKey: string;
};

export type ConnectionJson = {
  from: string;
  to: string;
  isHidden: boolean;
  innerPoints: Array<{x: number, y: number}>;
  data: JsonType;
};

type _ConnectionJson = ConnectionJson & {
  key: string;
  graphKey: string;
};

interface MyDB extends DBSchema {
  [DBStores.graph]: {
    key: string;
    value: GraphJson;
  };
  [DBStores.node]: {
    key: string;
    value: _NodeJson;
    indexes: { "by-graph": string };
  };
  [DBStores.connection]: {
    key: string;
    value: _ConnectionJson;
    indexes: { "by-graph": string };
  };
}

export async function createIndexedDB() {
  const db = await openDB<MyDB>(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(DBStores.graph, {
        keyPath: "key",
        autoIncrement: false,
      });

      const nodeStore = db.createObjectStore(DBStores.node, {
        keyPath: "key",
        autoIncrement: false,
      });
      nodeStore.createIndex("by-graph", "graphKey");

      const connStore = db.createObjectStore(DBStores.connection, {
        keyPath: "key",
        autoIncrement: false,
      });
      connStore.createIndex("by-graph", "graphKey");
    },
  });
  return new IndexedDB(db);
}

export function sameKeys(conn: ConnectionJson, conn2: ConnectionJson) {
  return getKeyFromConnection(conn) === getKeyFromConnection(conn2);
}

export function getKeyFromConnection(conn: ConnectionJson) {
  return `${conn.from}_${conn.to}`;
}

export function connectionWithKey(
  graphKey: string,
  conn: ConnectionJson
): _ConnectionJson {
  return Object.assign(conn, { key: getKeyFromConnection(conn), graphKey });
}

export class IndexedDB {
  constructor(private db: IDBPDatabase<MyDB>) {}

  //
  // GRAPHS
  //

  fetchGraphs() {
    return this.db.getAll(DBStores.graph);
  }

  updateGraph(value: GraphJson) {
    return this.db.put(DBStores.graph, value);
  }

  async deleteGraph(graphKey: string) {
    const tx = this.db.transaction(
      [DBStores.graph, DBStores.node, DBStores.connection],
      "readwrite"
    );
    tx.objectStore(DBStores.graph).delete(graphKey);
    for (const dbKey of [DBStores.node, DBStores.connection] as Array<
      DBStores.node | DBStores.connection
    >) {
      let cursor = await tx
        .objectStore(dbKey)
        .index("by-graph")
        .openCursor(graphKey);
      while (cursor) {
        cursor.delete();
        cursor = await cursor.continue();
      }
    }
    await tx.done;
  }

  async loadGraph(graphKey: string) {
    const [nodes, connections] = await Promise.all([
      this.db.getAllFromIndex(DBStores.node, "by-graph", graphKey),
      this.db.getAllFromIndex(DBStores.connection, "by-graph", graphKey),
    ]);

    return { nodes, connections };
  }

  //
  // NODES
  //

  async addNodes(graphKey: string, nodes: NodeJson[]) {
    const tx = this.db.transaction(DBStores.node, "readwrite");

    const _g = { graphKey };
    for (const n of nodes) {
      tx.store.add(Object.assign(n, _g));
    }
    return await tx.done;
  }

  deleteNode(path: NodeJson) {
    return this.db.delete(DBStores.node, path.key);
  }

  async updateNode(graphKey: string, path: NodeJson) {
    return this.db.put(DBStores.node, Object.assign(path, { graphKey }));
  }

  async updateNodes(graphKey: string, nodes: Array<NodeJson>) {
    const _g = { graphKey };
    return this.updateMany(
      DBStores.node,
      nodes.map((n) => n.key),
      nodes.map((p) => Object.assign(p, _g))
    );
  }

  //
  // CONNECTIONS
  //

  async addConnections(graphKey: string, connections: ConnectionJson[]) {
    const tx = this.db.transaction(DBStores.connection, "readwrite");

    for (const p of connections) {
      tx.store.add(connectionWithKey(graphKey, p));
    }
    return await tx.done;
  }

  deleteConnection(path: ConnectionJson) {
    return this.db.delete(DBStores.connection, getKeyFromConnection(path));
  }

  async updateConnection(graphKey: string, connection: ConnectionJson) {
    return this.db.put(
      DBStores.connection,
      connectionWithKey(graphKey, connection)
    );
  }

  async updateConnections(
    graphKey: string,
    connections: Array<ConnectionJson>
  ) {
    return this.updateMany(
      DBStores.connection,
      connections.map(getKeyFromConnection),
      connections.map((p) => connectionWithKey(graphKey, p))
    );
  }

  //
  // OTHER
  //

  async closeDB() {
    this.db.close();
  }

  async clearDB() {
    await Promise.all([
      this.db.clear(DBStores.graph),
      this.db.clear(DBStores.connection),
      this.db.clear(DBStores.node),
    ]);
  }

  private async updateMany<T>(dbKey: DBStores, keys: string[], items: T[]) {
    const tx = this.db.transaction(dbKey, "readwrite");
    await Promise.all(
      items.map(async (path, index) => {
        const key = keys[index];
        const val = await tx.store.get(key);

        if (!val) {
          throw new Error();
        }
        return tx.store.put({ ...val, ...path });
      })
    );
    return await tx.done;
  }

  private async updateIncrementalSingle<T>(
    dbKey: DBStores,
    key: string,
    item: T
  ) {
    const tx = this.db.transaction(dbKey, "readwrite");
    const val = await tx.store.get(key);

    if (!val) {
      throw new Error();
    }
    tx.store.put({ ...val, ...item });
    await tx.done;
  }
}
