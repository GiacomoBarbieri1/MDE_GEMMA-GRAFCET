import { ObservableMap } from "mobx";
import { OperationI } from "../operation/operation-model";
import { ChoiceFieldSpec } from "./choice-field";
import { PatternFieldSpec } from "./pattern-field";
import { BoolFieldSpec, NumFieldSpec, StrFieldSpec } from "./primitive-field";

export interface FieldSpecI<M extends { [key: string]: FieldSpec }, T> {
  plotField: React.FunctionComponent<PP2<M, T>>;
}

export type PP<K extends string & keyof M, M> = {
  name: K;
  model: M;
  errors: ObservableMap<string, string>;
};

type TypeKeys<V, T> = {
  [k in keyof V]: V[k] extends T ? k : never;
}[keyof V];
type OnlyType<V, T> = { [k in TypeKeys<V, T>]: T };

type FilteredKeyOf<T, TK> = keyof Pick<
  T,
  { [K in keyof T]: T[K] extends TK ? K : never }[keyof T]
>;

export type PP2<M extends { [key: string]: FieldSpec }, T> = {
  name: string & keyof M["spec"] & keyof M;
  model: OperationI<M>;
};

export type FieldSpec =
  | NumFieldSpec<any>
  | StrFieldSpec<any>
  | PatternFieldSpec<any, any, any, any, any>
  | ChoiceFieldSpec<any, any, any, any, any>
  | BoolFieldSpec<any>;

export { NumFieldSpec, StrFieldSpec, PatternFieldSpec, ChoiceFieldSpec, BoolFieldSpec, };

