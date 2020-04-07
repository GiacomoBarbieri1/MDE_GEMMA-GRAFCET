import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { observer } from "mobx-react-lite";
import React from "react";
import { Rnd } from "react-rnd";
import styled from "styled-components";
import { rootStore } from "../App";
import { ConvolutionOp, DenseOp, InputOp } from "../operation/layers";
import { OperationData } from "../operation/operation-model";
import { resizableEnable } from "../utils";

const MainList = styled.ul`
  overflow-y: scroll;
  height: 100%;
  margin: 0;
  padding: 0px 10px 25px;

  .group {
    padding-left: 10px;
    padding-top: 3px;
    padding-bottom: 3px;
    border-top: 2px solid #eee;
    margin-top: 6px;
    .MuiListItemText-primary {
      font-weight: bold;
    }
  }
  .nested {
    padding-left: 25px;
    padding-top: 0px;
    padding-bottom: 0px;
  }
`;

type Props = {};

const layerToClass: { [key: string]: () => OperationData } = {
  Input: () => new InputOp(),
  Convolutional: () => new ConvolutionOp(),
  Dense: () => new DenseOp(),
};
const listItems = {
  Model: ["Input", "Loss", "Metric", "Optimizer", "Callback"],
  Layers: [
    "Convolutional",
    "Dense",
    "Recurrent",
    "Transformer",
    "Dropout",
    "Embedding",
    "Normalization",
  ],
  Activations: ["Softmax", "Sigmoid", "Relu"],
  "Slice / Shape": [
    "Concat",
    "Gather",
    "Stack",
    "Tile",
    "Slice",
    "Split",
    "Reshape",
    "Traspose",
  ],
};

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
        flexDirection: "column",
      }}
      enableResizing={resizableEnable({
        right: true,
      })}
    >
      <input type="text" />
      <MainList>
        <List component="nav">
          {Object.entries(listItems).map(([name, list]) => (
            <Item key={name} name={name} list={list} />
          ))}
        </List>
      </MainList>
    </Rnd>
  );
});

type ItemProps = { name: string; list: string[] };

export const Item: React.FC<ItemProps> = observer(({ name, list }) => {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <ListItem button onClick={() => setOpen(!open)} className="group">
        <ListItemText primary={name} />
        <FontAwesomeIcon icon={open ? "chevron-up" : "chevron-down"} />
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {list.map((t) => (
            <ListItem
              button
              key={t}
              className="nested"
              onClick={() => {
                if (t in layerToClass) {
                  const data = layerToClass[t]();
                  rootStore.addOperation(data);
                }
              }}
            >
              <ListItemText primary={t} />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
});

/* <li>
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
        </li> */
