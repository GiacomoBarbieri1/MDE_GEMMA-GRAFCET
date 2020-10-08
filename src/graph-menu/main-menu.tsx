import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { observer } from "mobx-react-lite";
import React from "react";
import { Rnd } from "react-rnd";
import styled from "styled-components";
import { resizableEnable } from "../utils";
import { useStore } from "../App";

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

type Props = { items: { [key: string]: string[] } | string[] };

export const MainMenu: React.FC<Props> = observer(({ items }) => {
  const rootStore = useStore();
  return (
    <Rnd
      disableDragging={true}
      maxWidth={300}
      minWidth={150}
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
          {Array.isArray(items)
            ? items.map((t) => (
                <ListItem
                  button
                  key={t}
                  className="nested"
                  onClick={() => {
                    rootStore.addNode(t);
                  }}
                >
                  <ListItemText primary={t} />
                </ListItem>
              ))
            : Object.entries(items).map(([name, list]) => (
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
  const rootStore = useStore();
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
                rootStore.addNode(t);
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