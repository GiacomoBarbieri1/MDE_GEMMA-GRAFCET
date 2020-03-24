import { observer } from "mobx-react-lite";
import { Instance, types } from "mobx-state-tree";
import React from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { rootStore } from "../App";
import { FMChoiceProperty } from "./choice-type";
import { MBoolProperty, MNumProperty } from "./raw-types";

function listToMap<T extends number | string>(l: Array<T>) {
  return l.reduce((p, c) => {
    p[c.toString()] = c;
    return p;
  }, {} as { [key: string]: T });
}

const convProps = types.model("", {
  kernelSize: MNumProperty,
  depthMultiplier: MNumProperty,
  strides: MNumProperty,
  padding: FMChoiceProperty("Padding", listToMap(["valid", "same", "causal"]))
});



const testM = types.model("", {
  kernelSize: types.integer,
  d: types.boolean,
  c: types.union(types.integer, types.array(types.integer))
});

const denseProps = types.model("", {
  units: MNumProperty,
  useBias: MBoolProperty,
  dtype: FMChoiceProperty(
    "DType",
    listToMap(["float32", "int32", "bool", "complex64", "string"])
  )
});

export const OperationModel = types
  .model("Operation", {
    key: types.identifier,
    name: types.string,
    x: types.number,
    y: types.number,
    width: types.maybe(types.number),
    height: types.maybe(types.number),
    data: types.union(convProps, denseProps)
  })
  .actions(self => ({
    move(dx: number, dy: number) {
      self.x += dx;
      self.y += dy;
    },
    setSize(rect: DOMRect) {
      self.width = rect.width;
      self.height = rect.height;
    },
    setName(name: string) {
      self.name = name;
    }
  }));

export interface OperationModelT extends Instance<typeof OperationModel> {}

type OperationViewProps = { operation: OperationModelT };
export const OperationView: React.FC<OperationViewProps> = observer(
  ({ operation }) => {
    const onDrag = React.useCallback(
      (_: DraggableEvent, data: DraggableData) => {
        operation.move(data.deltaX, data.deltaY);
      },
      [operation]
    );
    const onClick = React.useCallback(
      (_: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        rootStore.selectOperation(operation);
      },
      [operation]
    );
    const [divRef, setDivRef] = React.useState<HTMLDivElement | null>(null);
    const { x, y, name } = operation;
    return (
      <Draggable onDrag={onDrag} position={{ x, y }} bounds="parent">
        <div
          ref={e => {
            if (e == null) return;
            operation.setSize(e.getBoundingClientRect());
            setDivRef(e);
          }}
          onClick={onClick}
          style={{
            zIndex: 1,
            cursor: "pointer",
            position: "absolute",
            boxShadow: "0 1px 4px 1px #eee",
            padding: "6px",
            background: "#fff",
            borderRadius: 6,
            border: "1px solid #eee"
          }}
        >{`Layer ${name}`}</div>
      </Draggable>
    );
  }
);

// type Truthy2<T extends object> = {
//   [key in keyof T]: T[key] extends false ? never : key;
// }[keyof T];

// type ValidFunc<
//   C extends { [key: string]: any },
//   F extends Partial<{ [key in keyof C]: boolean }>
// > = {
//   func: (
//     values: { [P in Truthy2<F>]: P extends keyof C ? C[P]:never }
//   ) => Partial<{ [key in keyof C]: string }> | void;
//   deps: F;
// };

// type Truthy<
//   V extends { [key: string]: any },
//   F extends Partial<{ [key in keyof V]: boolean }>
// > = {
//   [key in keyof V]: key extends keyof F
//     ? F[key] extends true
//       ? V[key]
//       : never
//     : never;
// };

// type ValidFunc<
//   C extends { [key: string]: any },
//   F extends Partial<{ [key in keyof C]: boolean }>
// > = {
//   func: (values: Truthy<C, F>) => Partial<{ [key in keyof C]: string }> | void;
//   deps: F;
// };

// function createOp<T extends { [key: string]: any }>(
//   properties: T,
//   validators: Array<ValidFunc<T, Partial<{ [key in keyof T]: boolean }>>>
// ) {
//   return {
//     call: () => {
//       validators.forEach(({ func, deps }) => {
//         func(
//           Object.entries(properties).reduce((p, [k, v]) => {
//             if (k in deps && deps[k] === true) {
//               (p as any)[k as any] = v;
//             }
//             return p;
//           }, {} as Truthy<T, Partial<{ [key in keyof T]: boolean }>>)
//         );
//       });
//     }
//   };
// }

// const ss = createOp({ a: 3, b: "fe" }, [
//   {
//     func: values => {

//       console.log(values.a + 2);
//     },
//     deps: { a: false, b: true }
//   }
// ]);
// ss.call();
