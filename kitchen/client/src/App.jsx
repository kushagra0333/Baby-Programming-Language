import React, { useState, useEffect } from "react";
import Split from "react-split";
import Editor from "@monaco-editor/react";
import axios from "axios";
import {
  Play,
  BookOpen,
  Moon,
  Sun,
  Terminal,
  Cpu,
  AlertCircle,
  Utensils,
  Flame,
  MessageSquare,
  HelpCircle,
  Code2,
  ChefHat,
  ArrowRight
} from "lucide-react";
import "./index.css";

const DEFAULT_CODE = `note Relationship Viability Calculator

recipe calculate_viability(ingredient texts_received, ingredient texts_sent) {
    note If you send more than you receive... oh no.
    taste(texts_sent > texts_received * 2) {
        rest;
        plate("Stage 5 Clinger Alert.");
        kitchen_closed(0);
    }
    
    ingredient ratio = texts_received * 10 / texts_sent;
    finish(ratio);
}

ingredient my_texts = 50;
ingredient her_texts = 2;

plate("Calculating viability...");
rest;

ingredient score = calculate_viability(her_texts, my_texts);

taste(score < 5) {
   plate("Viability Score: Low.");
   rest;
   plate("It is not you, it is... actually, it is you.");
} serve {
   plate("Viability Score: Good.");
   plate("Plan the wedding.");
}

kitchen_closed(0);
`;

const CHEAT_SHEET = [
  {
    cmd: "ingredient",
    desc: "Declare a number variable (because we all need hope).",
    ex: "ingredient x = 10;",
    icon: <Utensils size={18} />,
  },
  {
    cmd: "taste",
    desc: "Start a conditional block (if).",
    ex: "taste(x > 5) { ... }",
    icon: <HelpCircle size={18} />,
  },
  {
    cmd: "retaste",
    desc: "Else-if condition.",
    ex: "retaste(x == 5) { ... }",
    icon: <HelpCircle size={18} />,
  },
  {
    cmd: "serve",
    desc: "Else block (time to move on).",
    ex: "serve { ... }",
    icon: <ArrowRight size={18} />,
  },
  {
    cmd: "simmer",
    desc: "While loop (keep waiting until condition fails).",
    ex: "simmer(x > 0) { ... }",
    icon: <Flame size={18} />,
  },
  {
    cmd: "plate",
    desc: "Print something to the output.",
    ex: 'plate("hello");',
    icon: <Terminal size={18} />,
  },
  {
    cmd: "rest",
    desc: "Print a new line (take a breath).",
    ex: "rest;",
    icon: <Terminal size={18} />,
  },
  {
    cmd: "kitchen_closed",
    desc: "Exit program 0 / Return value in func.",
    ex: "kitchen_closed(0);",
    icon: <Flame size={18} />,
  },
  {
    cmd: "finish",
    desc: "Return value in func.",
    ex: "finish(0);",
    icon: <ArrowRight size={18} />,
  },
  {
    cmd: "recipe",
    desc: "Define function.",
    ex: "recipe add(ingredient a) { finish(a+1); }",
    icon: <Code2 size={18} />,
  },
  {
    cmd: "note",
    desc: "Single line comment (shhh).",
    ex: "note hidden text",
    icon: <MessageSquare size={18} />,
  },
  {
    cmd: "cookbook",
    desc: "Multi-line comment block.",
    ex: "cookbook ... cookbook",
    icon: <MessageSquare size={18} />,
  },
];

