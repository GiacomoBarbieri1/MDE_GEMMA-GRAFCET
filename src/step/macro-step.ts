import { MacroStep } from "./step";

export const macroStepTemplate = (model: MacroStep) =>
  `\
FUNCTION_BLOCK ${model.name}_FB

// Variable declaration
VAR_INPUT
  Initialization:BOOL;
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
