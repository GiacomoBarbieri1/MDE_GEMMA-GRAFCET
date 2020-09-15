import { MacroStep } from "./gemma";

export const macroStepTemplate = (model: MacroStep) =>
  `
// Variable declaration
VAR_INPUT
  Initionalization:BOOL;
END_VAR

VAR_OUTPUT
  Complete:BOOL;
END_VAR

// FB behavior
IF Initialization THEN
  Complete:=FALSE;
  //Initialization actions

END_IF

//Nested behavior

//Termination of the nested behavior
Complete:=TRUE;
`;
