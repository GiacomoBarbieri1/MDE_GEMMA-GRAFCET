import { observer } from "mobx-react-lite";
import React from "react";
import { useStore } from "../App";
import { ArrowView } from "./arrow";
import "./canvas.css";

type Props = {};

export const MainCanvas: React.FC<Props> = observer(() => {
  const rootStore = useStore();
  const ops = [...rootStore.nodes.values()];

  return (
    <div
      style={{
        overflow: "auto",
        flex: "1",
        outline: "none",
        background: "white",
      }}
      id="canvas-scroll"
      tabIndex={0}
      onMouseMove={(_) => {
        if (rootStore.selectedPointIndex !== undefined) {
          const target = document.getElementById(
            "canvas-scroll"
          )! as HTMLElement;
          target.focus();
        }
      }}
      onKeyUp={(event) => {
        if (
          event.key === "Escape" &&
          rootStore.selectedPointIndex !== undefined &&
          rootStore.selectedConnection !== undefined
        ) {
          rootStore.selectedConnection.innerPoints.splice(
            rootStore.selectedPointIndex,
            1
          );
          rootStore.selectedPointIndex = undefined;
        }
      }}
    >
      <div className="canvas-wrapper" style={{ background: "white" }}>
        {/* <CanvasWidget engine={engine} className="canvas-widget" /> */}
        <rootStore.globalData.CanvasView />
        <svg
          style={{ width: "100%", height: "100%", position: "absolute" }}
          id="canvas-svg"
        >
          {ops
            .flatMap((op) => op.inputs)
            .map((connection) => (
              <ArrowView
                connection={connection}
                key={connection.from.key + connection.to.key}
              />
            ))}
        </svg>
      </div>
    </div>
  );
});
