/* eslint-disable */
// Generated from ./src/step/SimpleBoolean.g4 by ANTLR 4.7.3-SNAPSHOT
// @ts-nocheck
// @ts-ignore

import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { RecognitionException } from "antlr4ts/RecognitionException";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { SimpleBooleanListener } from "./SimpleBooleanListener";
import { SimpleBooleanVisitor } from "./SimpleBooleanVisitor";


export class SimpleBooleanParser extends Parser {
	public static readonly AND = 1;
	public static readonly OR = 2;
	public static readonly NOT = 3;
	public static readonly TRUE = 4;
	public static readonly FALSE = 5;
	public static readonly GT = 6;
	public static readonly GE = 7;
	public static readonly LT = 8;
	public static readonly LE = 9;
	public static readonly EQ = 10;
	public static readonly LPAREN = 11;
	public static readonly RPAREN = 12;
	public static readonly DECIMAL = 13;
	public static readonly IDENTIFIER = 14;
	public static readonly WS = 15;
	public static readonly RULE_parse = 0;
	public static readonly RULE_expression = 1;
	public static readonly RULE_expressionAnd = 2;
	public static readonly RULE_expressionSimple = 3;
	public static readonly RULE_numExpression = 4;
	public static readonly RULE_comparator = 5;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"parse", "expression", "expressionAnd", "expressionSimple", "numExpression", 
		"comparator",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'AND'", "'OR'", "'NOT'", "'TRUE'", "'FALSE'", "'>'", "'>='", 
		"'<'", "'<='", "'='", "'('", "')'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "AND", "OR", "NOT", "TRUE", "FALSE", "GT", "GE", "LT", "LE", 
		"EQ", "LPAREN", "RPAREN", "DECIMAL", "IDENTIFIER", "WS",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(SimpleBooleanParser._LITERAL_NAMES, SimpleBooleanParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return SimpleBooleanParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "SimpleBoolean.g4"; }

