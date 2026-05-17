import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter }
from "react-syntax-highlighter";

import { oneDark }
from "react-syntax-highlighter/dist/esm/styles/prism";

function App() {

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const sendMessage = async () => {

    if (!query.trim()) return;

    const userMessage = {
      sender: "user",
      text: query,
      type: "text"
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {

      const res = await fetch(
        `http://127.0.0.1:8000/chat?query=${query}`
      );

      const data = await res.json();

      const botMessage = {
        sender: "assistant",
        text: data.response,
        type: data.type
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {

      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "Backend connection failed",
          type: "text"
        }
      ]);
    }

    setLoading(false);
    setQuery("");
  };

  const handleFileUpload = async (e) => {

  const file = e.target.files[0];

  if (!file) return;

  const formData = new FormData();

  formData.append("file", file);

  try {

    setLoading(true);

    const res = await fetch(
      "http://127.0.0.1:8000/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    setUploadedFile(file.name);

    setMessages((prev) => [

      ...prev,

      {
        sender: "assistant",

        text:
          `File uploaded successfully: ${file.name}\n\n` +
          `You can now ask questions like:\n` +
          `• Explain uploaded file\n` +
          `• Debug uploaded file\n` +
          `• Optimize uploaded file`,

        type: "text"
      }
    ]);

  } catch (error) {

    console.error(error);

    setMessages((prev) => [

      ...prev,

      {
        sender: "assistant",
        text: "File upload failed.",
        type: "text"
      }
    ]);

  } finally {

    setLoading(false);
  }
};
  // Detect programming language
  const detectLanguage = (code) => {

    if (
      code.includes("import React") ||
      code.includes("function App") ||
      code.includes("const ")
    ) {

      return "javascript";
    }

    if (
      code.includes("def ") ||
      code.includes("from fastapi") ||
      code.includes("import os")
    ) {

      return "python";
    }

    return "javascript";
  };

  // Beautiful formatting for explanations
  // Beautiful formatting for explanations
const formatResponse = (text) => {

  if (!text) return "";

  let formatted = text;

  // Remove markdown symbols
  formatted = formatted.replace(/\*\*/g, "");

  // Escape HTML tags so JSX/code is not rendered
formatted = formatted
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

  // Merge broken sentences into single line
formatted = formatted.replace(
  /([a-zA-Z0-9`,])\n([a-zA-Z`])/g,
  "$1 $2"
);

  // Remove excessive empty lines
  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  // Main headings
  const headings = [
    "Purpose of the Code:",
    "Important Functions:",
    "Overall Workflow:",
    "Beginner-Friendly Explanation:",
    "Key Components:",
    "Syntax Highlighting:",
    "Language Detection:"
  ];

// Convert markdown code blocks
formatted = formatted.replace(

  /```(\w+)?\s*([\s\S]*?)```/g,

  (match, language, code) => {

    return `
      <pre class="code-block">
${code}
      </pre>
    `;
  }
);
  

  headings.forEach((heading) => {

    const escapedHeading =
      heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(
      escapedHeading,
      "g"
    );

    formatted = formatted.replace(

      regex,

      `
      <div style="
        margin-top:20px;
        margin-bottom:10px;
        font-size:22px;
        font-weight:700;
        color:#93c5fd;
        border-left:4px solid #3b82f6;
        padding-left:12px;
        line-height:1.3;
      ">
        ${heading}
      </div>
      `
    );
  });

  // Numbered points
  formatted = formatted.replace(

    /^\s*\d+\.\s+(.+)$/gm,

    `
    <div style="
      margin-bottom:8px;
      line-height:1.6;
      color:#f8fafc;
      padding-left:4px;
    ">
      $&
    </div>
    `
  );

  // Bullet points
  formatted = formatted.replace(

    /^\s*[•*-]\s+(.+)$/gm,

    `
    <div style="
      margin-bottom:6px;
      line-height:1.6;
      color:#e2e8f0;
      padding-left:16px;
    ">
      • $1
    </div>
    `
  );

  // Inline code formatting
  formatted = formatted.replace(

    /`([^`]+)`/g,

    `
    <span style="
      background:#0f172a;
      color:#93c5fd;
      padding:2px 6px;
      border-radius:6px;
      font-family:monospace;
      font-size:14px;
    ">
      $1
    </span>
    `
  );

  // Remove excessive blank lines
formatted = formatted.replace(
  /\n{2,}/g,
  "\n"
);

// Only preserve paragraph spacing
formatted = formatted.replace(
  /\n{2,}/g,
  "<br><br>"
);

  return formatted;
};


  return (

    <div
      style={{
        background: "#020617",
        minHeight: "100vh",
        padding: "24px",
        color: "white",
        fontFamily: "Inter, Arial, sans-serif"
      }}
    >

      {/* HEADER */}

      <div
        style={{
          marginBottom: "20px"
        }}
      >

        <h1
          style={{
            fontSize: "38px",
            marginBottom: "6px",
            fontWeight: "700"
          }}
        >
          MCP AI Assistant
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "15px"
          }}
        >
          AI Coding Assistant using MCP-style orchestration
        </p>

      </div>


      {/* CHAT AREA */}

      <div
        style={{
          background: "#0f172a",
          borderRadius: "18px",
          padding: "18px",
          height: "72vh",
          overflowY: "auto",
          marginBottom: "18px",
          border: "1px solid #1e293b"
        }}
      >

        {
          messages.length === 0 && (

            <div
              style={{
                textAlign: "center",
                marginTop: "120px",
                color: "#64748b"
              }}
            >
              <h2
                style={{
                  marginBottom: "10px"
                }}
              >
                Start chatting with your AI assistant
              </h2>

              <p>
                Try:
                read App.js,
                explain App.js,
                current directory
              </p>
            </div>
          )
        }


        {messages.map((msg, index) => (

          <div
            key={index}
            style={{
              marginBottom: "14px",
              display: "flex",
              justifyContent:
                msg.sender === "user"
                  ? "flex-end"
                  : "flex-start"
            }}
          >

            {/* USER MESSAGE */}

            {
              msg.sender === "user" && (

                <div
                  style={{
                    background: "#2563eb",
                    padding: "14px 18px",
                    borderRadius: "16px",
                    maxWidth: "70%",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)"
                  }}
                >
                  {msg.text}
                </div>
              )
            }


            {/* ASSISTANT MESSAGE */}

            {
              msg.sender === "assistant" && (

                msg.type === "code" ? (

                  <div
                    style={{
                      width: "90%"
                    }}
                  >

                    <div
                      style={{
                        background: "#1e293b",
                        padding: "10px 14px",
                        borderTopLeftRadius: "14px",
                        borderTopRightRadius: "14px",
                        color: "#94a3b8",
                        fontSize: "13px",
                        borderBottom: "1px solid #334155"
                      }}
                    >
                      {detectLanguage(msg.text)}
                    </div>

                    <SyntaxHighlighter
                      language={detectLanguage(msg.text)}
                      style={oneDark}
                      customStyle={{
                        margin: 0,
                        borderBottomLeftRadius: "14px",
                        borderBottomRightRadius: "14px",
                        fontSize: "14px",
                        padding: "18px",
                        background: "#020617"
                      }}
                    >
                      {msg.text}
                    </SyntaxHighlighter>

                  </div>

                ) : (

                  <div
                    style={{
                      background: "#1e293b",
                      padding: "16px 20px",
                      borderRadius: "16px",
                      maxWidth: "75%",
                      lineHeight: "1.6",
                      fontSize: "15px",
                      color: "#e2e8f0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                    }}
                  >

                    {
  msg.text.includes("```") ? (

    <div>

      {
        msg.text.split("```").map((part, i) => {

          // CODE BLOCK
          if (i % 2 === 1) {

            return (
              
              <div
  style={{
    position: "relative"
  }}
>

  <button

  onClick={() => {

    const cleanCode = part
      .replace(/^javascript\s*/, "")
      .replace(/^js\s*/, "")
      .replace(/^python\s*/, "");

    navigator.clipboard.writeText(cleanCode);

    setCopiedIndex(i);

    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  }}

  style={{
    position: "absolute",
    top: "10px",
    right: "10px",
    background: copiedIndex === i
      ? "#16a34a"
      : "#2563eb",

    border: "none",
    color: "white",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    zIndex: 10,

    display: "flex",
    alignItems: "center",
    gap: "6px"
  }}
>

  {
    copiedIndex === i
      ? <Check size={14} />
      : <Copy size={14} />
  }

  {
    copiedIndex === i
      ? "Copied!"
      : "Copy"
  }

</button>

              <SyntaxHighlighter
                key={i}
                language="javascript"
                style={oneDark}
                customStyle={{
                  borderRadius: "12px",
                  marginTop: "12px",
                  marginBottom: "12px",
                  padding: "18px"
                }}
              >
                {
  part
    .replace(/^javascript\s*/, "")
    .replace(/^js\s*/, "")
    .replace(/^python\s*/, "")
}
              </SyntaxHighlighter>

              </div>
            );
          }

          // NORMAL TEXT
          return (

            <div
              key={i}
              dangerouslySetInnerHTML={{
                __html: formatResponse(part)
              }}
            />
          );
        })
      }

    </div>

  ) : (

    <div
      dangerouslySetInnerHTML={{
        __html: formatResponse(msg.text)
      }}
    />

  )
}

                  </div>
                )
              )
            }

          </div>
        ))}

        {
          loading && (

            <div
              style={{
                color: "#94a3b8",
                marginTop: "10px",
                fontSize: "14px"
              }}
            >
              AI is thinking...
            </div>
          )
        }

      </div>


      {/* INPUT AREA */}

      <div>

  <label
  style={{
    display: "inline-block",
    background: "#2563eb",
    color: "white",
    padding: "10px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    marginBottom: "12px",
    fontWeight: "600",
    fontSize: "14px"
  }}
>
  Upload File

  <input
    type="file"
    onChange={handleFileUpload}
    hidden
  />
</label>
{
  uploadedFile && (

    <div
      style={{
        background: "#1e293b",
        padding: "12px 16px",
        borderRadius: "12px",
        marginBottom: "14px",
        color: "white",
        fontSize: "14px"
      }}
    >
      📄 {uploadedFile}
    </div>
  )
}

  <div
    style={{
      display: "flex",
      gap: "10px"
    }}
  >

        <input
          type="text"
          value={query}
          placeholder="Ask your AI assistant..."
          onChange={(e) => setQuery(e.target.value)}

          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}

          style={{
            flex: 1,
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "white",
            fontSize: "15px",
            outline: "none"
          }}
        />

        <button
          onClick={sendMessage}

          style={{
            background: "#2563eb",
            border: "none",
            color: "white",
            padding: "16px 24px",
            borderRadius: "14px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "15px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)"
          }}
        >
          Send
        </button>

      </div>

    </div>

     </div>
  );
}

export default App;