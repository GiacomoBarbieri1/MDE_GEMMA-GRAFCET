import { observer } from "mobx-react-lite";
import React from "react";
import { OperationModel } from "../operation/operation-model";

export type ArrowModel = {
  from: OperationModel;
  to: OperationModel;
};

// export const ArrowModel = types.model("Arrow", {
//   key: types.identifier,
//   from: types.reference(OperationModel),
//   to: types.reference(OperationModel),
//   shape: types.array(types.maybe(types.integer)),
// });

// export interface ArrowModelT extends Instance<typeof ArrowModel> {}

type ArrowViewProps = { arrow: ArrowModel };

const triangleFromCenter = (
  x: number,
  y: number,
  height: number = 14,
  width: number = 14
) => {
  const y0 = y + height;
  return `M${x} ${y} L${x - width / 2} ${y0} L${x + width / 2} ${y0} Z`;
};

export const ArrowView: React.FC<ArrowViewProps> = observer(
  ({ arrow }: ArrowViewProps) => {
    const { from, to } = arrow;
    const shape = from.data.outputShape;

    const fwidth = from.width || 60;
    const fheight = from.height || 60;
    const twidth = to.width || 60;
    const theight = to.height || 60;

    const [x1, y1, x2, y2] = [
      from.x + fwidth / 2,
      from.y + fheight / 2,
      to.x + twidth / 2,
      to.y + theight / 2,
    ];
    const dy = y2 - y1;
    const dx = x2 - x1;

    let changeX;
    let changeY;
    if (dx === 0) {
      changeX = 0;
      changeY = ((y2 > y1 ? 1 : -1) * theight) / 2;
    } else if (dy === 0) {
      changeY = 0;
      changeX = ((x2 > x1 ? 1 : -1) * twidth) / 2;
    } else {
      const m = Math.abs(dy / dx);
      const [deltaX, deltaY] =
        m > theight / twidth
          ? [theight / 2 / m, theight / 2]
          : [twidth / 2, (twidth / 2) * m];
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
          style={{ strokeWidth: 2, stroke: "black" }}
          d={`M${x1} ${y1} L${x2} ${y2}`}
          onDoubleClick={(e) => {
            console.log(e);
          }}
        />
        <RectAndText
          text={`[${shape.map((v) => v || "?").join(", ")}]`}
          x={xm}
          y={ym}
        />
        <path
          d={triangleFromCenter(xa, ya)}
          transform={`rotate(${degrees} ${xa} ${ya})`}
        />
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
}> = observer(({ text, x: xm, y: ym, rectFill = "#eee", padding = 3 }) => {
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
        ></rect>
      )}
      <text
        x={bbox !== undefined ? xm - bbox.width / 2 : xm}
        y={ym}
        fill="black"
        ref={setTextRef}
      >
        {text}
      </text>
    </>
  );
});

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
