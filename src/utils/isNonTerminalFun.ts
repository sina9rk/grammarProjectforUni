// guard type

import { grammar, type GrammarSymbol, type NonTerminal } from "../grammar";

export const isNonTerminal = (value: GrammarSymbol): value is NonTerminal => {
  return value in grammar;
};

