# Airtable MCP Server for ResidConnect

Model Context Protocol server providing complete CRUD operations for Airtable integration with ResidConnect property management platform.

## 🎯 Features

- ✅ **Complete CRUD operations** on all ResidConnect tables
- ✅ **Advanced search** with Airtable filter formulas
- ✅ **Rate limiting** (5 req/sec) to respect Airtable limits
- ✅ **Pydantic validation** for all inputs
- ✅ **Error handling** with detailed logging
- ✅ **Async/await** for optimal performance
- ✅ **Type hints** and docstrings throughout

## 📊 Supported Tables

| Table | Table ID | Description |
|-------|----------|-------------|
| **TENANTS** | `tbl18r4MzBthXlnth` | Tenant information |
| **TICKETS** | `tbl2qQrpJc4PC9yfk` | Maintenance tickets |
| **RESIDENCES** | `tblx32X9SAlBpeB3C` | Property residences |
| **MESSAGES** | `tblvQrZVzdAaxb7Kr` | Communication messages |
| **PROFESSIONALS** | `tblIcANCLun1lb2Ap` | Professional contacts |

## 🛠️ Available Tools

### 1. `list_records`
List records from a table with optional view and limit.

**Parameters:**
- `table` (required): Table name (TENANTS, TICKETS, etc.)
- `view` (optional): View name
- `max_records` (optional): Maximum records (1-100, default: 100)

**Example:**
```json
{
  "table": "TICKETS",
  "max_records": 50
}
```

### 2. `get_record`
Get a specific record by ID.

**Parameters:**
- `table` (required): Table name
- `record_id` (required): Airtable record ID (starts with "rec")

**Example:**
```json
{
  "table": "TENANTS",
  "record_id": "recXXXXXXXXXXXXXX"
}
```

### 3. `search_records`
Search records using Airtable filter formulas.

**Parameters:**
- `table` (required): Table name
- `filter_formula` (required): Airtable filter formula
- `max_records` (optional): Maximum records (default: 100)

**Example:**
```json
{
  "table": "TICKETS",
  "filter_formula": "{status}='open'",
  "max_records": 20
}
```

**Filter formula examples:**
- `{email}='user@example.com'`
- `{status}='open'`
- `AND({priority}='high', {status}='open')`
- `OR({category}='plomberie', {category}='électricité')`

### 4. `create_record`
Create a new record in a table.

**Parameters:**
- `table` (required): Table name
- `fields` (required): Record fields as key-value pairs

**Example:**
```json
{
  "table": "TICKETS",
  "fields": {
    "title": "Fuite d'eau",
    "description": "Fuite dans la salle de bain",
    "category": "plomberie",
    "status": "open",
    "priority": "high",
    "tenant_email": "tenant@example.com",
    "unit": "A101"
  }
}
```

### 5. `update_record`
Update an existing record.

**Parameters:**
- `table` (required): Table name
- `record_id` (required): Record ID to update
- `fields` (required): Fields to update

**Example:**
```json
{
  "table": "TICKETS",
  "record_id": "recXXXXXXXXXXXXXX",
  "fields": {
    "status": "in_progress",
    "assigned_to": "plumber@example.com"
  }
}
```

### 6. `delete_record`
Delete a record from a table.

**Parameters:**
- `table` (required): Table name
- `record_id` (required): Record ID to delete

**Example:**
```json
{
  "table": "TICKETS",
  "record_id": "recXXXXXXXXXXXXXX"
}
```

## 🚀 Installation

### Prerequisites
- Python 3.10 or higher
- pip (Python package manager)

### Step 1: Create Virtual Environment

**Windows:**
```bash
cd mcp\airtable-server
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd mcp/airtable-server
python -m venv venv
source venv/bin/activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your Airtable API token
# AIRTABLE_API_TOKEN=your_token_here
```

### Step 4: Test the Server

```bash
python main.py
```

The server should start and display:
```
Starting Airtable MCP Server...
Base ID: appmujqM67OAxGBby
Rate limit: 5 req/sec
Tables: TENANTS, TICKETS, RESIDENCES, MESSAGES, PROFESSIONALS
```

## 🔗 Integration with Claude Desktop

### Configuration File

Add to your Claude Desktop configuration:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "airtable-residconnect": {
      "command": "C:\\Users\\beatr\\Documents\\property-management-saas\\mcp\\airtable-server\\venv\\Scripts\\python.exe",
      "args": [
        "C:\\Users\\beatr\\Documents\\property-management-saas\\mcp\\airtable-server\\main.py"
      ],
      "env": {
        "AIRTABLE_API_TOKEN": "your_token_here",
        "AIRTABLE_BASE_ID": "appmujqM67OAxGBby"
      }
    }
  }
}
```

**Note:** Adjust paths based on your system.

### Verify Integration

1. Restart Claude Desktop
2. Open a new conversation
3. The Airtable MCP tools should be available

## 📝 Usage Examples

### List all open tickets
```
Use list_records with:
- table: TICKETS
- filter_formula: {status}='open'
```

### Find tenant by email
```
Use search_records with:
- table: TENANTS
- filter_formula: {email}='tenant@example.com'
```

### Create a new ticket
```
Use create_record with:
- table: TICKETS
- fields: {title, description, category, status, priority, tenant_email, unit}
```

### Update ticket status
```
Use update_record with:
- table: TICKETS
- record_id: recXXXXXXXXXXXXXX
- fields: {status: 'resolved'}
```

## 🔒 Security

- **Never commit `.env` file** - Contains sensitive API tokens
- **API token permissions** - Ensure token has appropriate access
- **Rate limiting** - Built-in 5 req/sec limit to respect Airtable
- **Input validation** - All inputs validated with Pydantic

## ⚠️ Limitations

- **Rate limits:** 5 requests/second (Airtable free tier)
- **Max records:** 100 per request (configurable)
- **Timeout:** 30 seconds per request (configurable)
- **Read-only fields:** Some fields (created_at, lookup formulas) are read-only

## 🐛 Troubleshooting

### Error: "Unauthorized"
- Check your `AIRTABLE_API_TOKEN` in `.env`
- Verify token has access to the base

### Error: "Rate limit exceeded"
- The server has built-in rate limiting
- Wait a few seconds and retry

### Error: "Record or table not found"
- Verify table name is correct (case-sensitive)
- Check record ID starts with "rec"

### Server not starting
- Ensure virtual environment is activated
- Check Python version: `python --version` (3.10+)
- Verify all dependencies installed: `pip list`

### Claude Desktop not detecting server
- Check config file path is correct
- Verify Python executable path in config
- Restart Claude Desktop after config changes
- Check logs in Claude Desktop

## 📚 Resources

- [Airtable API Documentation](https://airtable.com/developers/web/api)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [ResidConnect Project](../../../CLAUDE.md)

## 🔄 Updates & Maintenance

### Update dependencies
```bash
pip install --upgrade -r requirements.txt
```

### View logs
Logs are output to console with timestamps and levels (INFO, WARNING, ERROR).

## 📧 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Airtable API documentation
3. Check MCP protocol documentation

---

**Version:** 1.0.0
**Created:** 2025-11-26
**Author:** ResidConnect Team
**License:** MIT
