import { observer } from "mobx-react-lite";
import React from "react";
import { NodeModel, ConnModel, NodeData } from "../node/node-model";
import { useStore } from "../App";

export type ArrowModel = {
  from: NodeModel<any, any, any>;
  to: NodeModel<any, any, any>;
};

type ArrowViewProps = { connection: ConnModel<any, any, any> };

const triangleFromCenter = (
  x: number,
  y: number,
  height: number = 14,
  width: number = 14
) => {
  const y0 = y + height;
  return `M${x} ${y} L${x - width / 2} ${y0} L${x + width / 2} ${y0} Z`;
};

const getStartPositionConnection = (
  from: NodeModel<any, any, any>
): { x: number; y: number } => {
  const connectionStartPosition = (from.data as NodeData<any, any, any>)
    .connectionStartPosition;

  if (connectionStartPosition !== undefined) {
    const b = connectionStartPosition();
    if (b !== undefined) {
      let x = from.x;
      let y = from.y;
      if ("top" in b) {
        y += b.top;
      } else {
        y += from.height - b.bottom;
      }

      if ("left" in b) {
        x += b.left;
      } else {
        y += from.width - b.right;
      }
      return { x, y };
    }
  }
  return { x: from.x + from.width / 2, y: from.y + from.height / 2 };
};

type TwoPoints = {
  y1: number;
  x1: number;
  x2: number;
  y2: number;
};