	// @Override
	public get ruleNames(): string[] { return SimpleBooleanParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return SimpleBooleanParser._serializedATN; }

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(SimpleBooleanParser._ATN, this);
	}
	// @RuleVersion(0)
	public parse(): ParseContext {
		let _localctx: ParseContext = new ParseContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, SimpleBooleanParser.RULE_parse);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 12;
			this.expression();
			this.state = 13;
			this.match(SimpleBooleanParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public expression(): ExpressionContext {
		let _localctx: ExpressionContext = new ExpressionContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, SimpleBooleanParser.RULE_expression);
		try {
			this.state = 22;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 0, this._ctx) ) {
			case 1:
				_localctx = new NotExpressionContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 15;
				this.match(SimpleBooleanParser.NOT);
				this.state = 16;
				this.expression();
				}
				break;

			case 2:
				_localctx = new OrExpressionContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 17;
				(_localctx as OrExpressionContext)._left = this.expressionAnd();
				this.state = 18;
				this.match(SimpleBooleanParser.OR);
				this.state = 19;
				(_localctx as OrExpressionContext)._right = this.expression();
				}
				break;

			case 3:
				_localctx = new AndParentExpressionContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 21;
				this.expressionAnd();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public expressionAnd(): ExpressionAndContext {
		let _localctx: ExpressionAndContext = new ExpressionAndContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, SimpleBooleanParser.RULE_expressionAnd);
		try {
			this.state = 29;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 1, this._ctx) ) {
			case 1:
				_localctx = new AndExpressionContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 24;
				(_localctx as AndExpressionContext)._left = this.expressionSimple();
				this.state = 25;
				this.match(SimpleBooleanParser.AND);
				this.state = 26;
				(_localctx as AndExpressionContext)._right = this.expressionAnd();
				}
				break;

			case 2:
				_localctx = new SimpleExpressionContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 28;
				this.expressionSimple();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public expressionSimple(): ExpressionSimpleContext {
		let _localctx: ExpressionSimpleContext = new ExpressionSimpleContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, SimpleBooleanParser.RULE_expressionSimple);
		try {
			this.state = 40;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 2, this._ctx) ) {
			case 1:
				_localctx = new ComparatorExpressionContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 31;
				(_localctx as ComparatorExpressionContext)._left = this.numExpression();
				this.state = 32;
				(_localctx as ComparatorExpressionContext)._op = this.comparator();
				this.state = 33;
				(_localctx as ComparatorExpressionContext)._right = this.numExpression();
				}
				break;

			case 2:
				_localctx = new IdentifierExpressionContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 35;
				this.match(SimpleBooleanParser.IDENTIFIER);
				}
				break;

			case 3:
				_localctx = new ParenExpressionContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 36;
				this.match(SimpleBooleanParser.LPAREN);
				this.state = 37;
				this.expression();
				this.state = 38;
				this.match(SimpleBooleanParser.RPAREN);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public numExpression(): NumExpressionContext {
		let _localctx: NumExpressionContext = new NumExpressionContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, SimpleBooleanParser.RULE_numExpression);
		try {
			this.state = 44;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case SimpleBooleanParser.IDENTIFIER:
				_localctx = new IdentifierNumExpressionContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 42;
				this.match(SimpleBooleanParser.IDENTIFIER);
				}
				break;
			case SimpleBooleanParser.DECIMAL:
				_localctx = new DecimalExpressionContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 43;
				this.match(SimpleBooleanParser.DECIMAL);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public comparator(): ComparatorContext {
		let _localctx: ComparatorContext = new ComparatorContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, SimpleBooleanParser.RULE_comparator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 46;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << SimpleBooleanParser.GT) | (1 << SimpleBooleanParser.GE) | (1 << SimpleBooleanParser.LT) | (1 << SimpleBooleanParser.LE) | (1 << SimpleBooleanParser.EQ))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x113\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x03\x02\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x05\x03\x19\n\x03\x03\x04\x03\x04\x03\x04\x03\x04\x03" +
		"\x04\x05\x04 \n\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x05\x05\x05+\n\x05\x03\x06\x03\x06\x05\x06/\n\x06\x03" +
		"\x07\x03\x07\x03\x07\x02\x02\x02\b\x02\x02\x04\x02\x06\x02\b\x02\n\x02" +
		"\f\x02\x02\x03\x03\x02\b\f\x022\x02\x0E\x03\x02\x02\x02\x04\x18\x03\x02" +
		"\x02\x02\x06\x1F\x03\x02\x02\x02\b*\x03\x02\x02\x02\n.\x03\x02\x02\x02" +
		"\f0\x03\x02\x02\x02\x0E\x0F\x05\x04\x03\x02\x0F\x10\x07\x02\x02\x03\x10" +
		"\x03\x03\x02\x02\x02\x11\x12\x07\x05\x02\x02\x12\x19\x05\x04\x03\x02\x13" +
		"\x14\x05\x06\x04\x02\x14\x15\x07\x04\x02\x02\x15\x16\x05\x04\x03\x02\x16" +
		"\x19\x03\x02\x02\x02\x17\x19\x05\x06\x04\x02\x18\x11\x03\x02\x02\x02\x18" +
		"\x13\x03\x02\x02\x02\x18\x17\x03\x02\x02\x02\x19\x05\x03\x02\x02\x02\x1A" +
		"\x1B\x05\b\x05\x02\x1B\x1C\x07\x03\x02\x02\x1C\x1D\x05\x06\x04\x02\x1D" +
		" \x03\x02\x02\x02\x1E \x05\b\x05\x02\x1F\x1A\x03\x02\x02\x02\x1F\x1E\x03" +
		"\x02\x02\x02 \x07\x03\x02\x02\x02!\"\x05\n\x06\x02\"#\x05\f\x07\x02#$" +
		"\x05\n\x06\x02$+\x03\x02\x02\x02%+\x07\x10\x02\x02&\'\x07\r\x02\x02\'" +
		"(\x05\x04\x03\x02()\x07\x0E\x02\x02)+\x03\x02\x02\x02*!\x03\x02\x02\x02" +
		"*%\x03\x02\x02\x02*&\x03\x02\x02\x02+\t\x03\x02\x02\x02,/\x07\x10\x02" +
		"\x02-/\x07\x0F\x02\x02.,\x03\x02\x02\x02.-\x03\x02\x02\x02/\v\x03\x02" +
		"\x02\x0201\t\x02\x02\x021\r\x03\x02\x02\x02\x06\x18\x1F*.";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!SimpleBooleanParser.__ATN) {
			SimpleBooleanParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(SimpleBooleanParser._serializedATN));
		}

		return SimpleBooleanParser.__ATN;
	}

}

