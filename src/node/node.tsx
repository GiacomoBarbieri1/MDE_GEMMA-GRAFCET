import { observer } from "mobx-react-lite";
import React from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import styled from "styled-components";
import { NodeModel } from "./node-model";
import { useStore } from "../App";

export type Shape = (number | undefined)[];

const StyledNode = styled.div`
  z-index: 1;
  cursor: pointer;
  position: absolute;
  box-shadow: 0 1px 4px 1px #eee;
  background: #fff;
  border-radius: 6;
  border: 1.5px solid;
`;

type NodeViewProps = { node: NodeModel<any, any, any> };
export const NodeView: React.FC<NodeViewProps> = observer(({ node }) => {
  const rootStore = useStore();
  const onDrag = React.useCallback(
    (_: DraggableEvent, data: DraggableData) => {
      node.move(data.deltaX, data.deltaY);
    },
    [node]
  );
  const selectingInput = rootStore.selectingInputFor !== undefined;
  const isValidInput =
    selectingInput && rootStore.selectingInputFor!.data.isValidInput(node);
  const isSelected = rootStore.selectedNode === node;

  const onClick = React.useCallback(
    (_: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      console.log(node);
      if (selectingInput) {
        if (isValidInput) {
          rootStore.assignInput(node);
        }
      } else {
        rootStore.selectNode(node);
      }
    },
    [rootStore, node, selectingInput, isValidInput]
  );
  // const [_, setDivRef] = React.useState<HTMLDivElement | null>(null);
  const { x, y } = node;

  let style: React.CSSProperties = {};
  if (isSelected) {
    style["boxShadow"] = "rgb(110 110 110) 1px 1.5px 3px 1px";
  }
  if (selectingInput) {
    style["cursor"] = isValidInput ? "pointer" : "not-allowed";
  }

  return (
    <Draggable onDrag={onDrag} position={{ x, y }} bounds="parent">
      <StyledNode
        ref={(e) => {
          if (e === null) return;
          node.setSize(e.getBoundingClientRect());
        }}
        onClick={onClick}
        style={style}
      >
        <node.data.View />
      </StyledNode>
    </Draggable>
  );
});
