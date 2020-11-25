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

type ParseR = { ok: boolean };

// type Conv = (tokens: Token[]) => ParseR;

// const _union = (fs: Array<Conv>) => {};

// const _find = (token: Token): Conv => {
//   return (ts) => {
//     return { ok: ts[0] == token };
//   };
// };

type Item = (CustomToken | Union)[];

type ExpType = "VarId" | "comp" | "and" | "simpleExp" | "numOP";

class Union {
  constructor(
    items: Partial<{ [key in ExpType]: (CustomToken | "SELF" | Union)[] }>
  ) {
    this.variants = Object.values(items).map((l) => {
      return l!.map((v) => (v === "SELF" ? this : v));
    });
  }
  variants: Item[];
}

// type Val = Item | Union;

// type Expression<V extends { [key: string]: Token }> = {
//   name: ExpType;
//   tokens: Item;
//   p: (t: Token[]) => V;
// };

// export const getCustomParse = (tokens: Token[]) => {
//   const varId: Expression<{ varId: VarId }> = {
//     name: "VarId",
//     p: (t) => ({ varId: t[0] as VarId }),
//     tokens: [new VarId("")],
//   };

//   const numSimple = new Union({
//     VarId: [new VarId("")], //TODO: decimal
//   });

//   const comparator = new Union([["<"], [">"], ["="], ["<="], [">="]]);

//   const expSimple = new Union([
//     [numSimple, comparator, numSimple],
//     [new VarId("")],
//   ]);

//   const expAnd = new Union([[expSimple, "AND", "SELF"], [expSimple]]);

//   const exp = new Union([
//     ["(", "SELF", ")"],
//     ["NOT", "SELF"],
//     [expAnd, "OR", "SELF"],
//     [expAnd],
//   ]);

//   for (const t of tokens) {
//     matchPossibilities(t, exp);
//   }
// };

// const matchPossibilities = (t: Token, possibilities: Union): void => {
//   let i = -1;
//   for (const variant of possibilities.variants) {
//     i++;

//     const curr = variant.pop();
//     if (curr === undefined) {
//     } else if (typeof curr == "string") {
//       if (t == curr) {
//       }
//     } else if (curr instanceof Union) {
//       matchPossibilities(t, curr);
//     } else {
//       if (t instanceof VarId) {
//       } else {
//       }
//     }
//   }
// };
