/* eslint-disable */
// Generated from ./src/step/SimpleBoolean.g4 by ANTLR 4.7.3-SNAPSHOT
// @ts-nocheck

import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { NotNull } from "antlr4ts/Decorators";
import { Override } from "antlr4ts/Decorators";
import { RuleContext } from "antlr4ts/RuleContext";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";


export class SimpleBooleanLexer extends Lexer {
	public static readonly AND = 1;
	public static readonly OR = 2;
	public static readonly NOT = 3;
	public static readonly TRUE = 4;
	public static readonly FALSE = 5;
	public static readonly GT = 6;
	public static readonly GE = 7;
	public static readonly LT = 8;
	public static readonly DIF = 9;
	public static readonly LE = 10;
	public static readonly EQ = 11;
	public static readonly LPAREN = 12;
	public static readonly RPAREN = 13;
	public static readonly DECIMAL = 14;
	public static readonly IDENTIFIER = 15;
	public static readonly WS = 16;

	// tslint:disable:no-trailing-whitespace
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"AND", "OR", "NOT", "TRUE", "FALSE", "GT", "GE", "LT", "DIF", "LE", "EQ", 
		"LPAREN", "RPAREN", "DECIMAL", "IDENTIFIER", "WS",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'AND'", "'OR'", "'NOT'", "'TRUE'", "'FALSE'", "'>'", "'>='", 
		"'<'", "'<>'", "'<='", "'='", "'('", "')'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "AND", "OR", "NOT", "TRUE", "FALSE", "GT", "GE", "LT", "DIF", 
		"LE", "EQ", "LPAREN", "RPAREN", "DECIMAL", "IDENTIFIER", "WS",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(SimpleBooleanLexer._LITERAL_NAMES, SimpleBooleanLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return SimpleBooleanLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(SimpleBooleanLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "SimpleBoolean.g4"; }

	// @Override
	public get ruleNames(): string[] { return SimpleBooleanLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return SimpleBooleanLexer._serializedATN; }

	// @Override
	public get channelNames(): string[] { return SimpleBooleanLexer.channelNames; }

	// @Override
	public get modeNames(): string[] { return SimpleBooleanLexer.modeNames; }

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02\x12j\b\x01\x04" +
		"\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04" +
		"\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r" +
		"\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x03\x02\x03\x02" +
		"\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x04\x03\x04\x03\x04\x03\x04" +
		"\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06" +
		"\x03\x06\x03\x06\x03\x07\x03\x07\x03\b\x03\b\x03\b\x03\t\x03\t\x03\n\x03" +
		"\n\x03\n\x03\v\x03\v\x03\v\x03\f\x03\f\x03\r\x03\r\x03\x0E\x03\x0E\x03" +
		"\x0F\x05\x0FN\n\x0F\x03\x0F\x06\x0FQ\n\x0F\r\x0F\x0E\x0FR\x03\x0F\x03" +
		"\x0F\x06\x0FW\n\x0F\r\x0F\x0E\x0FX\x05\x0F[\n\x0F\x03\x10\x03\x10\x07" +
		"\x10_\n\x10\f\x10\x0E\x10b\v\x10\x03\x11\x06\x11e\n\x11\r\x11\x0E\x11" +
		"f\x03\x11\x03\x11\x02\x02\x02\x12\x03\x02\x03\x05\x02\x04\x07\x02\x05" +
		"\t\x02\x06\v\x02\x07\r\x02\b\x0F\x02\t\x11\x02\n\x13\x02\v\x15\x02\f\x17" +
		"\x02\r\x19\x02\x0E\x1B\x02\x0F\x1D\x02\x10\x1F\x02\x11!\x02\x12\x03\x02" +
		"\x06\x03\x022;\x05\x02C\\aac|\x06\x022;C\\aac|\x05\x02\v\f\x0E\x0F\"\"" +
		"\x02o\x02\x03\x03\x02\x02\x02\x02\x05\x03\x02\x02\x02\x02\x07\x03\x02" +
		"\x02\x02\x02\t\x03\x02\x02\x02\x02\v\x03\x02\x02\x02\x02\r\x03\x02\x02" +
		"\x02\x02\x0F\x03\x02\x02\x02\x02\x11\x03\x02\x02\x02\x02\x13\x03\x02\x02" +
		"\x02\x02\x15\x03\x02\x02\x02\x02\x17\x03\x02\x02\x02\x02\x19\x03\x02\x02" +
		"\x02\x02\x1B\x03\x02\x02\x02\x02\x1D\x03\x02\x02\x02\x02\x1F\x03\x02\x02" +
		"\x02\x02!\x03\x02\x02\x02\x03#\x03\x02\x02\x02\x05\'\x03\x02\x02\x02\x07" +
		"*\x03\x02\x02\x02\t.\x03\x02\x02\x02\v3\x03\x02\x02\x02\r9\x03\x02\x02" +
		"\x02\x0F;\x03\x02\x02\x02\x11>\x03\x02\x02\x02\x13@\x03\x02\x02\x02\x15" +
		"C\x03\x02\x02\x02\x17F\x03\x02\x02\x02\x19H\x03\x02\x02\x02\x1BJ\x03\x02" +
		"\x02\x02\x1DM\x03\x02\x02\x02\x1F\\\x03\x02\x02\x02!d\x03\x02\x02\x02" +
		"#$\x07C\x02\x02$%\x07P\x02\x02%&\x07F\x02\x02&\x04\x03\x02\x02\x02\'(" +
		"\x07Q\x02\x02()\x07T\x02\x02)\x06\x03\x02\x02\x02*+\x07P\x02\x02+,\x07" +
		"Q\x02\x02,-\x07V\x02\x02-\b\x03\x02\x02\x02./\x07V\x02\x02/0\x07T\x02" +
		"\x0201\x07W\x02\x0212\x07G\x02\x022\n\x03\x02\x02\x0234\x07H\x02\x024" +
		"5\x07C\x02\x0256\x07N\x02\x0267\x07U\x02\x0278\x07G\x02\x028\f\x03\x02" +
		"\x02\x029:\x07@\x02\x02:\x0E\x03\x02\x02\x02;<\x07@\x02\x02<=\x07?\x02" +
		"\x02=\x10\x03\x02\x02\x02>?\x07>\x02\x02?\x12\x03\x02\x02\x02@A\x07>\x02" +
		"\x02AB\x07@\x02\x02B\x14\x03\x02\x02\x02CD\x07>\x02\x02DE\x07?\x02\x02" +
		"E\x16\x03\x02\x02\x02FG\x07?\x02\x02G\x18\x03\x02\x02\x02HI\x07*\x02\x02" +
		"I\x1A\x03\x02\x02\x02JK\x07+\x02\x02K\x1C\x03\x02\x02\x02LN\x07/\x02\x02" +
		"ML\x03\x02\x02\x02MN\x03\x02\x02\x02NP\x03\x02\x02\x02OQ\t\x02\x02\x02" +
		"PO\x03\x02\x02\x02QR\x03\x02\x02\x02RP\x03\x02\x02\x02RS\x03\x02\x02\x02" +
		"SZ\x03\x02\x02\x02TV\x070\x02\x02UW\t\x02\x02\x02VU\x03\x02\x02\x02WX" +
		"\x03\x02\x02\x02XV\x03\x02\x02\x02XY\x03\x02\x02\x02Y[\x03\x02\x02\x02" +
		"ZT\x03\x02\x02\x02Z[\x03\x02\x02\x02[\x1E\x03\x02\x02\x02\\`\t\x03\x02" +
		"\x02]_\t\x04\x02\x02^]\x03\x02\x02\x02_b\x03\x02\x02\x02`^\x03\x02\x02" +
		"\x02`a\x03\x02\x02\x02a \x03\x02\x02\x02b`\x03\x02\x02\x02ce\t\x05\x02" +
		"\x02dc\x03\x02\x02\x02ef\x03\x02\x02\x02fd\x03\x02\x02\x02fg\x03\x02\x02" +
		"\x02gh\x03\x02\x02\x02hi\b\x11\x02\x02i\"\x03\x02\x02\x02\t\x02MRXZ`f" +
		"\x03\b\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!SimpleBooleanLexer.__ATN) {
			SimpleBooleanLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(SimpleBooleanLexer._serializedATN));
		}

		return SimpleBooleanLexer.__ATN;
	}

}

