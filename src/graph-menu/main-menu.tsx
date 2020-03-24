import { observer } from "mobx-react-lite";
import React from "react";
import { Rnd } from "react-rnd";
import styled from "styled-components";

const MainList = styled.ul`
  overflow-y: auto;
  height: 100%;
  margin: 0;
  padding: 15px 35px 25px;

  > li {
  }
`;

type Props = {};

export const MainMenu: React.FC<Props> = observer(() => {
  return (
    <Rnd
      disableDragging={true}
      maxWidth={300}
      minWidth={200}
      style={{
        position: "relative",
        maxHeight: "100%",
        display: "flex",
        flexDirection: "column"
      }}
      enableResizing={{
        top: false,
        right: true,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
      }}
    >
      <input type="text" />
      <MainList>
        <li>
          <div>Model</div>
          <ul>
            <li>Input</li>
            <li>Loss</li>
            <li>Metric</li>
            <li>Optimizer</li>
            <li>Callback</li>
          </ul>
        </li>

        <li>
          <div>Activations</div>
          <ul>
            <li>Softmax</li>
            <li>Sigmoid</li>
            <li>Relu</li>
          </ul>
        </li>

        <li>
          <div>Layers</div>
          <ul>
            <li>Convolutional</li>
            <li>Dense</li>
            <li>Recurrent</li>
            <li>Transformer</li>
            <li>Dropout</li>
            <li>Embedding</li>
            <li>Normalization</li>
          </ul>
        </li>

        <li>
          <div>Aritmetic Operations</div>
          <ul>
            <li>Add</li>
            <li>Sub</li>
            <li>Mul</li>
            <li>Div</li>
            <li>Max</li>
            <li>Min</li>
            <li>Pow</li>
            <li>Min</li>
            <li>Exp</li>
          </ul>
        </li>

        <li>
          <div>Logic Operations</div>
          <ul>
            <li>Equal</li>
            <li>Greater</li>
            <li>Greater Equal</li>
            <li>Less</li>
            <li>Less Equal</li>
            <li>And</li>
            <li>Or</li>
            <li>Not</li>
            <li>Xor</li>
            <li>Not Equal</li>
            <li>Where</li>
          </ul>
        </li>

        <li>
          <div>Slicing / Shape</div>
          <ul>
            <li>Concat</li>
            <li>Gather</li>
            <li>Stack</li>
            <li>Tile</li>
            <li>Slice</li>
            <li>Split</li>
            <li>Reshape</li>
            <li>Traspose</li>
          </ul>
        </li>
      </MainList>
    </Rnd>
  );
});
