import { EnclosingStep } from "./step";

export const enclosingStepTemplate = (model: EnclosingStep) =>
  `\
FUNCTION_BLOCK ${model.name}_FB

// Variable declaration
VAR_INPUT
  Initialization:BOOL;
END_VAR

// FB behavior
IF Initialization THEN
  //Initialization actions

END_IF

//Nested behavior

`;
