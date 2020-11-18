import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { observer } from "mobx-react-lite";
import { IAnyType, IMSTMap, types } from "mobx-state-tree";
import React from "react";
import styled from "styled-components";
import { FieldSpec, PP2 } from "./";

const ButtonsDiv = styled.div`
  min-height: 38px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export class ChoiceFieldSpec<
  V,
  K extends C extends IMSTMap<M> ? string : string & keyof C,
  C extends { [key: string]: V } | IMSTMap<M>,
  M extends IAnyType,
  MM extends { [key: string]: FieldSpec }
> {
  choices: C;
  default: K;
  onChange?: (n: V) => void;

  constructor(v: { choices: C; default: K; onChange?: (n: V) => void }) {
    this.choices = v.choices;
    this.default = v.default;
    this.onChange = v.onChange;
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

  plotField: React.FC<PP2<MM, string>> = observer(({ name, model }) => {
    let keys;
    if (this.isObservableMap()) {
      keys = Array.from(
        (this.choices as any).keys() as IterableIterator<string>
      );
    } else {
      keys = Object.keys(this.choices);
    }
    return (
      <ChoiceField
        value={model[name]}
        setValue={(v) => {
          model[name] = v as any;
          if (this.onChange !== undefined) this.onChange(v as any);
        }}
        keys={keys}
      />
    );
  });
}

export const ChoiceField = <V extends string>({
  keys,
  value,
  setValue,
  maxButton,
}: {
  keys: V[];
  value: V;
  setValue: (v: V) => void;
  maxButton?: number;
}) => {
  if (keys.length > (maxButton ?? 3)) {
    return (
      <Select
        value={value}
        onChange={(e) => {
          setValue(e.target.value as any);
        }}
        autoWidth={true}
        style={{ minHeight: "35px", marginBottom: "3px" }}
        disabled={keys.length <= 1}
      >
        {keys.map((k) => {
          return (
            <MenuItem key={k} value={k}>
              {k}
            </MenuItem>
          );
        })}
      </Select>
    );
  } else {
    return (
      <ButtonsDiv>
        <ButtonGroup
          size="small"
          color="primary"
          aria-label="outlined primary button group"
        >
          {keys.map((k) => {
            const buttonStyle =
              k === value ? { background: "#3f51b5", color: "white" } : {};

            return (
              <Button
                key={k}
                onClick={() => {
                  setValue(k);
                }}
                style={buttonStyle}
              >
                {k}
              </Button>
            );
          })}
        </ButtonGroup>
      </ButtonsDiv>
    );
  }
};
