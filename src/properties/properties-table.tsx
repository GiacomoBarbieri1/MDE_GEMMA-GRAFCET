import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import { OperationData } from "../operation/operation-model";

type Props<M extends OperationData> = {
  self: M;
};

export const PropertiesTable = observer(
  <M extends OperationData>({ self }: Props<M>) => {
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
            {Object.entries(self.spec).map(([k, v]) => (
              <tr key={k}>
                <td>{k}</td>
                <td>
                  <v.plotField name={k as keyof M} model={self} />
                </td>
              </tr>
            ))}
          </tbody>
        </PropertiesTableStyled>
      </form>
    );
  }
);

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
