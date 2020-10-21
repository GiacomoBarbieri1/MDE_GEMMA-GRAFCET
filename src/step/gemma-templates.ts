import { VarId } from "./custom_parser";
import { GemmaGrafcet, Signal } from "./gemma";
import {
  EnclosingStep,
  MacroStep,
  SimpleStep,
  InitialStep,
  StepType,
} from "./step";
import { Transition } from "./transition";

export class H {
  static textOrEmpty = (cond: boolean, text: string) => (cond ? text : "");
  static stepDocumentation = (description: string) =>
    description.length === 0 ? "" : "\n//" + description.replace(/\n/g, "\n//");
}

const templateCondition = (t: Transition): string => {
  return t.expressionTokens
    .map(([tok, position]) => {
      if (tok instanceof VarId) {
        return "GVL." + tok.text;
      } else {
        return tok;
      }
    })
    .join(" ");
};

const templateTransitions = (
  transitions: Transition[],
  { isNested }: { isNested: boolean }
) => {
  return `\
${transitions
  .map((t, index) => {
    return `
${index === 0 ? "IF" : "ELSIF"} ${templateCondition(t)} THEN
  State:=${t.to.id};\
  ${isNested ? "\n  Entry:=TRUE;" : ""}`;
  })
  .join("\n")}\
${transitions.length === 0 ? "" : "\nEND_IF"}`;
};

const templateGemmaGrafcetSimpleStep = (
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

const templateGemmaGrafcetMacroStep = (model: MacroStep): string => {
  const transitions = model.transitions;
  return `
${templateFBEntry(model)}

${transitions
  .map((t, index) => {
    return `\
${index === 0 ? "IF" : "ELSIF"} ${templateCondition(t)}${
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

const templateGemmaGrafcetEnclosingStep = (model: EnclosingStep): string => {
  return `\
${templateFBEntry(model)}

${templateTransitions(model.transitions, { isNested: true })}`;
};

export const templateGlobals = (signals: Array<Signal>): string => {
  return `\
VAR_GLOBAL
    ${signals
      .map(
        (s) =>
          `${s.name} : ${s.type}${
            s.defaultValue.trim().length === 0 ? "" : " :=" + s.defaultValue
          };`
      )
      .join("\n    ")}
END_VAR
`;
};

export const templateGemmaGrafcet = (model: GemmaGrafcet): string => {
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
    .filter((s) => s.type !== StepType.CONTAINER)
    .map((step) => {
      return `
  ${step.id}: //State ${step.name}
    ${(() => {
      switch (step.type) {
        case StepType.ENCLOSING:
          return templateGemmaGrafcetEnclosingStep(step);
        case StepType.INITIAL:
        case StepType.SIMPLE:
          return templateGemmaGrafcetSimpleStep(step);
        case StepType.MACRO:
          return templateGemmaGrafcetMacroStep(step);
        default:
          throw "";
      }
    })().replace(/\n/g, "\n    ")}
  `;
    })
    .join("\n")}
END_CASE
`;
};
