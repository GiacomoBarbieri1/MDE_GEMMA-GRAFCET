import { GemmaGraphcet } from "./gemma";
import {
  EnclosingStep,
  MacroStep,
  SimpleStep,
  InitialStep,
  StepType,
} from "./step";
import { Transition } from "./transition";

class H {
  static textOrEmpty = (cond: boolean, text: string) => (cond ? text : "");
}

const templateTransitions = (
  transitions: Transition[],
  { isNested }: { isNested: boolean }
) => {
  return `\
${transitions
  .map((t, index) => {
    return `
${index === 0 ? "IF" : "ELSIF"} ${t.condition.expression} THEN
  State:=${t.to.id};\
  ${isNested ? "\n  Entry:=TRUE;" : ""}`;
  })
  .join("\n")}\
${transitions.length === 0 ? "" : "\nEND_IF"}`;
};

const templateGemmaGraphcetSimpleStep = (
  model: SimpleStep | InitialStep
): string => {
  return templateTransitions(model.transitions, { isNested: false });
};

const templateFBEntry = (model: MacroStep | EnclosingStep): string => `\
IF Entry THEN
  ${model.name}(Initialization:=ENTRY);
  Entry:=FALSE;
END_IF
${model.name}(Initialization:=ENTRY);`;

const templateGemmaGraphcetMacroStep = (model: MacroStep): string => {
  const transitions = model.transitions;
  return `
${templateFBEntry(model)}

${transitions
  .map((t, index) => {
    return `\
${index === 0 ? "IF" : "ELSIF"} ${t.condition.expression}${
      transitions.length - model.innerTransitionsLength <= index
        ? ` AND ${model.name}.Complete`
        : ""
    } THEN
  State:=${t.to.id};
  Entry:=TRUE;`;
  })
  .join("\n")}\
${H.textOrEmpty(transitions.length !== 0, "\nEND_IF")}`;
};

const templateGemmaGraphcetEnclosingStep = (model: EnclosingStep): string => {
  return `\
${templateFBEntry(model)}

${templateTransitions(model.transitions, { isNested: true })}`;
};

export const templateGemmaGraphcet = (model: GemmaGraphcet): string => {
  return `
// Variable declaration
VAR
${model.steps
  .filter((s) => s.type === StepType.ENCLOSING || s.type === StepType.MACRO)
  .map((s) => `  ${s.name}:${s.name}_FB;`)
  .join("\n")}

  State:UINT:=${model.initialStep?.id};
  Entry:BOOL:=TRUE;
END_VAR

// Program behavior
CASE State OF
  ${model.steps
    .map((step) => {
      return `
  ${step.id}: //State ${step.name}
    ${(() => {
      switch (step.type) {
        case StepType.ENCLOSING:
          return templateGemmaGraphcetEnclosingStep(step);
        case StepType.INITIAL:
        case StepType.SIMPLE:
          return templateGemmaGraphcetSimpleStep(step);
        case StepType.MACRO:
          return templateGemmaGraphcetMacroStep(step);
      }
    })().replace(/\n/g, "\n    ")}
  `;
    })
    .join("\n")}
END_CASE
`;
};
