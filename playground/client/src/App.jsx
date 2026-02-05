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
  Heart,
  Zap,
  MessageSquare,
  HelpCircle,
  Code2,
} from "lucide-react";
import "./index.css";

const DEFAULT_CODE = `secret Relationship Viability Calculator

hope calculate_viability(hope texts_received, hope texts_sent) {
    secret If you send more than you receive... oh no.
    maybe(texts_sent > texts_received * 2) {
        then;
        tell_me("Stage 5 Clinger Alert.");
        bye(0);
    }
    
    hope ratio = texts_received * 10 / texts_sent;
    bye(ratio);
}

hope my_texts = 50;
hope her_texts = 2;

tell_me("Calculating viability...");
then;

hope score = calculate_viability(her_texts, my_texts);

maybe(score < 5) {
   tell_me("Viability Score: Low.");
   then;
   tell_me("It is not you, it is... actually, it is you.");
} moveon {
   tell_me("Viability Score: Good.");
   tell_me("Plan the wedding.");
}

bye(0);
`;

const CHEAT_SHEET = [
  {
    cmd: "hope",
    desc: "Declare a number variable (because we all need hope).",
    ex: "hope x = 10;",
    icon: <Heart size={18} />,
  },
  {
    cmd: "dillusion",
    desc: "Declare a string variable (it is all just an illusion).",
    ex: 'dillusion s = "hi";',
    icon: <MessageSquare size={18} />,
  },
  {
    cmd: "maybe",
    desc: "Start a conditional block (if).",
    ex: "maybe(x > 5) { ... }",
    icon: <HelpCircle size={18} />,
  },
  {
    cmd: "ormaybe",
    desc: "Else-if condition.",
    ex: "ormaybe(x == 5) { ... }",
    icon: <HelpCircle size={18} />,
  },
  {
    cmd: "moveon",
    desc: "Else block (time to move on).",
    ex: "moveon { ... }",
    icon: <Zap size={18} />,
  },
  {
    cmd: "wait",
    desc: "While loop (keep waiting until condition fails).",
    ex: "wait(x > 0) { ... }",
    icon: <Zap size={18} />,
  },
  {
    cmd: "tell_me",
    desc: "Print something to the output.",
    ex: 'tell_me("hello");',
    icon: <Terminal size={18} />,
  },
  {
    cmd: "then",
    desc: "Print a new line (take a breath).",
    ex: "then;",
    icon: <Terminal size={18} />,
  },
  {
    cmd: "bye",
    desc: "Exit program 0 / Return value in func.",
    ex: "bye(0);",
    icon: <Zap size={18} />,
  },
  {
    cmd: "func",
    desc: "Define function.",
    ex: "hope add(hope a) { bye(a+1); }",
    icon: <Code2 size={18} />,
  },
  {
    cmd: "call",
    desc: "Call function.",
    ex: "add(1);",
    icon: <Code2 size={18} />,
  },
  {
    cmd: "secret",
    desc: "Single line comment (shhh).",
    ex: "secret hidden text",
    icon: <MessageSquare size={18} />,
  },
  {
    cmd: "hide",
    desc: "Multi-line comment block.",
    ex: "hide ... hide",
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
          <h1 className="main-title">baby.</h1>
          <div className="subtitle">
            The chillest programming language for singles.
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
            <span style={{ marginLeft: "10px" }}>playground.by</span>
          </div>
          <div className="toolbar-actions">
            {status === "loading" && <span className="spinner"></span>}

            <button
              className="btn-secondary"
              onClick={() =>
                window.open(
                  "https://github.com/arjavjain5203/Baby-Programming-language",
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
              <Play size={16} fill="currentColor" /> Run Code
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
                monaco.languages.register({ id: "baby" });
                monaco.languages.setMonarchTokensProvider("baby", {
                  keywords: [
                    "hope",
                    "maybe",
                    "ormaybe",
                    "moveon",
                    "wait",
                    "bye",
                    "tell_me",
                    "dillusion",
                    "then",
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
                      [/\/\/.*/, "comment"],
                      [/hide[\s\S]*?hide/, "comment"],
                      [/secret.*/, "comment"],
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
                monaco.editor.defineTheme("baby-theme", {
                  base: "vs-dark",
                  inherit: true,
                  rules: [
                    {
                      token: "keyword",
                      foreground: "ff007c",
                      fontStyle: "bold",
                    },
                    { token: "identifier", foreground: "00f2ea" },
                    { token: "string", foreground: "e0af68" },
                    {
                      token: "comment",
                      foreground: "565f89",
                      fontStyle: "italic",
                    },
                    { token: "number", foreground: "ff9e64" },
                    { token: "operator", foreground: "89ddff" },
                  ],
                  colors: {
                    "editor.background": "#1e293b", // Match bg-secondary
                    "editor.foreground": "#c0caf5",
                  },
                });
                monaco.editor.setModelLanguage(editor.getModel(), "baby");
                // Note: We might want two themes for monaco eventually, but for now vs-dark works well with the dark theme.
                // Light theme might need a standard vs-light.
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
                    <span style={{ opacity: 0.5 }}>No errors! Good job.</span>
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
