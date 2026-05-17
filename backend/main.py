from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv
from fastapi import UploadFile, File
import os

uploaded_file_content = ""

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq Client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# ---------------- MEMORY ---------------- #

conversation_history = [

    {
        "role": "system",
        "content": """
        You are an MCP AI Coding Assistant.

        You help users:
        - explore files
        - read code
        - explain code
        - summarize projects
        - answer programming questions

        Be concise and helpful.
        """
    }
]

# ---------------- TOOLS ---------------- #

def list_files():

    return os.listdir("../")


def current_directory():

    return os.getcwd()


def create_folder(folder_name):

    os.makedirs(f"../{folder_name}", exist_ok=True)

    return f"{folder_name} folder created"


def read_file(file_name):

    possible_paths = [
        f"../backend/{file_name}",
        f"../frontend/src/{file_name}",
        f"../mcp_server/{file_name}"
    ]

    for path in possible_paths:

        if os.path.exists(path):

            with open(path, "r", encoding="utf-8") as file:

                return file.read()

    return None


def explain_code(file_name):

    code = read_file(file_name)

    if not code:

        return "File not found"

    explanation = client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[

            {
    "role": "system",
    "content": """
    You are an expert AI coding assistant and teacher.

    Your job is to explain code professionally and clearly.

    IMPORTANT RULES:

    1. Explain concepts FIRST before showing code.

    2. NEVER dump the entire file unless explicitly requested.

    3. Show ONLY small relevant code snippets.

    4. Keep explanations concise, structured, and beginner-friendly.

    5. Use the following format:

    Purpose of the Code:
    - Explain overall purpose briefly.

    Important Functions:
    - Explain only key functions.

    Overall Workflow:
    - Explain step-by-step logic.

    Beginner-Friendly Explanation:
    - Explain in simple terms.

    Possible Improvements:
    - Suggest improvements professionally.

    6. If code examples are needed,
       wrap them inside triple backticks.

    7. Avoid unnecessary repetition.

    8. Focus more on understanding than code dumping.

    9. If the user asks about a specific function,
        ONLY explain that function.

        Do NOT explain the entire application.

        Focus only on:
        - purpose of the function
        - workflow of the function
        - important logic
        - beginner-friendly explanation
        - small relevant code snippets
    """
},

            {
                "role": "user",
                "content": f"""
                Explain this code:

                {code}
                """
            }
        ]
    )

    return (
        explanation
        .choices[0]
        .message
        .content
    )

def debug_code(code):

    response = client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[

            {
                "role": "system",
                "content": """
                You are an expert AI debugging assistant.

                Analyze the given code carefully.

                IMPORTANT:

                1. Identify bugs or mistakes.

                2. Explain WHY the issue happens.

                3. Provide corrected code.

                4. Keep explanations concise.

                5. Use this format:

                Issue:
                - Explain the bug

                Why It Happens:
                - Root cause

                Fixed Code:
                - Provide corrected code snippet

                Improvement Suggestions:
                - Optional improvements
                """
            },

            {
                "role": "user",
                "content": f"""
                Debug this code:

                {code}
                """
            }
        ]
    )

    return (
        response
        .choices[0]
        .message
        .content
    )

def fix_code(code):

    response = client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[

            {
                "role": "system",
                "content": """
                You are an expert AI code fixing assistant.

                Your job is to:
                - identify issues
                - correct bugs
                - optimize code
                - improve readability

                IMPORTANT:

                1. Return corrected code.

                2. Explain what was fixed.

                3. Keep explanations concise.

                4. Use this format:

                Issues Found:
                - Describe issue

                Corrected Code:
                ```language
                corrected code
                ```

                Explanation:
                - Explain fixes clearly
                """
            },

            {
                "role": "user",
                "content": f"""
                Fix this code:

                {code}
                """
            }
        ]
    )

    return (
        response
        .choices[0]
        .message
        .content
    )

def optimize_code(code):

    response = client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[

            {
                "role": "system",
                "content": """
                You are an expert AI code optimization assistant.

                Your task is to:
                - improve performance
                - improve readability
                - modernize syntax
                - simplify logic

                IMPORTANT:

                1. Return optimized code.

                2. Explain improvements clearly.

                3. Keep response concise.

                4. Use this format:

                Optimization Suggestions:
                - Explain improvements

                Optimized Code:
                ```language
                optimized code
                ```

                Benefits:
                - Explain why optimized version is better
                """
            },

            {
                "role": "user",
                "content": f"""
                Optimize this code:

                {code}
                """
            }
        ]
    )

    return (
        response
        .choices[0]
        .message
        .content
    )

def explain_uploaded_code(code):

    response = client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[

            {
                "role": "system",
                "content": """
                You are an expert AI coding assistant.

                Analyze uploaded code professionally.

                Explain:
                - purpose
                - important functions
                - workflow
                - improvements
                - beginner-friendly explanation
                """
            },

            {
                "role": "user",
                "content": code
            }
        ]
    )

    return (
        response
        .choices[0]
        .message
        .content
    )
