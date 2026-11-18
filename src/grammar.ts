export type NonTerminal = "E" | "T";

export type Terminal = "id" | "(" | "+" | ")";

export type GrammarSymbol = Terminal | NonTerminal;

export const grammar: Record<NonTerminal, GrammarSymbol[][]> = {
  E: [["T", "+", "E"], ["T"]],
  T: [["id"], ["(", "E", ")"]],
};

export type ParseNode = {
  id: number;
  form: GrammarSymbol[];
  children: ParseNode[];
  accepted: boolean;
};

export type WorkItem = {
  form: GrammarSymbol[];
  node: ParseNode;
  ancestors: Set<string>;
};

export type ParseResult = {
  accepted: boolean;
  root: ParseNode;
};
