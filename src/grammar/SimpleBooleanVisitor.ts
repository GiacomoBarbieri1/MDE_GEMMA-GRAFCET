// Generated from ./src/grammar/SimpleBoolean.g4 by ANTLR 4.7.3-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { OrExpressionContext } from "./SimpleBooleanParser";
import { AndParentExpressionContext } from "./SimpleBooleanParser";
import { IdentifierNumExpressionContext } from "./SimpleBooleanParser";
import { DecimalExpressionContext } from "./SimpleBooleanParser";
import { AndExpressionContext } from "./SimpleBooleanParser";
import { SimpleExpressionContext } from "./SimpleBooleanParser";
import { NotExpressionContext } from "./SimpleBooleanParser";
import { ComparatorExpressionContext } from "./SimpleBooleanParser";
import { IdentifierExpressionContext } from "./SimpleBooleanParser";
import { ParenExpressionContext } from "./SimpleBooleanParser";
import { ParseContext } from "./SimpleBooleanParser";
import { ExpressionContext } from "./SimpleBooleanParser";
import { ExpressionAndContext } from "./SimpleBooleanParser";
import { ExpressionSimpleContext } from "./SimpleBooleanParser";
import { NumExpressionContext } from "./SimpleBooleanParser";
import { ComparatorContext } from "./SimpleBooleanParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `SimpleBooleanParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface SimpleBooleanVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `orExpression`
	 * labeled alternative in `SimpleBooleanParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOrExpression?: (ctx: OrExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `andParentExpression`
	 * labeled alternative in `SimpleBooleanParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAndParentExpression?: (ctx: AndParentExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `identifierNumExpression`
	 * labeled alternative in `SimpleBooleanParser.numExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdentifierNumExpression?: (ctx: IdentifierNumExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `decimalExpression`
	 * labeled alternative in `SimpleBooleanParser.numExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDecimalExpression?: (ctx: DecimalExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `andExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionAnd`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAndExpression?: (ctx: AndExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `simpleExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionAnd`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSimpleExpression?: (ctx: SimpleExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `notExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionSimple`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNotExpression?: (ctx: NotExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `comparatorExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionSimple`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComparatorExpression?: (ctx: ComparatorExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `identifierExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionSimple`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdentifierExpression?: (ctx: IdentifierExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `parenExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionSimple`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParenExpression?: (ctx: ParenExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `SimpleBooleanParser.parse`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParse?: (ctx: ParseContext) => Result;

	/**
	 * Visit a parse tree produced by `SimpleBooleanParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `SimpleBooleanParser.expressionAnd`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpressionAnd?: (ctx: ExpressionAndContext) => Result;

	/**
	 * Visit a parse tree produced by `SimpleBooleanParser.expressionSimple`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpressionSimple?: (ctx: ExpressionSimpleContext) => Result;

	/**
	 * Visit a parse tree produced by `SimpleBooleanParser.numExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumExpression?: (ctx: NumExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `SimpleBooleanParser.comparator`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComparator?: (ctx: ComparatorContext) => Result;
}