# -------------------------------------- #


@app.get("/")
def home():

    return {
        "message": "Backend running successfully"
    }


@app.get("/chat")
def chat(query: str):

    try:

        # Save user message
        conversation_history.append(
            {
                "role": "user",
                "content": query
            }
        )

        # Intent Detection
        tool_response = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[

                {
                    "role": "system",
                    "content": """
                    Identify user intent.

                    Reply ONLY with:
                    - list_files
                    - current_directory
                    - create_folder:<foldername>
                    - read_file:<filename>
                    - explain_file:<filename>
                    - debug_code
                    - fix_code
                    - optimize_code
                    - normal

                    If user asks to:
                    - explain uploaded file
                    - explain the code in the file
                    - explain uploaded code
                    - analyze uploaded file
                    - analyze the code file

                    then reply with:
                    explain_file

                    If user asks to:
                    - debug code
                    - fix errors
                    - identify bugs
                    - solve coding issues

                    then reply with:
                    debug_code
                    
                    If user asks to:
                    - fix code
                    - correct code
                    - optimize code
                    - improve code

                    then reply with:
                    fix_code

                    If user asks to:
                    - optimize code
                    - improve performance
                    - refactor code
                    - improve readability

                    then reply with:
                    optimize_code 



                    """
                },

                {
                    "role": "user",
                    "content": query
                }
            ]
        )

        ai_decision = (
            tool_response
            .choices[0]
            .message
            .content
            .strip()
        )

        # ---------------- TOOLS ---------------- #

        # TOOL 1
        if ai_decision == "list_files":

            result = str(list_files())

            return {
                "type": "text",
                "response": result
            }

        # TOOL 2
        elif ai_decision == "current_directory":

            result = current_directory()

            return {
                "type": "text",
                "response": result
            }

        # TOOL 3
        elif ai_decision.startswith("create_folder:"):

            folder_name = ai_decision.replace(
                "create_folder:",
                ""
            ).strip()

            result = create_folder(folder_name)

            return {
                "type": "text",
                "response": result
            }

        # TOOL 4
        elif ai_decision.startswith("read_file:"):

            file_name = ai_decision.replace(
                "read_file:",
                ""
            ).strip()

            result = read_file(file_name)

            return {
                "type": "code",
                "response": result
            }

        # TOOL 5
        elif ai_decision == "explain_file":

            try:

                # CASE 1 → uploaded file
                if "uploaded file" in query.lower():

                    result = explain_uploaded_code(
                        uploaded_file_content
                    )

                else:

                    # CASE 2 → file from project folder

                    words = query.split()

                    file_name = None

                    for word in words:

                        if (
                            ".js" in word
                            or ".py" in word
                            or ".java" in word
                            or ".cpp" in word
                        ):

                            file_name = word
                            break

                    if not file_name:

                        return {
                            "type": "text",
                            "response": "No file name found."
                        }

                    with open(file_name, "r", encoding="utf-8") as f:

                        code = f.read()

                    result = explain_uploaded_code(code)

                return {
                    "type": "text",
                    "response": result
                }

            except Exception as e:

                return {
                    "type": "text",
                    "response": f"Error: {str(e)}"
                }
        # TOOL 6 — DEBUG CODE

        elif ai_decision == "debug_code":

            if "uploaded file" in query.lower():

                result = debug_code(
                    uploaded_file_content
                )

            else:

                result = debug_code(query)

            return {
                "type": "text",
                "response": result
            }

        # TOOL 7 — FIX CODE

        elif ai_decision == "fix_code":

            if "uploaded file" in query.lower():

                result = fix_code(
                    uploaded_file_content
                )

            else:

                result = fix_code(query)

            return {
                "type": "text",
                "response": result
            }

        # TOOL 8 — OPTIMIZE CODE

        elif ai_decision == "optimize_code":

            if "uploaded file" in query.lower():

                result = optimize_code(
                    uploaded_file_content
                )

            else:

                result = optimize_code(query)

            return {
                "type": "text",
                "response": result
            }
        # ---------------- NORMAL CHAT ---------------- #

        ai_response = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=conversation_history
        )

        final_response = (
            ai_response
            .choices[0]
            .message
            .content
        )

        conversation_history.append(
            {
                "role": "assistant",
                "content": final_response
            }
        )

        return {
            "type": "text",
            "response": final_response
        }

    except Exception as e:

        return {
            "type": "text",
            "response": str(e)
        }
    
@app.post("/upload")

async def upload_file(
    file: UploadFile = File(...)
):

    global uploaded_file_content

    content = await file.read()

    text = content.decode("utf-8")

    uploaded_file_content = text

    return {
        "response": f"{file.filename} uploaded successfully"
    }