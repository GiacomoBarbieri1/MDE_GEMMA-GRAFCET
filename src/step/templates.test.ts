import {
  GemmaGraphcet,
  gemmaBuilders,
} from "./gemma";
import { NodeModel, ConnModel } from "../node/node-model";
import { RootStoreModel } from "../canvas/store";
import { StepType, Step } from "./step";
import { Transition } from "./transition";
import { IndexedDB } from "../canvas/persistence";
jest.mock("../canvas/persistence");
export {};

const mockedClass = <jest.Mock<IndexedDB>>IndexedDB;

describe("Graph Api", () => {
  const rootStore = new RootStoreModel<Step, GemmaGraphcet, Transition>({
    db: mockedClass(),
    builders: gemmaBuilders,
  });

  const s1 = rootStore.addNode(StepType.INITIAL, { x: 72, y: 60 });
  const s2 = rootStore.addNode(StepType.MACRO, { x: 261, y: 170 });
  const _badId = rootStore.addNode("Not Valid Id", { x: 261, y: 170 });

  test("add node", () => {
    expect(rootStore.nodes.size).toBe(2);
    expect(_badId).toBe(undefined);
    expect(s1 !== undefined).toBeTruthy();
  });

  test("add connection", () => {
    expect(rootStore.selectingInputFor).toBeUndefined();

    rootStore.selectingInput(s1!);

    expect(rootStore.selectingInputFor).toBe(s1);

    const conn = rootStore.assignInput(s2!);

    expect(conn.from).toBe(s1);
    expect(conn.to).toBe(s2);

    expect(s1?.inputs.length).toBe(0);
    expect(s2?.inputs.length).toBe(1);
    expect(s1?.outputs.length).toBe(1);
    expect(s2?.outputs.length).toBe(0);

    expect(rootStore.selectingInputFor).toBeUndefined();
  });
});

// describe("F family transition", ()=>{
//   const rootStore = new RootStoreModel<Step, GemmaGraphcet, Transition>({
//     builders: gemmaBuilders,
//   });

//   const _t = new ConnModel(
//     s1!,
//     s2!,
//     (c) =>
//       new Transition(c, {
//         name: "Emergency",
//         condition: new Condition("I1 & I2"),
//       })
//   );
//   rootStore.globalData.workingFamilyTransitions.push(_t.data);

//   const nodes = [
//     s1,
//     s2,
//     rootStore.addNode(StepType.ENCLOSING, { x: 441, y: 316 }),
//     rootStore.addNode(StepType.SIMPLE, { x: 211, y: 410 }),
//     rootStore.addNode(StepType.SIMPLE, { x: 441, y: 500 }),
//   ];
//   nodes.forEach((s, index) => s?.setName(`S${index + 1}`));

//   s1!.data.family = ProcedureType.A;
//   s2!.data.family = ProcedureType.D;
// });

describe("Validation", () => {
  const rootStore = new RootStoreModel<Step, GemmaGraphcet, Transition>({
    db: mockedClass(),
    builders: gemmaBuilders,
  });

  const n1 = rootStore.addNode(StepType.INITIAL);
  const n2 = rootStore.addNode(StepType.INITIAL);
  const n3 = rootStore.addNode(StepType.ENCLOSING);

  test("can add node", () => {
    expect(rootStore.globalData.canAddNode(StepType.INITIAL)).toBeFalsy();
    expect(n1 !== undefined).toBeTruthy();
    expect(n2).toBeUndefined();
    expect(rootStore.nodes.size).toBe(2);
  });

  test("is valid input", () => {
    expect(n3?.data.isValidInput(n1!)).toBeTruthy();
    rootStore.selectingInput(n1!);
    rootStore.assignInput(n3!);
    expect(n3?.data.isValidInput(n1!)).toBeFalsy();
  });
});
