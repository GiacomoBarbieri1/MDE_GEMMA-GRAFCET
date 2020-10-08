import { CharStreams, CommonTokenStream } from "antlr4ts";
import { SimpleBooleanLexer } from "../grammar/SimpleBooleanLexer";
import {
  ExpressionContext,
  IdentifierExpressionContext,
  IdentifierNumExpressionContext,
  SimpleBooleanParser,
} from "../grammar/SimpleBooleanParser";
import { SimpleBooleanVisitor } from "../grammar/SimpleBooleanVisitor";
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import { ErrorNode } from "antlr4ts/tree/ErrorNode";
import { ParseTree } from "antlr4ts/tree/ParseTree";

// Extend the AbstractParseTreeVisitor to get default visitor behaviour
class ErrorVisitor
  extends AbstractParseTreeVisitor<string[]>
  implements SimpleBooleanVisitor<string[]> {
  isInvalid: boolean = false;
  constructor(public signals: { numSignals: string[]; boolSignals: string[] }) {
    super();
  }

  defaultResult() {
    return [];
  }

  aggregateResult(aggregate: string[], nextResult: string[]) {
    return aggregate.concat(nextResult);
  }

  visitErrorNode(node: ErrorNode): string[] {
    if (this.isInvalid) {
      return [];
    }
    this.isInvalid = true;
    return ["Invalid boolean expression"];
  }

  visitIdentifierExpression(n: IdentifierExpressionContext): string[] {
    const valid = this.signals.boolSignals.includes(n.text);
    return valid ? [] : [`'${n.text}' is not a defined boolean signal`];
  }

  visitIdentifierNumExpression(n: IdentifierNumExpressionContext): string[] {
    const valid = this.signals.numSignals.includes(n.text);
    return valid ? [] : [`'${n.text}' is not a defined numeric signal`];
  }

  visitExpression(n: ExpressionContext): string[] {
    console.log("Dddddddddddddddddddddd");
    if (n.exception !== undefined && !this.isInvalid) {
      this.isInvalid = true;
      return ["Invalid boolean expression"];
    }
    return [];
  }
}

export const parseBoolExpression = (
  text: string,
  signals: { numSignals: string[]; boolSignals: string[] }
): { tree: ExpressionContext; errors: string[] } => {
  // Create the lexer and parser
  let inputStream = CharStreams.fromString(text);
  let lexer = new SimpleBooleanLexer(inputStream);
  let tokenStream = new CommonTokenStream(lexer);
  let parser = new SimpleBooleanParser(tokenStream);

  // Parse the input, where `compilationUnit` is whatever entry point you defined

  let tree = parser.parse();

  // Create the visitor
  const countFunctionsVisitor = new ErrorVisitor(signals);
  // Use the visitor entry point
  const errors = countFunctionsVisitor.visit(tree);

  if (tree.exception !== undefined) {
    countFunctionsVisitor.isInvalid = true;
    errors.push("Invalid boolean expression");
  }

  let toProcess: ParseTree[] | undefined = tree.children;
  if (toProcess !== undefined && !countFunctionsVisitor.isInvalid) {
    while (toProcess.length !== 0) {
      const curr: ParseTree | undefined = toProcess.pop()!;
      if (curr instanceof ExpressionContext && curr.exception !== undefined) {
        errors.push("Invalid boolean expression");
        break;
      } else if (curr.childCount > 0) {
        toProcess = toProcess.concat(
          [...Array(curr.childCount).keys()].map((i) => curr.getChild(i))
        );
      }
    }
  }
  return { tree, errors };
};
