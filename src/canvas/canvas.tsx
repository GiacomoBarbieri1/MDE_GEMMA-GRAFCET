import { observer } from "mobx-react-lite";
import React from "react";
import { rootStore } from "../App";
import { OperationView } from "../operation/operation";
import { ArrowView } from "./arrow";

type Props = {};

export const MainCanvas: React.FC<Props> = observer(() => {
  return (
    <div
      style={{
        position: "relative",
        border: "1px solid #eee",
        height: "100%",
        background: "#fff",
        margin: "10px"
      }}
    >
      {[...rootStore.operations.values()].map(operation => {
        return <OperationView operation={operation} key={operation.key} />;
      })}
      <svg style={{ width: "100%", height: "100%" }}>
        {rootStore.arrows.map(arrow => (
          <ArrowView arrow={arrow} key={arrow.key} />
        ))}
      </svg>
    </div>
  );
});

/* <Stage width={w} height={h}>
        <Layer>
          <Text text={`Layer: `} />
          {[...Array(10)].map((_, i) => {
            const x = Math.random() * w;
            const y = Math.random() * h;
            return (
              <Group key={i} draggable>
                <Rect
                  height={50}
                  width={60}
                  x={x}
                  y={y}
                  border="2px solid grey"
                  fill="#eee"
                  shadowBlur={3}
                  cornerRadius={5}
                />
                <Text text={`Layer: ${i}`} x={x} y={y} />
                <Portal>
                  <input
                    placeholder="bs"
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      width: "80px"
                    }}
                  ></input>
                </Portal>
                <Text text={`Layer: ${i}`} x={x} y={y} />
              </Group>
            );
          })}
        </Layer>
      </Stage> */
