from mcp.server.fastmcp import FastMCP
import os

mcp = FastMCP("SystemAssistant")

@mcp.tool()
def list_files():

    return os.listdir("../")


@mcp.tool()
def current_directory():

    return os.getcwd()


@mcp.tool()
def create_folder(folder_name: str):

    os.makedirs(f"../{folder_name}", exist_ok=True)

    return f"{folder_name} folder created"


if __name__ == "__main__":
    mcp.run()