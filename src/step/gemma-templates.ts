import { VarId } from "./custom_parser";
import { GemmaGrafcet, Signal } from "./gemma";
import { EnclosingStep, MacroStep, SimpleStep, StepType } from "./step";
import { Transition } from "./transition";

export class H {
  static textOrEmpty = (cond: boolean, text: string) => (cond ? text : "");
}

const templateCondition = (t: Transition): string => {
  return t.expressionTokens
    .map(([tok, _]) => {
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

const templateGemmaGrafcetSimpleStep = (model: SimpleStep): string => {
  return templateTransitions(model.transitions, { isNested: false });
};

const templateFBEntry = (model: MacroStep | EnclosingStep): string => `\
IF Entry THEN
  ${model.name}(Initialization:=ENTRY);
  Entry:=FALSE;
END_IF
${model.name}(Initialization:=ENTRY);`;

const templateGemmaGrafcetNestedStep = (
  model: MacroStep | EnclosingStep
): string => {
  const transitions = model.transitions;
  const _evaluateComplete = (t: Transition, index: number): boolean => {
    const _isInner = transitions.length - model.innerTransitionsLength <= index;
    switch (model.type) {
      case StepType.MACRO:
        return _isInner && !t.isNegated;
      case StepType.ENCLOSING:
        return _isInner && t.isNegated;
    }
    throw new Error("");
  };

  return `
${templateFBEntry(model)}

${transitions
  .map((t, index) => {
    return `\
${index === 0 ? "IF" : "ELSIF"} ${templateCondition(t)}${
      _evaluateComplete(t, index) ? ` AND ${model.name}.Complete` : ""
    } THEN
  State:=${t.to.id};
  Entry:=TRUE;`;
  })
  .join("\n")}\
${H.textOrEmpty(transitions.length !== 0, "\nEND_IF")}`;
};

export const templateGlobals = (signals: Array<Signal>): string => {
  return `\
VAR_GLOBAL
    ${signals
      .map(
        (s) =>
          `${s.name} : ${s.type.toUpperCase()}${
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
    .map((step) => {
      return `
  ${step.id}: //State ${step.name}
    ${(() => {
      switch (step.type) {
        case StepType.SIMPLE:
          return templateGemmaGrafcetSimpleStep(step);
        case StepType.ENCLOSING:
        case StepType.MACRO:
          return templateGemmaGrafcetNestedStep(step);
        default:
          throw new Error("");
      }
    })().replace(/\n/g, "\n    ")}
  `;
    })
    .join("\n")}
END_CASE
`;
};
