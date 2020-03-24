import { observer } from "mobx-react-lite";
import { types } from "mobx-state-tree";
import { Resizable } from "re-resizable";
import React from "react";
import { rootStore } from "../App";
import { BoolFieldSpec, ChoiceFieldSpec, createOp, NumFieldSpec, StrFieldSpec } from "../operation/op-model-spec";
import { MplotNodeForm } from "../operation/raw-types";

type Props = {};

const testOpId = createOp("testOpId", {
  name: new StrFieldSpec({ default: "juan", maxLength: 5 }),
  value: new NumFieldSpec({ default: 7, max: 10, isInt: true }),
  bb: new ChoiceFieldSpec({
    choices: { Hola: "Hola", Bye: "Bye" },
    default: "Hola"
  })
});

const testMap = types
  .map(testOpId)
  .create({ "1": { id: "1" }, "2": { id: "2" } });

const testOp = createOp("testOp", {
  name: new StrFieldSpec({ default: "juan", maxLength: 5 }),
  value: new NumFieldSpec({ default: 7, max: 10, isInt: true }),
  bb: new ChoiceFieldSpec({
    choices: { Hola: "Hola", Bye: "Bye" },
    default: "Hola"
  }),
  bo: new BoolFieldSpec({ default: true }),
  array: new StrFieldSpec({
    default: "[3]",
    pattern: /\d+|\[\d+\]|\[\d+,\d+\]|\[\d+,\d+,\d+\]/,
    transform: value => JSON.parse(value),
    transformInto: types.union(types.number, types.array(types.number))
  }),
  input1: new ChoiceFieldSpec({
    choices: testMap,
    default: "1"
  })
});

const c = testOp.create({ name: "d", id: "3d" });

export const PropertiesView: React.FC<Props> = observer(() => {
  let inner;
  if (rootStore.selection != null) {
    const operation = rootStore.selection;
    inner = (
      <div>
        <input
          type="text"
          value={operation.name}
          onInput={e => operation.setName(e.currentTarget.value)}
        ></input>
        {MplotNodeForm(operation.data)}
      </div>
    );
  } else {
    inner = (
      <div className="row">
        {c.form()}
        <div>Not Selected</div>
      </div>
    );
  }

  return (
    <Resizable
      minHeight={200}
      style={{
        position: "relative",
        background: "white",
        boxShadow: "0 1px 4px 1px #eee",
        padding: "15px",
        borderRadius: "6px 6px 0 0",
        border: "1px solid #eee",
        margin: "0 10px"
      }}
      enable={{
        top: true,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
      }}
    >
      {inner}
    </Resizable>
  );
});
