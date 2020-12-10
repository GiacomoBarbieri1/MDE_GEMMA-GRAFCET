import { JsonType } from "../canvas/store";
import { action, computed, observable } from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";
import TextField from "@material-ui/core/TextField";
import { ChoiceField } from "../fields/choice-field";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "@material-ui/core/IconButton";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import "./gemma-styles.css";
import { Tooltip } from "@material-ui/core";
import { GemmaGrafcet } from "./gemma";

enum SignalTypeBase {
  bool = "bool",
  int = "int",
  uint = "uint",
  real = "real",
}

export enum SignalType {
  bool = "bool",

  sint = "sint",
  int = "int",
  lint = "lint",
  dint = "dint",

  usint = "usint",
  uint = "uint",
  ulint = "ulint",
  udint = "udint",

  real = "real",
  lreal = "lreal",
}

enum SignalTypeSize {
  s = "s",
  i = "i",
  l = "l",
  d = "d",
}

const signalTypeToPrimitives = (
  type?: SignalType
): { base: SignalTypeBase; size: SignalTypeSize } | undefined => {
  if (type === undefined) {
    return undefined;
  }
  switch (type) {
    case SignalType.bool:
      return { base: SignalTypeBase.bool, size: SignalTypeSize.i };
    case SignalType.real:
      return { base: SignalTypeBase.real, size: SignalTypeSize.i };
    case SignalType.lreal:
      return { base: SignalTypeBase.real, size: SignalTypeSize.l };
  }
  let base: SignalTypeBase;
  let index: number;
  if (type.startsWith("u")) {
    base = SignalTypeBase.uint;
    index = 1;
  } else {
    base = SignalTypeBase.int;
    index = 0;
  }

  const size = type.charAt(index) as SignalTypeSize;

  if (!Object.keys(SignalTypeSize).includes(size)) {
    return undefined;
  }

  return { base, size };
};

const signalSizeMap: { [key in SignalTypeBase]: SignalTypeSize[] } = {
  [SignalType.bool]: [SignalTypeSize.i],
  [SignalType.int]: [...Object.keys(SignalTypeSize)] as SignalTypeSize[],
  [SignalType.uint]: [...Object.keys(SignalTypeSize)] as SignalTypeSize[],
  [SignalType.real]: [SignalTypeSize.i, SignalTypeSize.l],
};

export const SignalRow = observer(
  ({
    signal: s,
    showDelete,
    removeSignal,
  }: {
    signal: Signal;
    showDelete: boolean;
    removeSignal: (s: Signal) => void;
  }) => {
    return (
      <TableRow>
        <TableCell>
          <Tooltip
            title={s.errors["Name"] !== undefined ? s.errors["Name"] : ""}
          >
            <TextField
              type="text"
              value={s.name}
              onChange={(e) => (s.name = e.target.value.replace(/\s/g, ""))}
              style={{ width: "145px" }}
              error={s.errors["Name"] !== undefined}
            />
          </Tooltip>
        </TableCell>
        <TableCell>
          <ChoiceField
            keys={Object.keys(SignalTypeBase)}
            setValue={(v) => s.setTypeBase(v as any)}
            value={s.typeBase}
          />
        </TableCell>
        <TableCell>
          <ChoiceField
            keys={signalSizeMap[s.typeBase]}
            setValue={(v) => (s.typeSize = v as any)}
            value={s.typeSize}
            maxButton={0}
          />
        </TableCell>
        <TableCell>
          <Tooltip
            title={
              s.errors["Default Value"] !== undefined
                ? s.errors["Default Value"]
                : ""
            }
          >
            <TextField
              type={s.typeBase === SignalTypeBase.bool ? "text" : "number"}
              value={s.defaultValue}
              onChange={(e) => {
                s.defaultValue = e.target.value.replace(/\s/g, "");
              }}
              style={{ width: "70px" }}
              error={s.errors["Default Value"] !== undefined}
            />
          </Tooltip>
        </TableCell>
        {showDelete && (
          <TableCell align="center">
            <IconButton onClick={(_) => removeSignal(s)} size="small">
              <FontAwesomeIcon icon={"trash-alt"} color={"#000"} />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
    );
  }
);

const regexSignalDefaultValid = {
  [SignalTypeBase.bool]: {
    regex: /^(TRUE|FALSE)$/,
    message: 'should be "TRUE" or "FALSE"',
  },
  [SignalTypeBase.int]: {
    regex: /^(-?[1-9][0-9]*|0)$/,
    message: "should be an integer",
  },
  [SignalTypeBase.uint]: {
    regex: /^([1-9][0-9]*|0)$/,
    message: "should be a positive integer",
  },
  [SignalTypeBase.real]: {
    regex: /^-?[0-9]*\.?[0-9]+$/,
    message: "should be a number",
  },
};

export class Signal {
  @observable
  didBlur: boolean = false;

  @observable
  name: string;
  @observable
  defaultValue: string;
  @observable
  typeSize: SignalTypeSize;
  @observable
  typeBase: SignalTypeBase;
  @computed
  get type(): SignalType {
    if (this.typeBase === SignalTypeBase.bool) {
      return SignalType.bool;
    }
    const sizeStr = this.typeSize === SignalTypeSize.i ? "" : this.typeSize!;
    if (this.typeBase.startsWith("u")) {
      return ("u" + sizeStr + this.typeBase.substring(1)) as SignalType;
    } else {
      return (sizeStr + this.typeBase) as SignalType;
    }
  }

  @action.bound
  setTypeBase = (base: SignalTypeBase) => {
    this.typeBase = base;
    if (!signalSizeMap[base].includes(this.typeSize)) {
      this.typeSize = signalSizeMap[base][0];
    }
  };

  @computed
  get errors() {
    const name =
      this.automationSystem.signals.findIndex(
        (s2) => s2.name === this.name && this !== s2
      ) !== -1
        ? "Duplicate name"
        : undefined;

    const validator = regexSignalDefaultValid[this.typeBase];
    const hasError =
      this.defaultValue.length !== 0 &&
      !validator.regex.test(this.defaultValue);
    const defaultValueError = hasError ? validator.message : undefined;

    return { Name: name, "Default Value": defaultValueError };
  }

  description?: string;

  @computed
  get toJson(): JsonType {
    return {
      name: this.name,
      type: this.type,
      defaultValue: this.defaultValue,
    };
  }

  static fromJson(
    automationSystem: GemmaGrafcet,
    json: JsonType
  ): Signal | undefined {
    if (
      typeof json["name"] === "string" &&
      Object.keys(SignalType).includes(json["type"] as any)
    ) {
      return new Signal(automationSystem, json);
    } else {
      return undefined;
    }
  }

  constructor(
    private automationSystem: GemmaGrafcet,
    d?: {
      name?: string;
      description?: string;
      type?: SignalType;
      defaultValue?: string;
    }
  ) {
    this.name = d?.name ?? "";
    this.description = d?.description;
    const typePrim = signalTypeToPrimitives(d?.type);
    this.typeBase = typePrim?.base ?? SignalTypeBase.bool;
    this.typeSize = typePrim?.size ?? SignalTypeSize.i;
    this.defaultValue = d?.defaultValue ?? "";
  }
}
