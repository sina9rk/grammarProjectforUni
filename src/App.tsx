import { useState } from "react";
import "./App.css";

import { grammar, type GrammarSymbol, type Terminal } from "./grammar";

import { isNonTerminal } from "./utils/isNonTerminalFun";

function App() {
  const [inputText, setInputText] = useState("id + id");
  const [duration, setDuration] = useState<number>(0);
  const [res, setRes] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  function parse(input: Terminal[]): boolean {
    const worklist: GrammarSymbol[][] = [["E"]];
    const visited = new Set<string>();

    while (worklist.length > 0) {
      const form = worklist.shift();

      if (!form || form.length > input.length) {
        continue;
      }

      const selected = JSON.stringify(form);

      if (visited.has(selected)) {
        continue;
      }

      visited.add(selected);

      if (isValid(form, input)) {
        if (isAccepted(form, input)) {
          return true;
        }

        const newRes = expand(form);
        worklist.push(...newRes);
      }
    }

    return false;
  }

  function isAccepted(form: GrammarSymbol[], input: Terminal[]): boolean {
    if (form.length !== input.length) {
      return false;
    }

    for (let i = 0; i < form.length; i++) {
      if (form[i] !== input[i]) {
        return false;
      }
    }

    return true;
  }

  function isValid(form: GrammarSymbol[], input: Terminal[]): boolean {
    for (let i = 0; i < form.length; i++) {
      const symbol = form[i];

      if (isNonTerminal(symbol)) {
        break;
      }

      if (i >= input.length) {
        return false;
      }

      if (symbol !== input[i]) {
        return false;
      }
    }

    return true;
  }

  function expand(form: GrammarSymbol[]): GrammarSymbol[][] {
    const result: GrammarSymbol[][] = [];

    for (let i = 0; i < form.length; i++) {
      const symbol = form[i];

      if (isNonTerminal(symbol)) {
        grammar[symbol].forEach((production) => {
          const newForm: GrammarSymbol[] = [
            ...form.slice(0, i),
            ...production,
            ...form.slice(i + 1),
          ];

          result.push(newForm);
        });
      }
    }

    return result;
  }

  function grammarResult() {
    setError("");
    setRes(null);

    const trimmedInput = inputText.trim();

    if (!trimmedInput) {
      setError("Please enter an input string.");
      return;
    }

    const tokens = trimmedInput.split(/\s+/);
    const validTokens: Terminal[] = ["id", "(", "+", ")"];

    if (!tokens.every((token) => validTokens.includes(token as Terminal))) {
      setError("Invalid symbols. Use id, +, ( and ).");
      return;
    }

    const input = tokens as Terminal[];

    const start = performance.now();
    const result = parse(input);
    const end = performance.now();

    setDuration(end - start);
    setRes(result);
  }

  return (
    <main className="min-h-screen bg-[#e6eaf0] px-4 py-12 text-[#354158] sm:py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
        {/* Header */}
        <header className="mb-4 text-center">
          <span className="text-[11px] font-bold tracking-[3px] text-[#8996aa]">
            COMPILER DESIGN PROJECT
          </span>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Top-Down Parser
          </h1>

          <p className="mt-3 text-sm text-[#8490a3]">
            Explore grammar productions and test your input strings.
          </p>
        </header>

        {/* Grammar */}
        <section className="rounded-3xl bg-[#e6eaf0] p-6 shadow-[9px_9px_18px_#c8ccd2,-9px_-9px_18px_#ffffff] sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-[2px] text-[#8996aa]">
                01 / GRAMMAR
              </span>

              <h2 className="mt-2 text-lg font-bold">Production Rules</h2>
            </div>

            <span className="rounded-full bg-[#e6eaf0] px-4 py-2 text-xs font-bold text-[#4e9d83] shadow-[inset_3px_3px_6px_#c8ccd2,inset_-3px_-3px_6px_#ffffff]">
              Active
            </span>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl bg-[#e6eaf0] p-5 shadow-[inset_5px_5px_10px_#c8ccd2,inset_-5px_-5px_10px_#ffffff]">
            {(Object.keys(grammar) as (keyof typeof grammar)[]).map(
              (nonTerminal) => (
                <div
                  key={nonTerminal}
                  className="grid grid-cols-[24px_18px_1fr] items-center gap-3 font-mono text-sm sm:grid-cols-[30px_25px_1fr] sm:text-base"
                  dir="ltr"
                >
                  <span className="font-extrabold text-[#617fbd]">
                    {nonTerminal}
                  </span>

                  <span className="text-[#9aa5b6]">→</span>

                  <span className="break-words leading-7 text-[#46536a]">
                    {grammar[nonTerminal]
                      .map((production) => production.join(" "))
                      .join("  |  ")}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>

        {/* Input */}
        <section className="rounded-3xl bg-[#e6eaf0] p-6 shadow-[9px_9px_18px_#c8ccd2,-9px_-9px_18px_#ffffff] sm:p-8">
          <div className="mb-6">
            <span className="text-[10px] font-bold tracking-[2px] text-[#8996aa]">
              02 / INPUT
            </span>

            <h2 className="mt-2 text-lg font-bold">Test Your String</h2>
          </div>

          <label
            htmlFor="input-string"
            className="mb-3 block text-sm font-semibold text-[#65738a]"
          >
            Enter your target string
          </label>

          <input
            id="input-string"
            type="text"
            value={inputText}
            onChange={(event) => {
              setInputText(event.target.value);
              setRes(null);
              setError("");
            }}
            placeholder="Example: id + id"
            dir="ltr"
            className="h-14 w-full rounded-xl border-none bg-[#e6eaf0] px-5 text-base text-[#39465e] outline-none shadow-[inset_5px_5px_9px_#c8ccd2,inset_-5px_-5px_9px_#ffffff] transition-shadow placeholder:text-[#a0aabb] focus:shadow-[inset_3px_3px_6px_#c8ccd2,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#91a9d5]"
          />

          <p className="mt-3 text-xs text-[#929daf]">
            Separate each grammar symbol with a space. Example: ( id + id )
          </p>

          {error && <p className="mt-3 text-sm text-[#c65c68]">{error}</p>}

          <button
            onClick={grammarResult}
            className="mt-7 flex h-14 w-full items-center justify-center gap-4 rounded-xl bg-[#e6eaf0] font-bold text-[#5879b4] shadow-[6px_6px_12px_#c8ccd2,-6px_-6px_12px_#ffffff] transition-all hover:-translate-y-0.5 hover:text-[#3d66aa] active:translate-y-0 active:shadow-[inset_4px_4px_8px_#c8ccd2,inset_-4px_-4px_8px_#ffffff]"
          >
            Run Parser
            <span className="text-xl">→</span>
          </button>
        </section>

        {/* Result */}
        <section className="rounded-3xl bg-[#e6eaf0] p-6 shadow-[9px_9px_18px_#c8ccd2,-9px_-9px_18px_#ffffff] sm:p-8">
          <div className="mb-6">
            <span className="text-[10px] font-bold tracking-[2px] text-[#8996aa]">
              03 / RESULT
            </span>

            <h2 className="mt-2 text-lg font-bold">Parsing Result</h2>
          </div>

          <div className="flex min-h-24 items-center">
            {res === null ? (
              <p className="text-sm text-[#929daf]">
                Your parsing result will appear here.
              </p>
            ) : (
              <div className="flex items-center gap-4">
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e6eaf0] text-2xl font-extrabold shadow-[5px_5px_10px_#c8ccd2,-5px_-5px_10px_#ffffff] ${
                    res ? "text-[#4e9d83]" : "text-[#c65c68]"
                  }`}
                >
                  {res ? "✓" : "✕"}
                </span>

                <div>
                  <h3
                    className={`font-bold ${
                      res ? "text-[#4e9d83]" : "text-[#c65c68]"
                    }`}
                  >
                    {res ? "String Accepted" : "String Rejected"}
                  </h3>

                  <p className="mt-1 text-xs text-[#8995a8]">
                    {res
                      ? "The input belongs to this grammar."
                      : "The input does not belong to this grammar."}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#d4d9e0] pt-5 text-xs text-[#8995a8]">
            <span>Processing Time</span>

            <strong className="text-sm tabular-nums text-[#5879b4]">
              {duration.toFixed(3)} ms
            </strong>
          </div>
        </section>

        <footer className="py-3 text-center text-[11px] text-[#a0aabb]">
          Compiler Design · Top-Down Parsing
        </footer>
      </div>
    </main>
  );
}

export default App;
