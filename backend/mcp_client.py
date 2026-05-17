import subprocess

def start_mcp_server():
    process = subprocess.Popen(
        ["py", "../mcp_server/server.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    return process