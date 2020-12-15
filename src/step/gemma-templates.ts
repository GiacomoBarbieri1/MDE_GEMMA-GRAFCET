import { VarId } from "./custom_parser";
import { GemmaGrafcet } from "./gemma";
import { EnclosingStep, MacroStep, SimpleStep, StepType } from "./step";
import { Transition } from "./transition";
import { Signal } from "./signal";

export class H {
  static textOrEmpty = (cond: boolean, text: string) => (cond ? text : "");
}

export const memoryTransitionSuffix = (t: Transition): string => {
  return `_${t.from.name}_${t.priority}_MEM`;
};

const templateCondition = (t: Transition): string => {
  return t.expressionTokens
    .map(([tok, _]) => {
      // Is signal
      if (tok instanceof VarId) {
        const withMemory =
          t.savedSignalsWithMemory.get(tok.text)?.withMemory ?? false;

        return withMemory
          ? tok.text + memoryTransitionSuffix(t)
          : isNaN(Number.parseFloat(tok.text))
          ? "GVL." + tok.text
          : tok.text;
      } else if (t.connection.graph.globalData.generatingXML) {
        switch (tok) {
          case "<":
            return "&lt;";
          case ">":
            return "&gt;";
          case "<=":
            return "&lt;=";
          case ">=":
            return "&gt;=";
          case "<>":
            return "&lt;&gt;";
          default:
            return tok;
        }
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
${model.transitions
  .flatMap((t) =>
    t.signalsWithMemory.map(
      (sm) =>
        `  ${sm.value}${memoryTransitionSuffix(t)} := ${
          sm.behaviour === "NO" ? "FALSE" : "TRUE"
        };`
    )
  )
  .join("\n")}
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
    let condition = templateCondition(t);
    if (_evaluateComplete(t, index)) {
      if (condition.trim().length === 0) {
        condition = `${model.name}.Complete`;
      } else {
        condition = `(${condition}) AND ${model.name}.Complete`;
      }
    }
    return `\
${index === 0 ? "IF" : "ELSIF"} ${condition} THEN
  State:=${t.to.id};
  Entry:=TRUE;
`;
  })
  .join("\n")}\
${H.textOrEmpty(transitions.length !== 0, "\nEND_IF")}`;
};

export const templateGlobals = (signals: Array<Signal>): string => {
  return `\
VAR_GLOBAL
    ${signals
      .map((s) => {
        const defaultValue =
          s.defaultValue.trim().length === 0 ? "" : " :=" + s.defaultValue;
        return `${s.name} : ${s.type.toUpperCase()}${defaultValue};`;
      })
      .join("\n    ")}
END_VAR
`;
};

const gemmaVariables = (model: GemmaGrafcet): string => {
  return `\
// Variable declaration
VAR
${model.steps
  .filter((s) => s.type === StepType.ENCLOSING || s.type === StepType.MACRO)
  .map((s) => `  ${s.name}:${s.name}_FB;`)
  .join("\n")}
${model.steps
  .filter((s) => s.type === StepType.ENCLOSING || s.type === StepType.MACRO)
  .flatMap((s) => s.transitions)
  .flatMap((t) =>
    t.signalsWithMemory.map((sm) => {
      const assign = sm.behaviour === "NO" ? "FALSE" : "TRUE";
      return `  ${sm.value}${memoryTransitionSuffix(t)}:BOOL:=${assign};`;
    })
  )
  .join("    \n")}

  State:UINT:=${model.initialStep?.id};
  Entry:BOOL:=TRUE;
END_VAR    
`;
};

export const templateGemmaGrafcet = (model: GemmaGrafcet): string => {
  return `
${gemmaVariables(model)}
${gemmaBehaviour(model)}
`;
};

export const gemmaBehaviour = (model: GemmaGrafcet): string => {
  return `
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

${model.steps
  .filter((s) => s.type === StepType.ENCLOSING || s.type === StepType.MACRO)
  .flatMap((s) => s.transitions)
  .flatMap((t) =>
    t.signalsWithMemory.map((sm) => {
      const prefix = sm.behaviour === "NC" ? "NOT " : "";
      const assign = sm.behaviour === "NO" ? "TRUE" : "FALSE";
      return `\
IF State = ${t.from.id} AND ${prefix}GVL.${sm.value} THEN
  ${sm.value}${memoryTransitionSuffix(t)} := ${assign};
END_IF
`;
    })
  )
  .join("\n")}
`;
};
