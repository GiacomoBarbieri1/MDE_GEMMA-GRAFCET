import { H } from "./gemma-templates";
import { EnclosingStep } from "./step";

export const enclosingStepTemplate = (model: EnclosingStep) =>
  `\
FUNCTION_BLOCK ${model.name}_FB\
${H.stepDocumentation(model.description)}

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
