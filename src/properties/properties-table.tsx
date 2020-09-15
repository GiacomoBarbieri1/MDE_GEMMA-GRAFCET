import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import { NodeModel, NodeData } from "../node/node-model";
import { useStore } from "../App";

type Props<D extends NodeData<D, any, any>> = {
  self: NodeModel<D, any, any>;
};

export const PropertiesTable = observer(
  <D extends NodeData<D, any, any>>({ self }: Props<D>) => {
    const rootStore = useStore();
    const fullOfInputs = self.inputs.length >= self.data.nInputs;
    const isAddingInput = rootStore.selectingInputFor != undefined;
    return (
      <PropertiesTableStyled>
        <thead>
          <tr>
            <td>Property</td>
            <td>Value</td>
          </tr>
        </thead>
        <tbody>
          {self.data.nInputs !== 0 && (
            <tr>
              <td>Inputs</td>
              <td>
                {self.inputs.map((v) => (
                  <div
                    onClick={() => rootStore.selectConnection(v as any)}
                    key={v.from.key}
                  >
                    {v.from.name}
                  </div>
                ))}
                {!fullOfInputs && (
                  <div
                    onClick={() => rootStore.selectingInput(self as any)}
                    style={
                      isAddingInput
                        ? { background: "#eee" }
                        : { cursor: "pointer" }
                    }
                  >
                    Add Transition
                  </div>
                )}
              </td>
            </tr>
          )}
          {Object.entries(self.data.spec).map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>
                <v.plotField name={k} model={self.data as any} />
              </td>
            </tr>
          ))}
        </tbody>
      </PropertiesTableStyled>
    );
  }
);

const PropertiesTableStyled = styled.table`
  padding-bottom: 10px;
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
