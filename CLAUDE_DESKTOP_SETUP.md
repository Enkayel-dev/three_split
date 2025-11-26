# Claude Desktop Configuration for Three Split MCP Server

## Problem
Claude Desktop doesn't see the MCP server because it's not configured in the Claude Desktop config file.

## Solution

### Step 1: Locate Your Claude Desktop Config File

On Windows, the config file is located at:
```
%APPDATA%\Claude\claude_desktop_config.json
```

To open this location:
1. Press `Win + R`
2. Type: `%APPDATA%\Claude`
3. Press Enter
4. Look for `claude_desktop_config.json` (create it if it doesn't exist)

### Step 2: Add MCP Server Configuration

Open `claude_desktop_config.json` in a text editor and add this configuration:

```json
{
  "mcpServers": {
    "three-split-mcp-server": {
      "command": "node",
      "args": [
        "E:\\Repositories\\Active\\three_split\\three_split\\mcp-server\\dist\\index.js"
      ],
      "env": {
        "SCENE_WS_URL": "ws://localhost:3001"
      }
    }
  }
}
```

**Important**: Replace `E:\\Repositories\\Active\\three_split\\three_split` with your actual path if different.

Note the double backslashes (`\\`) - this is required in JSON files on Windows.

### Step 3: Restart Claude Desktop

1. Completely quit Claude Desktop (not just close the window)
2. Start Claude Desktop again
3. The MCP server should now be available

### Step 4: Verify Connection

After restarting Claude Desktop and running `start.bat`:

1. Open Claude Desktop
2. Look for the MCP server indicator (usually shown as a tools icon or server connection)
3. Try asking Claude: "What tools do you have available?"
4. You should see tools like:
   - `scene_snapshot`
   - `create_object`
   - `get_registered_objects`
   - `set_material`
   - `trigger_animation`
   - etc.

## Troubleshooting

### If MCP Server Still Not Visible:

1. **Check the path**: Make sure the path to `index.js` is correct and uses double backslashes
2. **Check the build**: Run `npm run build` in the `mcp-server` folder to ensure `dist/index.js` exists
3. **Check Claude Desktop logs**:
   - On Windows: `%APPDATA%\Claude\logs`
   - Look for MCP-related errors
4. **Verify servers are running**: After running `start.bat`, check that all 3 CMD windows opened (even if minimized)

### Common Issues:

**Issue**: "Cannot find module"
- **Solution**: Run `npm run build` in the `mcp-server` directory

**Issue**: "WebSocket connection failed"
- **Solution**: Make sure the relay server is running on port 3001 (started by `start.bat`)

**Issue**: Config file changes not taking effect
- **Solution**: Completely quit Claude Desktop (check Task Manager to ensure it's not still running)

### Testing the Full System:

Once everything is configured:

1. Run `start.bat`
2. Wait for all servers to start (you should see 3 CMD windows)
3. Open http://localhost:5173 in your browser
4. Open Claude Desktop
5. Ask Claude: "Use the scene_snapshot tool to show me the current 3D scene"

If this works, you're all set! 🎉

## Expected Result

When properly configured, Claude Desktop will have access to all MCP tools and can:
- View the current 3D scene state
- Create new 3D objects in real-time
- Modify materials and animations
- Control the camera navigation
- Interact with registered scene objects

## Need Help?

If you're still having issues:
1. Check the logs in the `logs/` directory
2. Look for error messages in the CMD windows
3. Verify all dependencies are installed (`npm install` in both root and `mcp-server` directories)
