import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import { observable } from "mobx";
import { Instance, types } from "mobx-state-tree";
import React from "react";
import { Choice, Choices, IFMChoiceProperty } from "./choice-type";

type formInfo<T extends { [key: string]: any }> = {
  validate: (
    values: T
  ) => {
    error?: string;
    errors?: {
      [key in keyof T]: string | undefined;
    };
  };
  form: React.ReactNode;
};

type AllProps =
  | number
  | string
  | boolean
  | Choices<any>
  | Choice<any>
  | Map<string, AllProps>;

export enum PropertyKind {
  Num = "Num",
  Str = "Str",
  BigStr = "BigStr",
  Bool = "Bool",
  Choice = "Choice",
  Choices = "Choices",
  Map = "Map"
}

const MPropertyKind = types.enumeration<PropertyKind>(
  "PropertyKind",
  Object.values(PropertyKind)
);

export type MProperty = IMNumProperty | IMBoolProperty | IFMChoiceProperty;

export interface IProperty<T> {
  value: T;
  kind: PropertyKind;
  plotValue(): React.ReactNode;
  plotField(): React.ReactNode;
}


export const MBoolProperty = types
  .model("BoolProperty", {
    value: types.boolean
  })
  .actions(self => ({
    toggleValue() {
      self.value = !self.value;
    }
  }))
  .views(self => ({
    plotValue(): React.ReactNode {
      return self.value;
    },
    plotField(): React.ReactNode {
      return (
        <Switch 
          checked={self.value}
          onChange={self.toggleValue}
          color="primary"
        />
      );
    }
  }));
export interface IMBoolProperty extends Instance<typeof MBoolProperty> {}


export const MNumProperty = types
  .model("NumProperty", { value: types.number })
  .actions(self => ({
    onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      if (!e.target.value) return;
      self.value = parseInt(e.target.value, 10); 
      console.log(self.value);
    }
  }))
  .views(self => {
    let valueStr = observable.box(self.value.toString());
    return {
      plotValue(): React.ReactNode {
        return self.value;
      },
      plotField(): React.ReactNode {
        return (
          <TextField
            type="number"
            value={valueStr}
            onChange={e => { 
              valueStr.set(e.target.value);
              self.onChange(e);
            }}
            fullWidth={true}
            style={{width:"100px"}}
          />
        );
      }
    };
  });
export interface IMNumProperty extends Instance<typeof MNumProperty> {}
