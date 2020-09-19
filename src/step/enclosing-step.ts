import { EnclosingStep } from "./gemma";

export const enclosingStepTemplate = (model: EnclosingStep) =>
  `
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
