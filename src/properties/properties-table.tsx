import { ObservableMap } from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import { FieldSpec } from "../fields";

type Props = {
  self: any;
  errors: ObservableMap<string, string>;
  data: {
    [key: string]: FieldSpec;
  };
};

export const PropertiesTable = observer(({ self, errors, data }: Props) => {
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
});

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
