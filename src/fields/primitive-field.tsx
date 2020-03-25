import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import { observer } from "mobx-react-lite";
import { types } from "mobx-state-tree";
import React from "react";
import { PP } from "./";

export class StrFieldSpec<
  KM extends string & keyof M,
  M extends { setValue: (key: KM, value: any) => void; [key: string]: any }
> {
  default: string;
  maxLength?: number;
  minLength?: number;

  constructor(v: { default: string; maxLength?: number; minLength?: number }) {
    this.default = v.default;
    this.maxLength = v.maxLength;
    this.minLength = v.minLength;

    if (typeof this.default === "string") {
      if (
        this.minLength !== undefined &&
        this.default.length < this.minLength
      ) {
        throw Error("");
      } else if (
        this.maxLength !== undefined &&
        this.default.length > this.maxLength
      ) {
        throw Error("");
      }
    }
  }

  mobxProp = () => {
    if (this.default !== undefined) {
      return types.optional(types.string, this.default);
    } else {
      return types.string;
    }
  };

  plotField = observer(({ name, model, errors }: PP<KM, M>) => {
    const [value, setValue] = React.useState(model[name] as string);

    return (
      <TextField
        key={name}
        value={value}
        inputProps={{ style: { textAlign: "center" } }}
        onChange={e => {
          let value = e.target.value;
          setValue(value);

          if (this.maxLength !== undefined && value.length > this.maxLength) {
            errors.set(name, "Max length exceded.");
          } else if (
            this.minLength !== undefined &&
            value.length < this.minLength
          ) {
            errors.set(name, "Min length exceded.");
          } else {
            errors.delete(name);
            model.setValue(name, value);
          }
        }}
        error={errors.get(name) !== undefined}
        fullWidth={true}
        style={{ width: "120px" }}
      />
    );
  });
}

export class BoolFieldSpec {
  default: boolean;
  required?: boolean;

  constructor(v: { default: boolean; required?: boolean }) {
    this.default = v.default;
    this.required = v.required !== undefined ? v.required : true;
  }

  mobxProp = () => {
    if (this["default"] === undefined) {
      return types.boolean;
    } else {
      return types.optional(types.boolean, this.default);
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

export class NumFieldSpec {
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
          inputProps={{
            min: this.min,
            max: this.max,
            step: this.step,
            style: { textAlign: "center" }
          }}
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
          style={{ width: "80px" }}
        />
      );
    }
  );
}
