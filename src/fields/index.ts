import { ObservableMap } from "mobx";
import { ChoiceFieldSpec } from "./choice-field";
import { PatternFieldSpec } from "./pattern-field";
import { BoolFieldSpec, NumFieldSpec, StrFieldSpec } from "./primitive-field";

export interface FieldSpecI {
  plotField: React.FunctionComponent<
    PP<
      string,
      {
        [key: string]: any;
        setValue: (key: any, value: any) => void;
      }
    >
  >;
}

export type PP<
  K extends string & keyof M,
  M extends { setValue: (key: K, value: any) => void }
> = {
  name: K;
  model: M;
  errors: ObservableMap<string, string>;
};

export type FieldSpec =
  | NumFieldSpec
  | StrFieldSpec<any, any>
  | PatternFieldSpec<any, any, any, any, any>
  | ChoiceFieldSpec<any, any, any, any>
  | BoolFieldSpec;

export { NumFieldSpec, StrFieldSpec, PatternFieldSpec, ChoiceFieldSpec, BoolFieldSpec };

