import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import { observable, ObservableMap } from "mobx";
import { observer } from "mobx-react-lite";
import { IAnyType, IMSTMap, IOptionalIType, ISimpleType, types } from "mobx-state-tree";
import React from "react";
import styled from "styled-components";
import { PropertyKind } from "./raw-types";

interface FieldSpecI {
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

type PP<
  K extends string & keyof M,
  M extends { setValue: (key: K, value: any) => void }
> = {
  name: K;
  model: M;
  errors: ObservableMap<string, string>;
};

export class NumFieldSpec implements FieldSpecI {
  type: PropertyKind.Num = PropertyKind.Num;
  default: number;
  min?: number;
  max?: number;
  step?: number;
  isInt: boolean;

  constructor(v: {
    default: number;
    min?: number;
    max?: number;
    step?: number;
    isInt?: boolean;
  }) {
    this.default = v.default;
    this.min = v.min;
    this.max = v.max;
    this.step = v.step;
    this.isInt = v.isInt !== undefined ? v.isInt : false;
    if (this.min !== undefined && this.default < this.min) {
      throw Error("");
    } else if (this.max !== undefined && this.default > this.max) {
      throw Error("");
    }
    if (this.isInt) {
      this.default = Math.round(this.default);
      if (this.step === undefined) {
        this.step = 1;
      } else {
        this.step = Math.round(this.step);
      }
    }
  }

  mobxProp = () =>
    this.default !== undefined
      ? types.optional(types.number, this.default)
      : types.number;

  plotField = observer(
    <
      KM extends string & keyof M,
      M extends { setValue: (key: KM, value: any) => void; [key: string]: any }
    >({
      name,
      model,
      errors
    }: PP<KM, M>) => {
      const [value, setValue] = React.useState(
        ((model[name] as any) as number).toString()
      );

      return (
        <TextField
          key={name}
          value={value}
          inputProps={{ min: this.min, max: this.max, step: this.step }}
          type="number"
          onChange={e => {
            setValue(e.target.value);

            let num: number;
            if (this.isInt) {
              num = parseInt(e.target.value, 10);
            } else {
              num = parseFloat(e.target.value);
            }

            if (!Number.isNaN(num)) {
              errors.delete(name);
              model.setValue(name, num);
            } else {
              errors.set(name, "invalid");
            }
          }}
          fullWidth={true}
          style={{ width: "100px" }}
        />
      );
    }
  );
}

export class StrFieldSpec<T> {
  type: PropertyKind.Str = PropertyKind.Str;
  default: string;
  pattern?: string | RegExp;
  maxLength?: number;
  minLength?: number;
  transform?: (value: string) => T;
  transformInto?: IAnyType;

  constructor(v: {
    default: string;
    pattern?: string | RegExp;
    maxLength?: number;
    minLength?: number;
    transform?: (value: string) => T;
    transformInto?: IAnyType;
  }) {
    this.default = v.default;
    this.pattern = v.pattern;
    this.maxLength = v.maxLength;
    this.minLength = v.minLength;
    this.transform = v.transform;
    this.transformInto = v.transformInto;

    if (this.minLength !== undefined && this.default.length < this.minLength) {
      throw Error("");
    } else if (
      this.maxLength !== undefined &&
      this.default.length > this.maxLength
    ) {
      throw Error("");
    }

    if (this.pattern !== undefined && !this.default.match(this.pattern)) {
      throw Error("RegExp pattern doesn't match");
    }

    if (
      (this.transform != undefined && this.transformInto == undefined) ||
      (this.transform == undefined && this.transformInto != undefined)
    ) {
      throw Error("Transform");
    }
  }

  mobxProp = () =>
    this.transform === undefined || this.transformInto === undefined
      ? this.default !== undefined
        ? types.optional(types.string, this.default)
        : types.string
      : this.default !== undefined
      ? types.optional(this.transformInto, this.transform(this.default))
      : this.transformInto;

  plotField = observer(
    <
      KM extends string & keyof M,
      M extends { setValue: (key: KM, value: any) => void; [key: string]: any }
    >({
      name,
      model,
      errors
    }: PP<KM, M>) => {
      const [value, setValue] = React.useState(
        this.transform !== undefined ? JSON.stringify(model[name]) : model[name]
      );
      return (
        <TextField
          key={name}
          value={value}
          // inputProps={{ pattern: this.pattern }}
          onChange={e => {
            let value = e.target.value;
            let match;
            if (this.pattern != undefined) {
              value = value.replace(/\s/g, "");
              match = value.match(this.pattern);
            }
            setValue(value);

            if (this.maxLength !== undefined && value.length > this.maxLength) {
              errors.set(name, "Max length exceded.");
            } else if (
              this.minLength !== undefined &&
              value.length < this.minLength
            ) {
              errors.set(name, "Min length exceded.");
            } else if (
              this.pattern != undefined &&
              (match === null || match?.index !== 0)
            ) {
              errors.set(name, "Pattern doesn't match.");
            } else if (this.transform != undefined) {
              errors.delete(name);
              model.setValue(name, this.transform(value));
            } else {
              errors.delete(name);
              model.setValue(name, value);
            }
          }}
          error={errors.get(name) !== undefined}
          fullWidth={true}
          style={{ width: "150px" }}
        />
      );
    }
  );
}

export class BoolFieldSpec {
  type: PropertyKind.Bool = PropertyKind.Bool;
  default: boolean;
  required?: boolean;

  constructor(v: { default: boolean; required?: boolean }) {
    this.default = v.default;
    this.required = v.required !== undefined ? v.required : true;
  }

