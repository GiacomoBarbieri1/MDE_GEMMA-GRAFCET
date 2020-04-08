import { Shape } from "./operation";

export const dimensionMap = { "1D": 1, "2D": 2, "3D": 3 };
function shapeFromDim(dim: number) {
  if (dim === 3) {
    return /\d+|\[\d+\]|\[\d+,\d+\]|\[\d+,\d+,\d+\]/;
  } else if (dim === 2) {
    return /\d+|\[\d+\]|\[\d+,\d+\]/;
  } else {
    return /\d+|\[\d+\]/;
  }
}

export const parseArrayFromString = (value: string) => {
  const ans = JSON.parse(value.replace(",]", "]"));
  if (typeof ans === "number") return [ans];
  return ans;
};

export const parseArrayFromStringWithUndefined = (value: string) => {
  const ans = JSON.parse(value.replace("?", "null").replace(",]", "]"));
  if (typeof ans === "number") return [ans];
  if (ans === null) return [undefined];
  return ans.map((v: number | null) => (v === null ? undefined : v));
};

export const extractShapePattern = (s: any) =>
  shapeFromDim(dimensionMap[s.dimensions as keyof typeof dimensionMap]);

export const replicateIfOne = (initial: number[], len: number) => {
  let v;
  if (initial.length === 1) {
    v = Array(len).fill(initial[0]) as number[];
  } else {
    v = initial;
  }
  return v;
};

export const toPythonStr = (item: Shape | boolean) => {
  if (typeof item === "boolean") {
    return item ? "True" : "False";
  } else {
    return `(${item
      .map((d) => (d === undefined ? "None" : d.toString()))
      .join(",")})`;
  }
};
