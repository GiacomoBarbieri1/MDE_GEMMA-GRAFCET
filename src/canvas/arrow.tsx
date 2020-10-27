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

export const ArrowView: React.FC<ArrowViewProps> = observer(
  ({ connection }: ArrowViewProps) => {
    const rootStore = useStore();
    const { from, to, isSelected } = connection;
    const { x: x1, y: y1 } = getStartPositionConnection(from);

    const [x2, y2] = [to.x + to.width / 2, to.y + to.height / 2];
    const dy = y2 - y1;
    const dx = x2 - x1;

    let changeX;
    let changeY;
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
    const xa = x2 - changeX;
    const ya = y2 - changeY;

    const [xm, ym] = [(x1 + x2) / 2, (y1 + y2) / 2];
    const degrees = 90 + (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

    return (
      <>
        <path
          style={{
            strokeWidth: 2,
            stroke: "black",
            opacity: connection.isHidden ? 0.07 : 1,
          }}
          d={`M${x1} ${y1} L${x2} ${y2}`}
          onClick={(_) => {
            rootStore.selectConnection(connection);
          }}
        />
        {!connection.isHidden && (
          <>
            <RectAndText
              text={connection.data.connectionText}
              x={xm}
              rectFill={isSelected ? "#eeedff" : "#eee"}
              y={ym}
              onClick={(_) => rootStore.selectConnection(connection)}
            />
            <path
              d={triangleFromCenter(xa, ya)}
              transform={`rotate(${degrees} ${xa} ${ya})`}
            />
          </>
        )}
      </>
    );
  }
);

const RectAndText: React.FC<{
  text: string;
  x: number;
  y: number;
  rectFill?: string;
  padding?: number;
  onClick: (event: React.MouseEvent<any, MouseEvent>) => void;
}> = observer(
  ({ text, x: xm, y: ym, rectFill = "#eee", padding = 3, onClick }) => {
    const [textRef, setTextRef] = React.useState<SVGTextElement | null>(null);
    const [prev, setPrev] = React.useState(text);
    const bbox = textRef?.getBBox();
    React.useEffect(() => {
      if (prev !== text) {
        const id = setTimeout(() => setPrev(text), 0);
        return () => clearTimeout(id);
      }
    });

    return (
      <>
        {bbox !== undefined && (
          <rect
            width={bbox.width + padding * 2}
            height={bbox.height + padding * 2}
            x={xm - bbox.width / 2 - padding}
            y={ym - bbox.height + padding}
            fill={rectFill}
            onClick={onClick}
            style={{ cursor: "pointer" }}
          ></rect>
        )}
        <text
          x={bbox !== undefined ? xm - bbox.width / 2 : xm}
          y={ym}
          fill="black"
          ref={setTextRef}
          onClick={onClick}
          style={{ cursor: "pointer" }}
        >
          {text}
        </text>
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