  mobxProp = (): this["default"] extends undefined
    ? ISimpleType<boolean>
    : IOptionalIType<ISimpleType<boolean>, [undefined]> => {
    if (this["default"] === undefined) {
      return types.boolean as any;
    } else {
      return types.optional(types.boolean, this.default) as any;
    }
  };

  plotField = observer(
    <
      KM extends string & keyof M,
      M extends { setValue: (key: KM, value: any) => void; [key: string]: any }
    >({
      name,
      model,
      errors
    }: PP<KM, M>) => {
      return (
        <Switch
          checked={model[name]}
          onChange={() => model.setValue(name, !model[name])}
          color="primary"
        />
      );
    }
  );
}

export class ChoiceFieldSpec<
  V,
  K extends C extends IMSTMap<M> ? string : string & keyof C,
  C extends { [key: string]: V } | IMSTMap<M>,
  M extends IAnyType
> {
  type: PropertyKind.Choice = PropertyKind.Choice;
  choices: C;
  default?: K;

  constructor(v: { choices: C; default?: K }) {
    this.choices = v.choices;
    this.default = v.default;
    if (this.isObservableMap()) {
      if ((this.choices as any).get(this.default) === null) {
        throw Error("");
      }
    }
  }

  isObservableMap = () => {
    return (
      typeof this.choices.keys === "function" &&
      typeof this.choices.size === "number" &&
      Symbol.toStringTag in this.choices
    );
  };

  mobxProp = () =>
    this.default !== undefined
      ? types.optional(types.string, this.default)
      : types.string;

  plotField = observer(
    <
      KM extends string & keyof M,
      M extends {
        setValue: (key: KM, value: any) => void;
        [key: string]: any;
      }
    >({
      name,
      model,
      errors
    }: PP<KM, M>) => {
      let keys;
      if (this.isObservableMap()) {
        keys = Array.from(
          (this.choices as any).keys() as IterableIterator<string>
        );
      } else {
        keys = Object.keys(this.choices);
      }

      if (keys.length > 3) {
        return (
          <Select
            value={model[name]}
            onChange={e => model.setValue(name, e.target.value)}
            autoWidth={true}
          >
            {keys.map(k => {
              return <MenuItem value={k}>{k}</MenuItem>;
            })}
          </Select>
        );
      } else {
        return (
          <div
            key={name}
            style={{
              minHeight: "38px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <ButtonGroup
              size="small"
              color="primary"
              aria-label="outlined primary button group"
            >
              {keys.map(k => {
                return (
                  <Button
                    key={k}
                    onClick={() => model.setValue(name, k)}
                    style={
                      k === (model[name] as any)
                        ? { background: "#3f51b5", color: "white" }
                        : {}
                    }
                  >
                    {k}
                  </Button>
                );
              })}
            </ButtonGroup>
          </div>
        );
      }
    }
  );
}

// const constFn = <
//   V,
//   K extends string & keyof C,
//   C extends { [key: string]: V }
// >(v: {
//   choices: C;
//   default?: K;
// }) => {
//   return new ChoiceFieldSpec(v);
// };

export type FieldSpec =
  | NumFieldSpec
  | StrFieldSpec<any>
  | ChoiceFieldSpec<any, any, any, any>
  | BoolFieldSpec;

type RemoveUndefined<T> = T extends undefined ? never : T;

export const createOp = <V extends { [key: string]: FieldSpec }>(
  name: string,
  data: V
) => {
  const props = Object.entries(data).reduce(
    (acc, [k, v]) => {
      acc[k as keyof V] = v.mobxProp() as any;
      return acc;
    },
    {} as {
      [key in keyof V]: V[key]["default"] extends undefined
        ? ISimpleType<RemoveUndefined<V[key]["default"]>>
        : IOptionalIType<ISimpleType<V[key]["default"]>, [undefined]>;
    }
  );

  return types
    .model(name, { ...props, id: types.identifier })
    .actions(self => ({
      setValue<K extends string & keyof V>(name: K, value: any) {
        self[name] = value;
        console.log(self[name], value);
      }
    }))
    .views(self => {
      const errors = observable.map<string, string>();
      return {
        form() {
          return PropertiesTable(self, errors, data);
          // return (
          //   <div>
          //     {Object.entries(data).map(([k, v]) => {
          //       return (
          //         <div key={k}>
          //           <v.plotField name={k} model={self} errors={errors} />
          //           {errors.get(k)}
          //         </div>
          //       );
          //     })}
          //   </div>
          // );
        }
      };
    });
};

const PropertiesTableStyled = styled.table`
  thead {
    font-size: 1.1em;
    font-weight: bolder;
  }
  tr td {
    padding: 0;
  }
  tr td:first-child {
    padding-right: 15px;
    height: 32px;
  }
  tr td:last-child {
    margin: auto auto;
    padding-left: 10px;
    text-align: center;
    align-self: center;
  }
`;

export function PropertiesTable(
  self: any,
  errors: ObservableMap<string, string>,
  n: {
    [key: string]: FieldSpec;
  }
): React.ReactNode {
  return (
    <form>
      <PropertiesTableStyled>
        <thead>
          <tr>
            <td>Property</td>
            <td>Value</td>
          </tr>
        </thead>
        <tbody>
          {Object.entries(n).map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>
                <v.plotField name={k} model={self} errors={errors} />
              </td>
            </tr>
          ))}
        </tbody>
      </PropertiesTableStyled>
    </form>
  );
}
