import { useState } from "react";
import "./App.css";

import {
  grammar,
  type GrammarSymbol,
  type ParseNode,
  type ParseResult,
  type Terminal,
  type WorkItem,
} from "./grammar";

import { isNonTerminal } from "./utils/isNonTerminalFun";

// نمایش بازگشتی هر گره درخت
function TreeBranch({ node }: { node: ParseNode }) {
  return (
    <div className="flex min-w-max flex-col items-center">
      <div
        className={`rounded-xl px-4 py-3 font-mono text-sm font-bold shadow-[5px_5px_10px_#c8ccd2,-5px_-5px_10px_#ffffff] ${
          node.accepted
            ? "border border-[#4e9d83] bg-[#e1f0e9] text-[#39866d]"
            : "bg-[#e6eaf0] text-[#5879b4]"
        }`}
        dir="ltr"
      >
        {node.form.join(" ")}
        {node.accepted && <span className="ml-2 text-xs">✓</span>}
      </div>

      {node.children.length > 0 && (
        <>
          <div className="h-6 w-px bg-[#aebbd0]" />

          <div className="flex items-start justify-center border-t border-[#aebbd0]">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center px-3">
                <div className="h-6 w-px bg-[#aebbd0]" />
                <TreeBranch node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  const [inputText, setInputText] = useState("id + id");
  const [duration, setDuration] = useState<number>(0);
  const [res, setRes] = useState<boolean | null>(null);
  const [tree, setTree] = useState<ParseNode | null>(null);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // الگوریتم اصلی
  function parse(input: Terminal[]): ParseResult {
    let nextId = 1;

    const root: ParseNode = {
      id: 0,
      form: ["E"],
      children: [],
      accepted: false,
    };

    const worklist: WorkItem[] = [
      {
        form: root.form,
        node: root,
        ancestors: new Set([JSON.stringify(root.form)]),
      },
    ];

    while (worklist.length > 0) {
      const current = worklist.shift();

      if (!current) continue;

      const { form, node, ancestors } = current;

      if (form.length > input.length) {
        continue;
      }

      if (!isValid(form, input)) {
        continue;
      }

      if (isAccepted(form, input)) {
        node.accepted = true;
        continue;
      }

      const newForms = expand(form);

      newForms.forEach((newForm) => {
        if (newForm.length > input.length) {
          return;
        }

        const selected = JSON.stringify(newForm);

        // جلوگیری از تکرار یک فرم در مسیر فعلی
        if (ancestors.has(selected)) {
          return;
        }

        const child: ParseNode = {
          id: nextId++,
          form: newForm,
          children: [],
          accepted: false,
        };

        node.children.push(child);

        worklist.push({
          form: newForm,
          node: child,
          ancestors: new Set([...ancestors, selected]),
        });
      });
    }

    // حذف شاخه‌هایی که به پذیرش نمی‌رسند
    function keepSuccessfulBranches(node: ParseNode): boolean {
      node.children = node.children.filter((child) =>
        keepSuccessfulBranches(child),
      );

      return node.accepted || node.children.length > 0;
    }

    const accepted = keepSuccessfulBranches(root);

    return {
      accepted,
      root,
    };
  }

  // بررسی پذیرش دقیق فرم
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

  // بررسی معتبر بودن پیشوند فرم
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

  // گسترش Non-terminalها
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

  // اجرای الگوریتم
  function grammarResult() {
    setError("");
    setRes(null);
    setTree(null);
    setIsModalOpen(false);

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
    setRes(result.accepted);
    setTree(result.root);
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
              setTree(null);
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
              <div className="flex flex-wrap items-center gap-4">
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

                {res && tree && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-xl bg-[#e6eaf0] px-5 py-3 text-sm font-bold text-[#5879b4] shadow-[5px_5px_10px_#c8ccd2,-5px_-5px_10px_#ffffff] transition-all hover:text-[#3d66aa] active:shadow-[inset_4px_4px_8px_#c8ccd2,inset_-4px_-4px_8px_#ffffff]"
                  >
                    View Parse Tree
                  </button>
                )}
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

      {/* Tree Modal */}
      {isModalOpen && tree && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#354158]/50 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-[#e6eaf0] shadow-[12px_12px_30px_#8f949b,-12px_-12px_30px_#ffffff]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#d4d9e0] p-5 sm:p-7">
              <div>
                <span className="text-[10px] font-bold tracking-[2px] text-[#8996aa]">
                  PARSING VISUALIZATION
                </span>

                <h2 className="mt-2 text-xl font-extrabold">Parse Tree</h2>

                <p className="mt-1 text-xs text-[#8996aa]">
                  Only successful branches are displayed.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="grid size-10 place-items-center rounded-xl text-xl text-[#8996aa] shadow-[4px_4px_8px_#c8ccd2,-4px_-4px_8px_#ffffff] hover:text-[#c65c68]"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 sm:p-12">
              <div className="flex min-w-max justify-center">
                <TreeBranch node={tree} />
              </div>
            </div>

            <div className="flex items-center gap-5 border-t border-[#d4d9e0] px-5 py-4 text-xs text-[#8996aa]">
              <span className="flex items-center gap-2">
                <span className="size-3 rounded bg-[#e6eaf0] shadow-[2px_2px_4px_#c8ccd2,-2px_-2px_4px_#ffffff]" />
                Derivation
              </span>

              <span className="flex items-center gap-2">
                <span className="size-3 rounded border border-[#4e9d83] bg-[#e1f0e9]" />
                Accepted
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
