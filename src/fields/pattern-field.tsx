import TextField from "@material-ui/core/TextField";
import { observer } from "mobx-react-lite";
import { IAnyType, types } from "mobx-state-tree";
import React from "react";
import { PP } from "./";

const _patternError = "Pattern doesn't match.";
export class PatternFieldSpec<
  T,
  Tr extends (value: string) => T,
  KM extends string & keyof M,
  M extends { setValue: (key: KM, value: any) => void; [key: string]: any },
  MT extends IAnyType
> {
  default: T;
  pattern: string | RegExp | ((state: M) => string | RegExp);
  maxLength?: number;
  minLength?: number;
  transform: Tr;
  transformInto: MT;
  deps?: string[];

  constructor(v: {
    default: T;
    pattern: string | RegExp | ((state: M) => string | RegExp);
    maxLength?: number;
    minLength?: number;
    transform: Tr;
    transformInto: MT;
    deps?: string[];
  }) {
    this.default = v.default;
    this.pattern = v.pattern;
    this.maxLength = v.maxLength;
    this.minLength = v.minLength;
    this.transform = v.transform;
    this.transformInto = v.transformInto;
    this.deps = v.deps;

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

      if (
        this.pattern !== undefined &&
        typeof this.pattern !== "function" &&
        !this.default.match(this.pattern)
      ) {
        throw Error("RegExp pattern doesn't match");
      }
    }

    if (
      (this.transform !== undefined && this.transformInto === undefined) ||
      (this.transform === undefined && this.transformInto !== undefined)
    ) {
      throw Error("Transform");
    }
  }

  isTransformed = () => {
    return (
      (this.transform === undefined || this.transformInto === undefined) &&
      typeof this.default === "string"
    );
  };

  mobxProp = () => {
    return types.optional(this.transformInto, this.default);
  };

  plotField = observer(({ name, model, errors }: PP<KM, M>) => {
    const [value, setValue] = React.useState(
      this.transform !== undefined
        ? JSON.stringify(model[name])
        : (model[name] as string)
    );

    const deps =
      this.deps !== undefined
        ? [...this.deps.map(d => model[d]), this.pattern, model]
        : [this.pattern, model];

    React.useEffect(() => {
      if (this.pattern !== undefined && typeof this.pattern === "function") {
        const err = errors.get(name);
        if (err === _patternError) {
          const match = value.match(this.pattern(model));
          if (!(match === null || match.index !== 0)) {
            errors.delete(name);
          }
        } else if (err === undefined) {
          const match = value.match(this.pattern(model));
          if (match === null || match.index !== 0) {
            errors.set(name, _patternError);
          }
        }
      }
    }, [value, ...deps]);

    return (
      <TextField
        key={name}
        value={value}
        inputProps={{ style: { textAlign: "center" } }}
        onChange={e => {
          let value = e.target.value;
          let match;
          if (this.pattern !== undefined) {
            value = value.replace(/\s/g, "");
            const p =
              typeof this.pattern === "function"
                ? this.pattern(model)
                : this.pattern;
            match = value.match(p as any);
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
            this.pattern !== undefined &&
            (match === null || match?.index !== 0)
          ) {
            errors.set(name, _patternError);
          } else if (this.transform !== undefined) {
            errors.delete(name);
            model.setValue(name, this.transform(value));
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
