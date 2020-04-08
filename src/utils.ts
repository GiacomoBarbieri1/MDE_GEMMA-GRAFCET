export function listToMap<T extends number | string>(l: Array<T>) {
  return l.reduce((p, c) => {
    p[c.toString()] = c;
    return p;
  }, {} as { [key: string]: T });
}

const defaultResizeEnable = {
  top: false,
  right: false,
  bottom: false,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false,
};

export function resizableEnable(f: {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  topRight?: boolean;
  bottomRight?: boolean;
  bottomLeft?: boolean;
  topLeft?: boolean;
}) {
  return Object.entries(f).reduce((p, [k, v]) => {
    if (v !== undefined) {
      p[k as keyof typeof defaultResizeEnable] = v;
    }
    return p;
  }, {...defaultResizeEnable});
}
