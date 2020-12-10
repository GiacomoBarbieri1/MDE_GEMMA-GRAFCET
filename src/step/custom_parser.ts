export class VarId {
  constructor(public text: string) {}

  toString(): string {
    return this.text;
  }
}

export type CustomToken =
  | "("
  | ")"
  | "AND"
  | "OR"
  | "NOT"
  | "<"
  | "<>"
  | ">"
  | "="
  | "<="
  | ">="
  | "\n"
  | VarId;

export const getCustomTokens = (t: string): [CustomToken, number][] => {
  const l: [CustomToken, number][] = [];
  let i = -1;
  let omit = 0;
  let signal = "";
  const addSignal = () => {
    if (signal.length !== 0) {
      l.push([new VarId(signal), i - signal.length]);
      signal = "";
    }
  };
  const add = (v: CustomToken) => {
    addSignal();
    l.push([v, i]);
  };

  for (const c of t) {
    i++;
    if (omit !== 0) {
      omit--;
      continue;
    }
    switch (c) {
      case " ":
        addSignal();
        break;
      case "\n":
      case ")":
      case "(":
      case "<":
        if (t.substring(i, i + 2) === "<>") {
          omit = 1;
          add("<>");
          continue;
        }
      // ignore: no-fallthrough
      case ">":
        add(c);
        break;
      case "=":
        const prevToken = l[l.length - 1];
        const prev = prevToken[0];
        const strPrev = prev instanceof VarId ? prev.text : prev;
        if (["<", ">"].includes(strPrev) && prevToken[1] === i - 1) {
          l[l.length - 1][0] = (prev + "=") as any;
        } else {
          add(c);
        }
        break;
      case "A":
        if (t.substring(i, i + 3) === "AND") {
          omit = 2;
          add("AND");
          continue;
        }
      // ignore: no-fallthrough
      case "O":
        if (t.substring(i, i + 2) === "OR") {
          omit = 1;
          add("OR");
          continue;
        }
      // ignore: no-fallthrough
      case "N":
        if (t.substring(i, i + 3) === "NOT") {
          omit = 2;
          add("NOT");
          continue;
        }
      // ignore: no-fallthrough
      default:
        signal += c;
        break;
    }
  }
  if (signal.length !== 0) {
    l.push([new VarId(signal), i - signal.length + 1]);
  }
  return l;
};
