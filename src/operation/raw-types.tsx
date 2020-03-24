import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import { observable } from "mobx";
import { Instance, types } from "mobx-state-tree";
import React from "react";
import styled from "styled-components";
import { Choice, ChoiceProperty, Choices, IFMChoiceProperty } from "./choice-type";

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

export type Property =
  | StrProperty
  | BigStrProperty
  | BoolProperty
  | NumProperty
  | ChoiceProperty<any>;

export type MProperty = IMNumProperty | IMBoolProperty | IFMChoiceProperty;

export interface IProperty<T> {
  value: T;
  kind: PropertyKind;
  plotValue(): React.ReactNode;
  plotField(): React.ReactNode;
}

export interface OperationData {
  [key: string]: Property;
}

export function plotNodeForm(n: Node): React.ReactNode {
  return (
    <form>
      {Object.entries(n).map(([k, v]) => (
        <div key={k}>
          <div>{k}</div> <div> v.plotField()</div>
        </div>
      ))}
    </form>
  );
}

const PropertiesTable = styled.table`
  thead{
    font-size: 1.1em;
    font-weight: bolder;
  }
  tr td{
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
  }
`;
export function MplotNodeForm(n: {
  [key: string]: MProperty;
}): React.ReactNode {
  // const { labels, fields } = Object.entries(n).reduce(
  //   (p, [k, v]) => {
  //     p.labels.push(<div key={k}>{k}</div>);
  //     p.fields.push(<div key={k}> {v.plotField()}</div>);
  //     return p;
  //   },
  //   { labels: [], fields: [] } as {
  //     labels: Array<React.ReactNode>;
  //     fields: Array<React.ReactNode>;
  //   }
  // );

  return (
    <form>
      {/* <div className="row"> 
        <div className="col">{labels}</div>
        <div className="col">{fields}</div>
      </div> */}
      <PropertiesTable>
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
              <td>{v.plotField()}</td>
            </tr>
          ))}
        </tbody>
      </PropertiesTable>
    </form>
  );
}

export class StrProperty implements IProperty<string> {
  @observable value: string;
  kind = PropertyKind.Str;
  constructor(value: string) {
    this.value = value;
  }

  plotValue(): React.ReactNode {
    return this.value;
  }
  plotField(): React.ReactNode {
    return <input type="text" value={this.value} />;
  }
}

export class BigStrProperty implements IProperty<string> {
  @observable value: string;
  kind = PropertyKind.BigStr;
  constructor(value: string) {
    this.value = value;
  }

  plotValue(): React.ReactNode {
    return this.value;
  }
  plotField(): React.ReactNode {
    return <textarea value={this.value} />;
  }
}

export class BoolProperty implements IProperty<boolean> {
  @observable value: boolean;

  kind = PropertyKind.Bool;
  constructor(value: boolean) {
    this.value = value;
  }

  plotValue(): React.ReactNode {
    return this.value;
  }
  plotField(): React.ReactNode {
    return <input type="checkbox" defaultChecked={this.value} />;
  }
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

export class NumProperty implements IProperty<number> {
  @observable value: number;

  kind = PropertyKind.Num;
  constructor(value: number) {
    this.value = value;
  }

  plotValue(): React.ReactNode {
    return this.value;
  }
  plotField(): React.ReactNode {
    return <input type="number" value={this.value} />;
  }
}

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

// function plotForm(v: Node):React.ReactNode {
//   Object.entries(v).map(([k, v])=>{
//     if('chosen' in v){

//     }else if (typeof v =="boolean"){

//     }
//     else if (typeof v =="string"){

//     }
//     else if (typeof v =="number"){

//     }
//   });
// }

// const convProperties = {
//   depthMultiplier: types.number,
//   filters: types.union(
//     types.integer,
//     ArrCustom<Instance<typeof types.integer>>()
//   ),
//   kernelSize: types.union(types.number, types.array(types.integer)),
//   padding: types.enumeration(["valid", "same", "causal"])
// };

// interface Property {
//   kind: PropertyKind;

//   formInfo(): formInfo<typeof convProperties>;
//   plot(): React.ReactNode;
// }

// export const Conv = types
//   .model("Conv", convProperties)
//   .actions(self => ({
//     formInfo(): formInfo<Instance<typeof self>> {
//       const form = <div></div>;
//       const validate = (v: Instance<typeof self>) => ({});
//       return { form, validate };
//     },
//     plot(): React.ReactNode {
//       return <div></div>;
//     }
//   }));

// export interface IConv extends Instance<typeof Conv>{}

// function isUnionType2<IT extends ITypeUnion<any, any, any>>(type: IT): type is IT;

// function makePlot(prop: ModelProperties){
// Object.entries(prop).map(([k, v])=>{
//   if (isUnionType2(v)){
//     (v as ITypeUnion<any, any, any>).
//   }
// });
// }
