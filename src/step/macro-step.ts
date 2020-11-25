import { MacroStep, EnclosingStep } from "./step";

const variables = (model: MacroStep | EnclosingStep): string => {
  return `
FUNCTION_BLOCK ${model.name}_FB

// Variable declaration
VAR_INPUT
  Initialization:BOOL;
END_VAR

VAR_OUTPUT
  Complete:BOOL;
END_VAR
`;
};

export const macroStepBehaviour = (model: MacroStep | EnclosingStep) =>
  `\
// FB behavior
IF Initialization THEN
  Complete:=FALSE;
  // Initialization actions

END_IF

// Nested behavior

// Termination of the nested behavior
Complete:=TRUE;
`;

export const macroStepTemplate = (model: MacroStep | EnclosingStep) =>
  `\
${variables(model)}
${macroStepBehaviour(model)}
`;
