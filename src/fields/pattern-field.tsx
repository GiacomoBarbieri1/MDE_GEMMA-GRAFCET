import TextField from "@material-ui/core/TextField";
import { observer } from "mobx-react-lite";
import { IAnyType, SnapshotIn, types } from "mobx-state-tree";
import React from "react";
import { OperationData } from "../operation/operation-model";
import { PP2 } from "./";

const _patternError = "Pattern doesn't match.";
export class PatternFieldSpec<
  T,
  Tr extends (value: string) => T,
  KM extends string & keyof M,
  M extends OperationData & { [key: string]: any },
  MT extends IAnyType
> {
  default: T;
  pattern: string | RegExp | ((state: M) => string | RegExp);
  maxLength?: number;
  minLength?: number;
  transform: Tr;
  transformFrom: (value: T) => string;
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
    transformFrom?: (value: T) => string;
  }) {
    this.default = v.default;
    this.pattern = v.pattern;
    this.maxLength = v.maxLength;
    this.minLength = v.minLength;
    this.transform = v.transform;
    this.transformInto = v.transformInto;
    this.deps = v.deps;
    this.transformFrom = v.transformFrom ?? JSON.stringify;

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

  plotField = observer(({ name, model }: PP2<M, SnapshotIn<MT>>) => {
    const [value, setValue] = React.useState(this.transformFrom(model[name]));
    const errors = model.errors;
    const deps =
      this.deps !== undefined
        ? [...this.deps.map((d) => model[d]), this.pattern, model]
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
      // eslint-disable-next-line
    }, [value, ...deps]);

    return (
      <TextField
        key={name}
        value={value}
        inputProps={{ style: { textAlign: "center" } }}
        onChange={(e) => {
          let value = e.target.value.replace(/\s/g, "");
          setValue(value);
          const p =
            typeof this.pattern === "function"
              ? this.pattern(model)
              : this.pattern;
          const match = value.match(p);

          if (this.maxLength !== undefined && value.length > this.maxLength) {
            errors.set(name, "Max length exceded.");
          } else if (
            this.minLength !== undefined &&
            value.length < this.minLength
          ) {
            errors.set(name, "Min length exceded.");
          } else if (match === null || match?.index !== 0) {
            errors.set(name, _patternError);
          } else if (this.transform !== undefined) {
            errors.delete(name);
            model[name] = this.transform(value) as any;
          } else {
            errors.delete(name);
            model[name] = value as any;
          }
        }}
        error={errors.get(name) !== undefined}
        fullWidth={true}
        style={{ width: "120px" }}
      />
    );
  });
}
