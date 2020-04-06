import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { observer } from "mobx-react-lite";
import { IAnyType, IMSTMap, types } from "mobx-state-tree";
import React from "react";
import styled from "styled-components";
import { PP } from "./";

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
  M extends IAnyType
> {
  choices: C;
  default: K;

  constructor(v: { choices: C; default: K }) {
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
      errors,
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
            onChange={(e) => {
              model[name] = e.target.value as any; 
            }}
            autoWidth={true}
          >
            {keys.map((k) => {
              return <MenuItem value={k}>{k}</MenuItem>;
            })}
          </Select>
        );
      } else {
        return (
          <ButtonsDiv key={name}>
            <ButtonGroup
              size="small"
              color="primary"
              aria-label="outlined primary button group"
            >
              {keys.map((k) => {
                const buttonStyle =
                  k === (model[name] as any)
                    ? { background: "#3f51b5", color: "white" }
                    : {};

                return (
                  <Button
                    key={k}
                    onClick={() => {
                      model[name] = k as any;
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
    }
  );
}
