export function listToMap<T extends number | string>(l: Array<T>) {
  return l.reduce((p, c) => {
    p[c.toString()] = c;
    return p;
  }, {} as { [key: string]: T });
}