export class ParseContext extends ParserRuleContext {
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public EOF(): TerminalNode { return this.getToken(SimpleBooleanParser.EOF, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return SimpleBooleanParser.RULE_parse; }
	// @Override
	public enterRule(listener: SimpleBooleanListener): void {
		if (listener.enterParse) {
			listener.enterParse(this);
		}
	}
	// @Override
	public exitRule(listener: SimpleBooleanListener): void {
		if (listener.exitParse) {
			listener.exitParse(this);
		}
	}
	// @Override
	public accept<Result>(visitor: SimpleBooleanVisitor<Result>): Result {
		if (visitor.visitParse) {
			return visitor.visitParse(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return SimpleBooleanParser.RULE_expression; }
	public copyFrom(ctx: ExpressionContext): void {
		super.copyFrom(ctx);
	}
}
export class NotExpressionContext extends ExpressionContext {
	public NOT(): TerminalNode { return this.getToken(SimpleBooleanParser.NOT, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: SimpleBooleanListener): void {
		if (listener.enterNotExpression) {
			listener.enterNotExpression(this);
		}
	}
	// @Override
	public exitRule(listener: SimpleBooleanListener): void {
		if (listener.exitNotExpression) {
			listener.exitNotExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: SimpleBooleanVisitor<Result>): Result {
		if (visitor.visitNotExpression) {
			return visitor.visitNotExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OrExpressionContext extends ExpressionContext {
	public _left: ExpressionAndContext;
	public _right: ExpressionContext;
	public OR(): TerminalNode { return this.getToken(SimpleBooleanParser.OR, 0); }
	public expressionAnd(): ExpressionAndContext {
		return this.getRuleContext(0, ExpressionAndContext);
	}
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: SimpleBooleanListener): void {
		if (listener.enterOrExpression) {
			listener.enterOrExpression(this);
		}
	}
	// @Override
	public exitRule(listener: SimpleBooleanListener): void {
		if (listener.exitOrExpression) {
			listener.exitOrExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: SimpleBooleanVisitor<Result>): Result {
		if (visitor.visitOrExpression) {
			return visitor.visitOrExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AndParentExpressionContext extends ExpressionContext {
	public expressionAnd(): ExpressionAndContext {
		return this.getRuleContext(0, ExpressionAndContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: SimpleBooleanListener): void {
		if (listener.enterAndParentExpression) {
			listener.enterAndParentExpression(this);
		}
	}
	// @Override
	public exitRule(listener: SimpleBooleanListener): void {
		if (listener.exitAndParentExpression) {
			listener.exitAndParentExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: SimpleBooleanVisitor<Result>): Result {
		if (visitor.visitAndParentExpression) {
			return visitor.visitAndParentExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionAndContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return SimpleBooleanParser.RULE_expressionAnd; }
	public copyFrom(ctx: ExpressionAndContext): void {
		super.copyFrom(ctx);
	}
}
export class AndExpressionContext extends ExpressionAndContext {
	public _left: ExpressionSimpleContext;
	public _right: ExpressionAndContext;
	public AND(): TerminalNode { return this.getToken(SimpleBooleanParser.AND, 0); }
	public expressionSimple(): ExpressionSimpleContext {
		return this.getRuleContext(0, ExpressionSimpleContext);
	}
	public expressionAnd(): ExpressionAndContext {
		return this.getRuleContext(0, ExpressionAndContext);
	}
	constructor(ctx: ExpressionAndContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: SimpleBooleanListener): void {
		if (listener.enterAndExpression) {
			listener.enterAndExpression(this);
		}
	}
	// @Override
	public exitRule(listener: SimpleBooleanListener): void {
		if (listener.exitAndExpression) {
			listener.exitAndExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: SimpleBooleanVisitor<Result>): Result {
		if (visitor.visitAndExpression) {
			return visitor.visitAndExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class SimpleExpressionContext extends ExpressionAndContext {
	public expressionSimple(): ExpressionSimpleContext {
		return this.getRuleContext(0, ExpressionSimpleContext);
	}
	constructor(ctx: ExpressionAndContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: SimpleBooleanListener): void {
		if (listener.enterSimpleExpression) {
			listener.enterSimpleExpression(this);
		}
	}
	// @Override
	public exitRule(listener: SimpleBooleanListener): void {
		if (listener.exitSimpleExpression) {
			listener.exitSimpleExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: SimpleBooleanVisitor<Result>): Result {
		if (visitor.visitSimpleExpression) {
			return visitor.visitSimpleExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionSimpleContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return SimpleBooleanParser.RULE_expressionSimple; }
	public copyFrom(ctx: ExpressionSimpleContext): void {
		super.copyFrom(ctx);
	}
}
export class ComparatorExpressionContext extends ExpressionSimpleContext {
	public _left: NumExpressionContext;
	public _op: ComparatorContext;
	public _right: NumExpressionContext;
	public numExpression(): NumExpressionContext[];
	public numExpression(i: number): NumExpressionContext;
	public numExpression(i?: number): NumExpressionContext | NumExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(NumExpressionContext);
		} else {
			return this.getRuleContext(i, NumExpressionContext);
		}
	}
	public comparator(): ComparatorContext {
		return this.getRuleContext(0, ComparatorContext);
	}
	constructor(ctx: ExpressionSimpleContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: SimpleBooleanListener): void {
		if (listener.enterComparatorExpression) {
			listener.enterComparatorExpression(this);
		}
	}
	// @Override
	public exitRule(listener: SimpleBooleanListener): void {
		if (listener.exitComparatorExpression) {
			listener.exitComparatorExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: SimpleBooleanVisitor<Result>): Result {
		if (visitor.visitComparatorExpression) {
			return visitor.visitComparatorExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IdentifierExpressionContext extends ExpressionSimpleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(SimpleBooleanParser.IDENTIFIER, 0); }
	constructor(ctx: ExpressionSimpleContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: SimpleBooleanListener): void {
		if (listener.enterIdentifierExpression) {
			listener.enterIdentifierExpression(this);
		}
	}
	// @Override
	public exitRule(listener: SimpleBooleanListener): void {
		if (listener.exitIdentifierExpression) {
			listener.exitIdentifierExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: SimpleBooleanVisitor<Result>): Result {
		if (visitor.visitIdentifierExpression) {
			return visitor.visitIdentifierExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ParenExpressionContext extends ExpressionSimpleContext {
	public LPAREN(): TerminalNode { return this.getToken(SimpleBooleanParser.LPAREN, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(SimpleBooleanParser.RPAREN, 0); }
	constructor(ctx: ExpressionSimpleContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: SimpleBooleanListener): void {
		if (listener.enterParenExpression) {
			listener.enterParenExpression(this);
		}
	}
	// @Override
	public exitRule(listener: SimpleBooleanListener): void {
		if (listener.exitParenExpression) {
			listener.exitParenExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: SimpleBooleanVisitor<Result>): Result {
		if (visitor.visitParenExpression) {
			return visitor.visitParenExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NumExpressionContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return SimpleBooleanParser.RULE_numExpression; }
	public copyFrom(ctx: NumExpressionContext): void {
		super.copyFrom(ctx);
	}
}
export class IdentifierNumExpressionContext extends NumExpressionContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(SimpleBooleanParser.IDENTIFIER, 0); }
	constructor(ctx: NumExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: SimpleBooleanListener): void {
		if (listener.enterIdentifierNumExpression) {
			listener.enterIdentifierNumExpression(this);
		}
	}
	// @Override
	public exitRule(listener: SimpleBooleanListener): void {
		if (listener.exitIdentifierNumExpression) {
			listener.exitIdentifierNumExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: SimpleBooleanVisitor<Result>): Result {
		if (visitor.visitIdentifierNumExpression) {
			return visitor.visitIdentifierNumExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class DecimalExpressionContext extends NumExpressionContext {
	public DECIMAL(): TerminalNode { return this.getToken(SimpleBooleanParser.DECIMAL, 0); }
	constructor(ctx: NumExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: SimpleBooleanListener): void {
		if (listener.enterDecimalExpression) {
			listener.enterDecimalExpression(this);
		}
	}
	// @Override
	public exitRule(listener: SimpleBooleanListener): void {
		if (listener.exitDecimalExpression) {
			listener.exitDecimalExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: SimpleBooleanVisitor<Result>): Result {
		if (visitor.visitDecimalExpression) {
			return visitor.visitDecimalExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ComparatorContext extends ParserRuleContext {
	public GT(): TerminalNode | undefined { return this.tryGetToken(SimpleBooleanParser.GT, 0); }
	public GE(): TerminalNode | undefined { return this.tryGetToken(SimpleBooleanParser.GE, 0); }
	public LT(): TerminalNode | undefined { return this.tryGetToken(SimpleBooleanParser.LT, 0); }
	public LE(): TerminalNode | undefined { return this.tryGetToken(SimpleBooleanParser.LE, 0); }
	public EQ(): TerminalNode | undefined { return this.tryGetToken(SimpleBooleanParser.EQ, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return SimpleBooleanParser.RULE_comparator; }
	// @Override
	public enterRule(listener: SimpleBooleanListener): void {
		if (listener.enterComparator) {
			listener.enterComparator(this);
		}
	}
	// @Override
	public exitRule(listener: SimpleBooleanListener): void {
		if (listener.exitComparator) {
			listener.exitComparator(this);
		}
	}
	// @Override
	public accept<Result>(visitor: SimpleBooleanVisitor<Result>): Result {
		if (visitor.visitComparator) {
			return visitor.visitComparator(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


