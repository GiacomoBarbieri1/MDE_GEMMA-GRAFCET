import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import { rootStore } from "../App";
import { OperationModel } from "../operation/operation-model";

type Props<M extends OperationModel> = {
  model: M;
};

export const PropertiesTable = observer(
  <M extends OperationModel>({ model }: Props<M>) => {
    const self = model.data;
    const fullOfInputs = self.inputs.length >= self.nInputs;
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
            {self.nInputs !== 0 && (
              <tr>
                <td>Inputs</td>
                <td>
                  {self.inputs.map((v) => (
                    <div key={v.key}>{v.name}</div>
                  ))}
                  {!fullOfInputs && (
                    <div onClick={() => rootStore.selectingInput(model)}>
                      Add Input
                    </div>
                  )}
                </td>
              </tr>
            )}
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