function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [assembly, setAssembly] = useState("");
  const [errors, setErrors] = useState("");
  const [activeTab, setActiveTab] = useState("output");
  const [status, setStatus] = useState("idle");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleRun = async () => {
    setStatus("loading");
    setOutput("");
    setAssembly("");
    setErrors("");

    if (activeTab === "asm") setActiveTab("output");

    try {
      const response = await axios.post("/compile", { code });
      const data = response.data;

      if (data.success) {
        setStatus("success");
        setOutput(data.output || "No output (ghosted?).");
        setAssembly(data.assembly);
        setActiveTab("output");
      } else {
        setStatus("error");
        setErrors(data.errors);
        setActiveTab("errors");
      }
    } catch (err) {
      setStatus("error");
      setErrors("Network error: The backend is probably sleeping.");
      setActiveTab("errors");
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header-container">
        <div className="header-branding">
          <h1 className="main-title">cook.</h1>
          <div className="subtitle">
            The chillest programming language for chefs.
          </div>
        </div>
        <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">
          {theme === "dark" ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </header>

      {/* The Playground Box */}
      <div className="playground-box">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-title">
            <div className="window-controls">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span style={{ marginLeft: "10px" }}>playground.cook</span>
          </div>
          <div className="toolbar-actions">
            {status === "loading" && <span className="spinner"></span>}

            <button
              className="btn-secondary"
              onClick={() =>
                window.open(
                  "https://github.com/kushagra0333/Cook-Programming-Language",
                  "_blank",
                )
              }
            >
              <BookOpen size={16} /> Docs
            </button>
            <button
              className="btn-primary"
              onClick={handleRun}
              disabled={status === "loading"}
            >
              <Play size={16} fill="currentColor" /> Cook Code
            </button>
          </div>
        </div>

        {/* Split View */}
        <Split
          className="split"
          sizes={[50, 50]}
          minSize={100}
          expandToMin={false}
          gutterSize={6}
          gutterAlign="center"
          direction="horizontal"
          cursor="col-resize"
        >
          {/* Editor */}
          <div className="editor-pane">
            <Editor
              height="100%"
              defaultLanguage="cpp" // fallback
              theme={theme === "dark" ? "vs-dark" : "light"}
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: '"JetBrains Mono", monospace',
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20 },
                lineHeight: 24,
                renderLineHighlight: "none",
                smoothScrolling: true,
              }}
              onMount={(editor, monaco) => {
                monaco.languages.register({ id: "cook" });
                monaco.languages.setMonarchTokensProvider("cook", {
                  keywords: [
                    "ingredient",
                    "taste",
                    "retaste",
                    "serve",
                    "simmer",
                    "kitchen_closed",
                    "plate",
                    "rest",
                    "recipe",
                    "finish",
                  ],
                  tokenizer: {
                    root: [
                      [
                        /[a-z_$][\w$]*/,
                        {
                          cases: {
                            "@keywords": "keyword",
                            "@default": "identifier",
                          },
                        },
                      ],
                      [/[0-9]+/, "number"],
                      [
                        /"/,
                        {
                          token: "string.quote",
                          bracket: "@open",
                          next: "@string",
                        },
                      ],
                      [/note.*/, "comment"],
                      [/cookbook[\s\S]*?cookbook/, "comment"],
                      [/[{}()\[\]]/, "@brackets"],
                      [/[=><!]+/, "operator"],
                    ],
                    string: [
                      [/[^\\"]+/, "string"],
                      [
                        /"/,
                        {
                          token: "string.quote",
                          bracket: "@close",
                          next: "@pop",
                        },
                      ],
                    ],
                  },
                });
                monaco.editor.defineTheme("cook-theme", {
                  base: "vs-dark",
                  inherit: true,
                  rules: [
                    {
                      token: "keyword",
                      foreground: "f97316", // Orange 500
                      fontStyle: "bold",
                    },
                    { token: "identifier", foreground: "fbbf24" }, // Amber 400
                    { token: "string", foreground: "a3e635" }, // Lime 400
                    {
                      token: "comment",
                      foreground: "78716c", // Stone 500
                      fontStyle: "italic",
                    },
                    { token: "number", foreground: "fca5a5" }, // Red 300
                    { token: "operator", foreground: "fdba74" }, // Orange 300
                  ],
                  colors: {
                    "editor.background": "#1c1917", // Stone 900
                    "editor.foreground": "#f5f5f4", // Stone 100
                  },
                });
                monaco.editor.setModelLanguage(editor.getModel(), "cook");
              }}
            />
          </div>

          {/* Output */}
          <div className="output-pane">
            <div className="tabs">
              <div
                className={`tab ${activeTab === "output" ? "active" : ""}`}
                onClick={() => setActiveTab("output")}
              >
                <Terminal
                  size={14}
                  style={{
                    marginRight: 6,
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                />
                Output
              </div>
              <div
                className={`tab ${activeTab === "asm" ? "active" : ""}`}
                onClick={() => setActiveTab("asm")}
              >
                <Cpu
                  size={14}
                  style={{
                    marginRight: 6,
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                />
                Assembly
              </div>
              <div
                className={`tab ${activeTab === "errors" ? "active" : ""}`}
                onClick={() => setActiveTab("errors")}
              >
                <AlertCircle
                  size={14}
                  style={{
                    marginRight: 6,
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                />
                Errors
              </div>
            </div>

            <div className="pane-content">
              {activeTab === "output" && (
                <div className="output-content">
                  {output || (
                    <span style={{ opacity: 0.5 }}>Ready when you are...</span>
                  )}
                </div>
              )}
              {activeTab === "asm" && (
                <div className="output-content" style={{ color: "#7aa2f7" }}>
                  {assembly || (
                    <span style={{ opacity: 0.5 }}>No assembly yet.</span>
                  )}
                </div>
              )}
              {activeTab === "errors" && (
                <div className="output-content error">
                  {errors || (
                    <span style={{ opacity: 0.5 }}>No errors! Good chef.</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Split>
      </div>

      {/* Cheat Sheet */}
      <div className="cheatsheet-container">
        <div className="cheatsheet-header">
          <BookOpen size={24} color="var(--accent-primary)" />
          <h2 className="cheatsheet-title">Syntax Cheat Sheet</h2>
        </div>

        <div className="cheatsheet-grid">
          {CHEAT_SHEET.map((item, index) => (
            <div key={index} className="cheat-card">
              <div className="cheat-header">
                <span className="cheat-cmd">{item.cmd}</span>
                {item.icon && (
                  <span style={{ color: "var(--text-secondary)" }}>
                    {item.icon}
                  </span>
                )}
              </div>
              <div className="cheat-desc">{item.desc}</div>
              <div className="cheat-example">{item.ex}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
