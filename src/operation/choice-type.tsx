import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { observable } from "mobx";
import { IModelType, Instance, ModelProperties, types } from "mobx-state-tree";
import React from "react";
import { IProperty, PropertyKind } from "./raw-types";

export class Choice<M extends Map<string, ListableChoice>> {
  @observable chosen?: keyof M;
  constructor(public choices: M, defaultChosen?: keyof M) {
    this.chosen = defaultChosen;
  }
}

export const MChoice = types.model("Choice", {
  chosen: types.maybe(types.string),
  choices: types.map(types.union(types.number, types.string))
});

export interface IMChoice extends Instance<typeof MChoice> {}

export function FMChoice<T extends ModelProperties>(
  choices: IModelType<T, any>
) {
  return types.model("Choice", {
    chosen: types.maybe(types.string),
    choices
  });
}

export interface IFMChoice extends Instance<ReturnType<typeof FMChoice>> {}

export const MChoiceProperty = types
  .model("ChoiceProperty", { value: MChoice })
  .views(self => ({
    plotValue(): React.ReactNode {
      return self.value.chosen;
    },
    plotField(): React.ReactNode {
      return (
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={self.value.chosen}
          onChange={() => {}}
        >
          {Array.from(self.value.choices.entries()).map(([k, v]) => {
            return <MenuItem value={k}>{v}</MenuItem>;
          })}
        </Select>
      );
    }
  }));
export interface IMChoiceProperty extends Instance<typeof MChoiceProperty> {}

export function FMChoiceProperty<T extends { [key: string]: string }>(
  name: string,
  choices: T
) {
  const choicesModel = types.model(name, choices);
  return types
    .model(`${name}ChoiceProperty`, {
      chosen: types.maybe(types.string),
      choices: choicesModel
    })
    .actions(self => ({
      setChosen(s: string) {
        self.chosen = s;
      }
    }))
    .views(self => ({
      plotValue(): React.ReactNode {
        return self.chosen;
      },
      plotField(): React.ReactNode {
        const keys = Object.keys(choices);
        if (keys.length > 3) {
          return (
            <Select value={self.chosen} onChange={() => {}} autoWidth={true}>
              {keys.map(k => {
                return <MenuItem value={k}>{self.choices[k]}</MenuItem>;
              })}
            </Select>
          );
        } else {
          // return (
          //   <RadioGroup value={self.chosen} onChange={() => {}} row>
          //     {keys.map(k => {
          //       return (
          //         <FormControlLabel
          //           value={k}
          //           control={<Radio color="primary" size="small" />}
          //           label={k}
          //           labelPlacement="top"
          //         />
          //       );
          //     })}
          //   </RadioGroup>
          // );
          return (
            <div style={{minHeight: "38px", display: "flex",
            flexDirection: "column", justifyContent: "center"}}> 
            <ButtonGroup
              size="small"
              color="primary"
              aria-label="outlined primary button group"
            >
              {keys.map(k => {
                const isChosen = k === self.chosen;
                return (
                  <Button
                    key={k}
                    onClick={() => self.setChosen(k)}
                    style={
                      isChosen ? { background: "#3f51b5", color: "white" } : {}
                    }
                  >
                    {k}
                  </Button>
                );
              })}
            </ButtonGroup></div>
          );
        }
      }
    }));
}
export interface IFMChoiceProperty
  extends Instance<ReturnType<typeof FMChoiceProperty>> {}

type ListableChoice = string | number | IListableChoice;

interface IListableChoice {
  listTile(): React.ReactNode;
}

export class ChoiceProperty<T extends Map<string, ListableChoice>>
  implements IProperty<Choice<T>> {
  @observable
  value: Choice<T>;

  kind = PropertyKind.Choice;
  constructor(value: Choice<T>) {
    this.value = value;
  }

  plotValue(): React.ReactNode {
    return this.value.chosen;
  }
  plotField(): React.ReactNode {
    return (
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={this.value.chosen}
        onChange={() => {}}
      >
        {Array.from(this.value.choices.entries()).map(([k, v]) => {
          return (
            <MenuItem value={k}>
              {typeof v === "string" || typeof v === "number"
                ? v
                : v.listTile()}
            </MenuItem>
          );
        })}
      </Select>
    );
  }
}

// Choices
export type Choices<M extends Map<string, ListableChoice>> = {
  chosen?: Set<keyof M>;
  choices: M;
};
