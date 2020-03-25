import { observable, ObservableMap } from "mobx";
import { types } from "mobx-state-tree";
import React from "react";
import styled from "styled-components";
import { FieldSpec } from "../fields";

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
      [key in keyof V]: ReturnType<V[key]["mobxProp"]>;
    }
  );

  return types
    .model(name, {
      ...props,
      OP_TYPE: types.optional(types.literal(name), name)
    })
    .actions(self => ({
      setValue<K extends string & keyof V>(name: K, value: any) {
        self[name] = value;
      }
    }))
    .views(self => {
      const errors = observable.map<string, string>();
      return {
        form() {
          return <PropertiesTable self={self} errors={errors} data={data} />;
        }
      };
    });
};

export const PropertiesTable = ({
  self,
  errors,
  data
}: {
  self: any;
  errors: ObservableMap<string, string>;
  data: {
    [key: string]: FieldSpec;
  };
}) => {
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
          {Object.entries(data).map(([k, v]) => (
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
