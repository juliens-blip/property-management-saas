# 🚀 Quick Start Guide - Airtable MCP Server

## Prerequisites

### 1. Install Python

**Download Python 3.10 or higher:**
- Go to: https://www.python.org/downloads/
- Download the latest version for Windows
- **IMPORTANT:** Check "Add Python to PATH" during installation

**Verify installation:**
```bash
python --version
# Should show: Python 3.10.x or higher
```

## Installation (3 Steps)

### Step 1: Run Installation Script

**Option A - Automated (Windows):**
```bash
# Navigate to the server directory
cd mcp\airtable-server

# Run installation script
install.bat
```

**Option B - Manual:**
```bash
# Navigate to the server directory
cd mcp\airtable-server

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Configure API Token

The `.env` file already contains your API token. Verify it:

```bash
# Open .env in notepad
notepad .env
```

Should contain:
```
AIRTABLE_API_TOKEN=your_airtable_token_here
AIRTABLE_BASE_ID=your_base_id_here
```

### Step 3: Test the Server

```bash
# Make sure virtual environment is activated
venv\Scripts\activate

# Run the server
python main.py
```

**Expected output:**
```
INFO - Starting Airtable MCP Server...
INFO - Base ID: appmujqM67OAxGBby
INFO - Rate limit: 5 req/sec
INFO - Tables: TENANTS, TICKETS, RESIDENCES, MESSAGES, PROFESSIONALS
```

Press `Ctrl+C` to stop the server.

---

## 🔗 Claude Desktop Integration

### Step 1: Locate Claude Desktop Config

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Mac:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Step 2: Add Server Configuration

Open the config file and add (or merge with existing `mcpServers`):

```json
{
  "mcpServers": {
    "airtable-residconnect": {
      "command": "C:\\Users\\beatr\\Documents\\property-management-saas\\mcp\\airtable-server\\venv\\Scripts\\python.exe",
      "args": [
        "C:\\Users\\beatr\\Documents\\property-management-saas\\mcp\\airtable-server\\main.py"
      ],
      "env": {
        "AIRTABLE_API_TOKEN": "your_airtable_token_here",
        "AIRTABLE_BASE_ID": "your_base_id_here"
      }
    }
  }
}
```

**Note:** You can also copy from `claude_desktop_config.json` in this directory.

### Step 3: Restart Claude Desktop

1. Close Claude Desktop completely
2. Reopen Claude Desktop
3. Open a new conversation
4. The Airtable tools should now be available!

### Step 4: Test Integration

In Claude Desktop, try:
```
List all tickets from the TICKETS table
```

Claude should use the `list_records` tool to fetch tickets from Airtable!

---

## 📚 Usage Examples

### List Records
```
Show me all tenants
```
Uses: `list_records` with table=TENANTS

### Search Records
```
Find all open tickets with high priority
```
Uses: `search_records` with filter_formula

### Get Specific Record
```
Get ticket details for record recXXXXXXXXXXXXXX
```
Uses: `get_record` with record_id

### Create Record
```
Create a new ticket:
- Title: Fuite d'eau
- Category: plomberie
- Priority: high
- Status: open
```
Uses: `create_record` with fields

### Update Record
```
Update ticket recXXXXXXXXXXXXXX to status "resolved"
```
Uses: `update_record` with fields

---

## 🛠️ Troubleshooting

### Python not found
**Solution:** Install Python from https://www.python.org/downloads/
- Check "Add Python to PATH" during installation
- Restart terminal after installation

### "No module named 'mcp'"
**Solution:** Install dependencies
```bash
venv\Scripts\activate
pip install -r requirements.txt
```

### "Unauthorized" error
**Solution:** Check API token in `.env`
- Token should start with "pat"
- Verify token has access to the base

### Claude Desktop not detecting server
**Solution:**
1. Check config file path is correct
2. Verify Python path in config (use absolute paths)
3. Restart Claude Desktop
4. Check Claude Desktop logs

### Server starts but tools not working
**Solution:**
1. Verify `.env` file exists and has correct token
2. Test server manually: `python main.py`
3. Check Airtable base ID is correct
4. Verify table names are spelled correctly

---

## 🎓 Next Steps

1. ✅ **Server Running** - Test with `python main.py`
2. ✅ **Claude Desktop Integrated** - Add to config file
3. ✅ **Test Tools** - Try listing records in Claude
4. 📖 **Read README.md** - Complete documentation
5. 🔧 **Customize** - Modify filters, add caching, etc.

---

## 📞 Quick Reference

### Start Server (Manual Test)
```bash
cd mcp\airtable-server
venv\Scripts\activate
python main.py
```

### Stop Server
Press `Ctrl+C`

### Update Dependencies
```bash
venv\Scripts\activate
pip install --upgrade -r requirements.txt
```

### View Logs
Logs are displayed in the console when running the server.

---

## ✅ Success Checklist

- [ ] Python 3.10+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file configured with API token
- [ ] Server starts without errors
- [ ] Claude Desktop config updated
- [ ] Claude Desktop restarted
- [ ] Tools available in Claude Desktop
- [ ] Successfully listed records from Airtable

---

**Need help?** Check README.md for detailed documentation and troubleshooting.

**Version:** 1.0.0
**Created:** 2025-11-26
