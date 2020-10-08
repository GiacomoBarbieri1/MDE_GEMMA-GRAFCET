// Generated from ./src/step/SimpleBoolean.g4 by ANTLR 4.7.3-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { NotExpressionContext } from "./SimpleBooleanParser";
import { OrExpressionContext } from "./SimpleBooleanParser";
import { AndParentExpressionContext } from "./SimpleBooleanParser";
import { IdentifierNumExpressionContext } from "./SimpleBooleanParser";
import { DecimalExpressionContext } from "./SimpleBooleanParser";
import { AndExpressionContext } from "./SimpleBooleanParser";
import { SimpleExpressionContext } from "./SimpleBooleanParser";
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
 * This interface defines a complete listener for a parse tree produced by
 * `SimpleBooleanParser`.
 */
export interface SimpleBooleanListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `notExpression`
	 * labeled alternative in `SimpleBooleanParser.expression`.
	 * @param ctx the parse tree
	 */
	enterNotExpression?: (ctx: NotExpressionContext) => void;
	/**
	 * Exit a parse tree produced by the `notExpression`
	 * labeled alternative in `SimpleBooleanParser.expression`.
	 * @param ctx the parse tree
	 */
	exitNotExpression?: (ctx: NotExpressionContext) => void;

	/**
	 * Enter a parse tree produced by the `orExpression`
	 * labeled alternative in `SimpleBooleanParser.expression`.
	 * @param ctx the parse tree
	 */
	enterOrExpression?: (ctx: OrExpressionContext) => void;
	/**
	 * Exit a parse tree produced by the `orExpression`
	 * labeled alternative in `SimpleBooleanParser.expression`.
	 * @param ctx the parse tree
	 */
	exitOrExpression?: (ctx: OrExpressionContext) => void;

	/**
	 * Enter a parse tree produced by the `andParentExpression`
	 * labeled alternative in `SimpleBooleanParser.expression`.
	 * @param ctx the parse tree
	 */
	enterAndParentExpression?: (ctx: AndParentExpressionContext) => void;
	/**
	 * Exit a parse tree produced by the `andParentExpression`
	 * labeled alternative in `SimpleBooleanParser.expression`.
	 * @param ctx the parse tree
	 */
	exitAndParentExpression?: (ctx: AndParentExpressionContext) => void;

	/**
	 * Enter a parse tree produced by the `identifierNumExpression`
	 * labeled alternative in `SimpleBooleanParser.numExpression`.
	 * @param ctx the parse tree
	 */
	enterIdentifierNumExpression?: (ctx: IdentifierNumExpressionContext) => void;
	/**
	 * Exit a parse tree produced by the `identifierNumExpression`
	 * labeled alternative in `SimpleBooleanParser.numExpression`.
	 * @param ctx the parse tree
	 */
	exitIdentifierNumExpression?: (ctx: IdentifierNumExpressionContext) => void;

	/**
	 * Enter a parse tree produced by the `decimalExpression`
	 * labeled alternative in `SimpleBooleanParser.numExpression`.
	 * @param ctx the parse tree
	 */
	enterDecimalExpression?: (ctx: DecimalExpressionContext) => void;
	/**
	 * Exit a parse tree produced by the `decimalExpression`
	 * labeled alternative in `SimpleBooleanParser.numExpression`.
	 * @param ctx the parse tree
	 */
	exitDecimalExpression?: (ctx: DecimalExpressionContext) => void;

	/**
	 * Enter a parse tree produced by the `andExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionAnd`.
	 * @param ctx the parse tree
	 */
	enterAndExpression?: (ctx: AndExpressionContext) => void;
	/**
	 * Exit a parse tree produced by the `andExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionAnd`.
	 * @param ctx the parse tree
	 */
	exitAndExpression?: (ctx: AndExpressionContext) => void;

	/**
	 * Enter a parse tree produced by the `simpleExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionAnd`.
	 * @param ctx the parse tree
	 */
	enterSimpleExpression?: (ctx: SimpleExpressionContext) => void;
	/**
	 * Exit a parse tree produced by the `simpleExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionAnd`.
	 * @param ctx the parse tree
	 */
	exitSimpleExpression?: (ctx: SimpleExpressionContext) => void;

	/**
	 * Enter a parse tree produced by the `comparatorExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionSimple`.
	 * @param ctx the parse tree
	 */
	enterComparatorExpression?: (ctx: ComparatorExpressionContext) => void;
	/**
	 * Exit a parse tree produced by the `comparatorExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionSimple`.
	 * @param ctx the parse tree
	 */
	exitComparatorExpression?: (ctx: ComparatorExpressionContext) => void;

	/**
	 * Enter a parse tree produced by the `identifierExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionSimple`.
	 * @param ctx the parse tree
	 */
	enterIdentifierExpression?: (ctx: IdentifierExpressionContext) => void;
	/**
	 * Exit a parse tree produced by the `identifierExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionSimple`.
	 * @param ctx the parse tree
	 */
	exitIdentifierExpression?: (ctx: IdentifierExpressionContext) => void;

	/**
	 * Enter a parse tree produced by the `parenExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionSimple`.
	 * @param ctx the parse tree
	 */
	enterParenExpression?: (ctx: ParenExpressionContext) => void;
	/**
	 * Exit a parse tree produced by the `parenExpression`
	 * labeled alternative in `SimpleBooleanParser.expressionSimple`.
	 * @param ctx the parse tree
	 */
	exitParenExpression?: (ctx: ParenExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `SimpleBooleanParser.parse`.
	 * @param ctx the parse tree
	 */
	enterParse?: (ctx: ParseContext) => void;
	/**
	 * Exit a parse tree produced by `SimpleBooleanParser.parse`.
	 * @param ctx the parse tree
	 */
	exitParse?: (ctx: ParseContext) => void;

	/**
	 * Enter a parse tree produced by `SimpleBooleanParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpression?: (ctx: ExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `SimpleBooleanParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpression?: (ctx: ExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `SimpleBooleanParser.expressionAnd`.
	 * @param ctx the parse tree
	 */
	enterExpressionAnd?: (ctx: ExpressionAndContext) => void;
	/**
	 * Exit a parse tree produced by `SimpleBooleanParser.expressionAnd`.
	 * @param ctx the parse tree
	 */
	exitExpressionAnd?: (ctx: ExpressionAndContext) => void;

	/**
	 * Enter a parse tree produced by `SimpleBooleanParser.expressionSimple`.
	 * @param ctx the parse tree
	 */
	enterExpressionSimple?: (ctx: ExpressionSimpleContext) => void;
	/**
	 * Exit a parse tree produced by `SimpleBooleanParser.expressionSimple`.
	 * @param ctx the parse tree
	 */
	exitExpressionSimple?: (ctx: ExpressionSimpleContext) => void;

	/**
	 * Enter a parse tree produced by `SimpleBooleanParser.numExpression`.
	 * @param ctx the parse tree
	 */
	enterNumExpression?: (ctx: NumExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `SimpleBooleanParser.numExpression`.
	 * @param ctx the parse tree
	 */
	exitNumExpression?: (ctx: NumExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `SimpleBooleanParser.comparator`.
	 * @param ctx the parse tree
	 */
	enterComparator?: (ctx: ComparatorContext) => void;
	/**
	 * Exit a parse tree produced by `SimpleBooleanParser.comparator`.
	 * @param ctx the parse tree
	 */
	exitComparator?: (ctx: ComparatorContext) => void;
}

