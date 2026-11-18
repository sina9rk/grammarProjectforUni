export type NonTerminal = "E" | "T";

export type Terminal = "id" | "(" | "+" | ")";

export type GrammarSymbol = Terminal | NonTerminal;

export const grammar: Record<NonTerminal, GrammarSymbol[][]> = {
  E: [["T", "+", "E"], ["T"]],
  T: [["id"], ["(", "E", ")"]],
};