export const ArrowView: React.FC<ArrowViewProps> = observer(
  ({ connection }: ArrowViewProps) => {
    const rootStore = useStore();

    if (connection.isHidden && !rootStore.showHidden) {
      return <></>;
    }
    const { from, to, isSelected } = connection;
    let { x: x1, y: y1 } = getStartPositionConnection(from);

    const [x2, y2] = [to.x + to.width / 2, to.y + to.height / 2];

    // const getRelative = (event: {
    //   clientX: number;
    //   clientY: number;
    // }): { x: number; y: number } => {
    //   const canvasScrollBbox = document
    //     .getElementsByClassName("canvas-wrapper")[0]!
    //     .getBoundingClientRect();
    //   return {
    //     x: event.clientX - canvasScrollBbox.left,
    //     y: event.clientY - canvasScrollBbox.top,
    //   };
    // };

    const addInnerPoint = (
      event: { clientX: number; clientY: number },
      index: number
    ) => {
      // connection.innerPoints.splice(index, 0, getRelative(event));
    };

    const points: JSX.Element[] = [];
    const connectionPoints = { y1, x1, x2, y2 };
    const Triangle = ({
      y1,
      x1,
      x2,
      y2,
      withNodeDelta,
    }: TwoPoints & { withNodeDelta: boolean }) => {
      const dy = y2 - y1;
      const dx = x2 - x1;

      let changeX = 0;
      let changeY = 0;
      if (withNodeDelta) {
        if (dx === 0) {
          changeX = 0;
          changeY = ((y2 > y1 ? 1 : -1) * to.height) / 2;
        } else if (dy === 0) {
          changeY = 0;
          changeX = ((x2 > x1 ? 1 : -1) * to.width) / 2;
        } else {
          const m = Math.abs(dy / dx);
          const [deltaX, deltaY] =
            m > to.height / to.width
              ? [to.height / 2 / m, to.height / 2]
              : [to.width / 2, (to.width / 2) * m];
          changeY = (y2 > y1 ? 1 : -1) * deltaY;
          changeX = (x2 > x1 ? 1 : -1) * deltaX;
        }
      }
      const xa = x2 - changeX;
      const ya = y2 - changeY;
      const degrees = 90 + (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

      return (
        <path
          d={triangleFromCenter(xa, ya)}
          transform={`rotate(${degrees} ${xa} ${ya})`}
          onClick={(_) => rootStore.selectConnection(connection)}
        />
      );
    };
    const connectionText = ({ y1, x1, x2, y2 }: TwoPoints) => {
      const [xm, ym] = [(x1 + x2) / 2, (y1 + y2) / 2];
      return (
        <RectAndText
          connection={connection}
          texts={connection.data.connectionText}
          x={xm}
          rectFill={isSelected ? "#eeedff" : "#eee"}
          y={ym}
          onClick={(_) => rootStore.selectConnection(connection)}
        />
      );
    };
    let firstArrow;

    return (
      <>
        <>
          {connection.innerPoints.map((p, index) => {
            points.push(
              <circle
                cx={p.x}
                cy={p.y}
                r="1.1"
                fill="black"
                key={`${connection.from.key}${connection.to.key}${index}`}
                onClick={(_) => {
                  // connection.graph.selectedConnection = connection;
                  // if (connection.graph.selectedPointIndex !== undefined) {
                  //   connection.graph.selectedPointIndex = undefined;
                  // } else {
                  //   connection.graph.selectedPointIndex = index;
                  // }
                }}
              />
            );
            const key = `${connection.from.key}${connection.to.key}${
              index - 1
            }${index}`;

            const lineAndPoint = (
              <path
                key={key}
                style={{
                  strokeWidth: 3,
                  stroke: "black",
                  opacity: connection.isHidden ? 0.07 : 1,
                }}
                d={`M${x1} ${y1} L${p.x} ${p.y}`}
                onClick={(event) => {
                  if (event.shiftKey) {
                    addInnerPoint(event, index);
                  } else {
                    rootStore.selectConnection(connection);
                  }
                }}
              />
            );
            if (index === 0) {
              firstArrow = (
                <Triangle
                  key={key + "t"}
                  x1={x1}
                  y1={y1}
                  x2={p.x}
                  y2={p.y}
                  withNodeDelta={false}
                />
              );
            }

            x1 = p.x;
            y1 = p.y;
            if (index === Math.floor(connection.innerPoints.length / 2 - 0.1)) {
              connectionPoints.x1 = x1;
              connectionPoints.y1 = y1;
            } else if (
              index === Math.ceil(connection.innerPoints.length / 2 - 0.1)
            ) {
              connectionPoints.x2 = x1;
              connectionPoints.y2 = y1;
            }
            return lineAndPoint;
          })}
        </>
        {!connection.isHidden && firstArrow}
        <path
          style={{
            strokeWidth: 3,
            stroke: "black",
            opacity: connection.isHidden ? 0.07 : 1,
          }}
          d={`M${x1} ${y1} L${x2} ${y2}`}
          onClick={(event) => {
            if (event.shiftKey) {
              addInnerPoint(event, connection.innerPoints.length);
            } else {
              rootStore.selectConnection(connection);
            }
          }}
        />
        {!connection.isHidden &&
          Triangle({ x1, y1, x2, y2, withNodeDelta: true })}
        {!connection.isHidden && points}
        {!connection.isHidden && connectionText(connectionPoints)}
      </>
    );
  }
);

const RectAndText: React.FC<{
  texts: { text: string; style?: React.CSSProperties }[];
  connection: ConnModel<any, any, any>;
  x: number;
  y: number;
  rectFill?: string;
  padding?: number;
  onClick: (event: React.MouseEvent<any, MouseEvent>) => void;
}> = observer(
  ({
    texts,
    x: xm,
    y: ym,
    rectFill = "#eee",
    padding = 3,
    onClick,
    connection,
  }) => {
    const [textRefs, setTextRefs] = React.useState<SVGTextElement[]>([]);
    const curr = texts.reduce((p, c) => p + c.text, "");
    const [prev, setPrev] = React.useState(curr);
    const fullbbox = textRefs.reduce(
      (p, c) => {
        if (c === undefined) {
          return p;
        }
        const b = c.getBBox();

        return {
          width: p.width + b.width,
          height: Math.max(p.height, b.height),
        };
      },
      { width: 0, height: 0 }
    );
    React.useEffect(() => {
      if (prev !== curr) {
        const id = setTimeout(() => setPrev(curr), 0);
        return () => clearTimeout(id);
      }
    });
    let xPrev = 0;
    return (
      <>
        <rect
          width={fullbbox.width + padding * 2}
          height={fullbbox.height + padding * 2}
          x={xm - fullbbox.width / 2 - padding}
          y={ym - fullbbox.height + padding}
          fill={rectFill}
          onClick={onClick}
          style={{ cursor: "pointer" }}
        ></rect>
        {texts.map((t, index) => {
          const bbox = textRefs[index]?.getBBox();
          const x =
            (fullbbox !== undefined ? xm - fullbbox.width / 2 : xm) + xPrev;
          xPrev += bbox !== undefined ? bbox.width : 0;
          return (
            <text
              key={`${connection.from.key}${connection.to.key}${index}`}
              x={x}
              y={ym + 2}
              fill="black"
              ref={(e) => {
                if (e === null || e === undefined || !!textRefs[index]) return;
                const nn = [...textRefs];
                nn[index] = e;
                setTextRefs(nn);
              }}
              onClick={onClick}
              style={{ cursor: "pointer", ...(t.style ?? {}) }}
            >
              {t.text}
            </text>
          );
        })}
      </>
    );
  }
);

// const getBoxIntersection = (from: OperationModelT, to: OperationModelT) => {
//   const fwidth = from.width || 60;
//   const fheight = from.width || 60;
//   const twidth = to.width || 60;
//   const theight = to.width || 60;

//   const [x1, y1, x2, y2] = [
//     from.x + fwidth / 2,
//     from.y + fheight / 2,
//     to.x + twidth / 2,
//     to.y + theight / 2
//   ];
//   const dy = y2 - y1;
//   const dx = x2 - x1;
//   if (dx === 0 || dy === 0) {
//   }
//   const m = dy / dx;

//   const degrees = 90 + (Math.atan2(dy, dx) * 180) / Math.PI;
//   let xpos = x2 > x1 ? 1 : -1;
//   const interY = (y2 - y1) / m;
//   const interX = x2 * m + y1;
// };
