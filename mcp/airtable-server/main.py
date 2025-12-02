"""
Airtable MCP Server for ResidConnect

A Model Context Protocol server providing complete CRUD operations
for Airtable integration with ResidConnect property management platform.

Tables supported:
- TENANTS (tbl18r4MzBthXlnth)
- TICKETS (tbl2qQrpJc4PC9yfk)
- RESIDENCES (tblx32X9SAlBpeB3C)
- MESSAGES (tblvQrZVzdAaxb7Kr)
- PROFESSIONALS (tblIcANCLun1lb2Ap)
"""

import asyncio
import logging
import os
from typing import Any, Dict, List, Optional
from datetime import datetime

import httpx
from mcp.server import Server
from mcp.types import Tool, TextContent
from pydantic import BaseModel, Field, validator
from pydantic_settings import BaseSettings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("airtable-mcp")


# ============================================================================
# CONFIGURATION
# ============================================================================

class Settings(BaseSettings):
    """Airtable MCP Server configuration."""

    airtable_api_token: str = Field(..., description="Airtable API token")
    airtable_base_id: str = Field(
        default="appmujqM67OAxGBby",
        description="Airtable base ID"
    )
    airtable_api_url: str = Field(
        default="https://api.airtable.com/v0",
        description="Airtable API base URL"
    )
    rate_limit_per_sec: int = Field(
        default=5,
        ge=1,
        le=10,
        description="Rate limit (requests per second)"
    )
    request_timeout: int = Field(
        default=30,
        ge=5,
        le=120,
        description="Request timeout in seconds"
    )

    class Config:
        env_file = ".env"
        env_prefix = "AIRTABLE_"


settings = Settings()


# ============================================================================
# TABLE DEFINITIONS
# ============================================================================

TABLES = {
    "TENANTS": "tbl18r4MzBthXlnth",
    "TICKETS": "tbl2qQrpJc4PC9yfk",
    "RESIDENCES": "tblx32X9SAlBpeB3C",
    "MESSAGES": "tblvQrZVzdAaxb7Kr",
    "PROFESSIONALS": "tblIcANCLun1lb2Ap",
}


# ============================================================================
# PYDANTIC MODELS FOR VALIDATION
# ============================================================================

class ListRecordsInput(BaseModel):
    """Input for list_records tool."""
    table: str = Field(..., description="Table name (TENANTS, TICKETS, etc.)")
    view: Optional[str] = Field(None, description="View name (optional)")
    max_records: int = Field(default=100, ge=1, le=100, description="Max records to return")

    @validator("table")
    def validate_table(cls, v):
        if v not in TABLES:
            raise ValueError(f"Invalid table. Must be one of: {', '.join(TABLES.keys())}")
        return v


class GetRecordInput(BaseModel):
    """Input for get_record tool."""
    table: str = Field(..., description="Table name")
    record_id: str = Field(..., min_length=1, description="Airtable record ID (starts with 'rec')")

    @validator("table")
    def validate_table(cls, v):
        if v not in TABLES:
            raise ValueError(f"Invalid table. Must be one of: {', '.join(TABLES.keys())}")
        return v

    @validator("record_id")
    def validate_record_id(cls, v):
        if not v.startswith("rec"):
            raise ValueError("Record ID must start with 'rec'")
        return v


class SearchRecordsInput(BaseModel):
    """Input for search_records tool."""
    table: str = Field(..., description="Table name")
    filter_formula: str = Field(..., min_length=1, description="Airtable filter formula")
    max_records: int = Field(default=100, ge=1, le=100)

    @validator("table")
    def validate_table(cls, v):
        if v not in TABLES:
            raise ValueError(f"Invalid table. Must be one of: {', '.join(TABLES.keys())}")
        return v


class CreateRecordInput(BaseModel):
    """Input for create_record tool."""
    table: str = Field(..., description="Table name")
    fields: Dict[str, Any] = Field(..., description="Record fields as JSON object")

    @validator("table")
    def validate_table(cls, v):
        if v not in TABLES:
            raise ValueError(f"Invalid table. Must be one of: {', '.join(TABLES.keys())}")
        return v


class UpdateRecordInput(BaseModel):
    """Input for update_record tool."""
    table: str = Field(..., description="Table name")
    record_id: str = Field(..., description="Record ID")
    fields: Dict[str, Any] = Field(..., description="Fields to update")

    @validator("table")
    def validate_table(cls, v):
        if v not in TABLES:
            raise ValueError(f"Invalid table. Must be one of: {', '.join(TABLES.keys())}")
        return v

    @validator("record_id")
    def validate_record_id(cls, v):
        if not v.startswith("rec"):
            raise ValueError("Record ID must start with 'rec'")
        return v


class DeleteRecordInput(BaseModel):
    """Input for delete_record tool."""
    table: str = Field(..., description="Table name")
    record_id: str = Field(..., description="Record ID")

    @validator("table")
    def validate_table(cls, v):
        if v not in TABLES:
            raise ValueError(f"Invalid table. Must be one of: {', '.join(TABLES.keys())}")
        return v

    @validator("record_id")
    def validate_record_id(cls, v):
        if not v.startswith("rec"):
            raise ValueError("Record ID must start with 'rec'")
        return v


# ============================================================================
# AIRTABLE CLIENT
# ============================================================================

class AirtableClient:
    """Async Airtable API client with rate limiting and error handling."""

    def __init__(self):
        self.base_url = f"{settings.airtable_api_url}/{settings.airtable_base_id}"
        self.headers = {
            "Authorization": f"Bearer {settings.airtable_api_token}",
            "Content-Type": "application/json"
        }
        self.semaphore = asyncio.Semaphore(settings.rate_limit_per_sec)
        self.last_request_time = 0

    async def _rate_limit(self):
        """Implement rate limiting."""
        async with self.semaphore:
            # Ensure minimum time between requests
            current_time = asyncio.get_event_loop().time()
            time_since_last = current_time - self.last_request_time
            min_interval = 1.0 / settings.rate_limit_per_sec

            if time_since_last < min_interval:
                await asyncio.sleep(min_interval - time_since_last)

            self.last_request_time = asyncio.get_event_loop().time()

    async def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Make HTTP request with rate limiting and error handling."""
        await self._rate_limit()

        url = f"{self.base_url}/{endpoint}"

        try:
            async with httpx.AsyncClient(timeout=settings.request_timeout) as client:
                response = await client.request(
                    method,
                    url,
                    headers=self.headers,
                    **kwargs
                )
                response.raise_for_status()
                return response.json()

        except httpx.TimeoutException as e:
            logger.error(f"Request timeout: {url}")
            raise TimeoutError(f"Request timed out after {settings.request_timeout}s")

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error {e.response.status_code}: {e.response.text}")

            if e.response.status_code == 429:
                raise Exception("Rate limit exceeded. Please wait before retrying.")
            elif e.response.status_code == 401:
                raise Exception("Unauthorized. Check your Airtable API token.")
            elif e.response.status_code == 404:
                raise Exception("Record or table not found.")
            else:
                raise Exception(f"Airtable API error: {e.response.text}")

        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise

    async def list_records(
        self,
        table_id: str,
        view: Optional[str] = None,
        max_records: int = 100
    ) -> List[Dict[str, Any]]:
        """List records from a table."""
        params = {"maxRecords": max_records}
        if view:
            params["view"] = view

        data = await self._request("GET", table_id, params=params)
        return data.get("records", [])

    async def get_record(self, table_id: str, record_id: str) -> Dict[str, Any]:
        """Get a single record by ID."""
        data = await self._request("GET", f"{table_id}/{record_id}")
        return data

    async def search_records(
        self,
        table_id: str,
        filter_formula: str,
        max_records: int = 100
    ) -> List[Dict[str, Any]]:
        """Search records using Airtable filter formula."""
        params = {
            "filterByFormula": filter_formula,
            "maxRecords": max_records
        }

        data = await self._request("GET", table_id, params=params)
        return data.get("records", [])

    async def create_record(
        self,
        table_id: str,
        fields: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a new record."""
        json_data = {"fields": fields}
        data = await self._request("POST", table_id, json=json_data)
        return data

    async def update_record(
        self,
        table_id: str,
        record_id: str,
        fields: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update an existing record."""
        json_data = {"fields": fields}
        data = await self._request("PATCH", f"{table_id}/{record_id}", json=json_data)
        return data

    async def delete_record(self, table_id: str, record_id: str) -> Dict[str, Any]:
        """Delete a record."""
        data = await self._request("DELETE", f"{table_id}/{record_id}")
        return data


# ============================================================================
# MCP SERVER & TOOLS
# ============================================================================

# Initialize server and client
server = Server("airtable-mcp")
airtable = AirtableClient()


def format_record(record: Dict[str, Any]) -> str:
    """Format a record for display."""
    record_id = record.get("id", "N/A")
    fields = record.get("fields", {})
    created_time = record.get("createdTime", "N/A")

    lines = [
        f"Record ID: {record_id}",
        f"Created: {created_time}",
        "Fields:"
    ]

    for key, value in fields.items():
        lines.append(f"  • {key}: {value}")

    return "\n".join(lines)


def format_records(records: List[Dict[str, Any]]) -> str:
    """Format multiple records for display."""
    if not records:
        return "No records found."

    lines = [f"Found {len(records)} record(s):\n"]

    for i, record in enumerate(records, 1):
        lines.append(f"--- Record {i} ---")
        lines.append(format_record(record))
        lines.append("")

    return "\n".join(lines)


@server.list_tools()
async def list_tools() -> List[Tool]:
    """List available MCP tools."""
    return [
        Tool(
            name="list_records",
            description="List records from an Airtable table with optional view and limit",
            inputSchema={
                "type": "object",
                "properties": {
                    "table": {
                        "type": "string",
                        "description": "Table name (TENANTS, TICKETS, RESIDENCES, MESSAGES, PROFESSIONALS)",
                        "enum": list(TABLES.keys())
                    },
                    "view": {
                        "type": "string",
                        "description": "Optional view name"
                    },
                    "max_records": {
                        "type": "integer",
                        "description": "Maximum number of records (1-100)",
                        "default": 100,
                        "minimum": 1,
                        "maximum": 100
                    }
                },
                "required": ["table"]
            }
        ),
        Tool(
            name="get_record",
            description="Get a specific record by ID from an Airtable table",
            inputSchema={
                "type": "object",
                "properties": {
                    "table": {
                        "type": "string",
                        "description": "Table name",
                        "enum": list(TABLES.keys())
                    },
                    "record_id": {
                        "type": "string",
                        "description": "Airtable record ID (starts with 'rec')"
                    }
                },
                "required": ["table", "record_id"]
            }
        ),
        Tool(
            name="search_records",
            description="Search records using Airtable filter formula (e.g., \"{email}='test@example.com'\")",
            inputSchema={
                "type": "object",
                "properties": {
                    "table": {
                        "type": "string",
                        "description": "Table name",
                        "enum": list(TABLES.keys())
                    },
                    "filter_formula": {
                        "type": "string",
                        "description": "Airtable filter formula (use field names in curly braces)"
                    },
                    "max_records": {
                        "type": "integer",
                        "description": "Maximum records to return",
                        "default": 100,
                        "minimum": 1,
                        "maximum": 100
                    }
                },
                "required": ["table", "filter_formula"]
            }
        ),
        Tool(
            name="create_record",
            description="Create a new record in an Airtable table",
            inputSchema={
                "type": "object",
                "properties": {
                    "table": {
                        "type": "string",
                        "description": "Table name",
                        "enum": list(TABLES.keys())
                    },
                    "fields": {
                        "type": "object",
                        "description": "Record fields as key-value pairs"
                    }
                },
                "required": ["table", "fields"]
            }
        ),
        Tool(
            name="update_record",
            description="Update an existing record in an Airtable table",
            inputSchema={
                "type": "object",
                "properties": {
                    "table": {
                        "type": "string",
                        "description": "Table name",
                        "enum": list(TABLES.keys())
                    },
                    "record_id": {
                        "type": "string",
                        "description": "Record ID to update"
                    },
                    "fields": {
                        "type": "object",
                        "description": "Fields to update"
                    }
                },
                "required": ["table", "record_id", "fields"]
            }
        ),
        Tool(
            name="delete_record",
            description="Delete a record from an Airtable table",
            inputSchema={
                "type": "object",
                "properties": {
                    "table": {
                        "type": "string",
                        "description": "Table name",
                        "enum": list(TABLES.keys())
                    },
                    "record_id": {
                        "type": "string",
                        "description": "Record ID to delete"
                    }
                },
                "required": ["table", "record_id"]
            }
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: Any) -> List[TextContent]:
    """Handle tool calls."""
    try:
        if name == "list_records":
            # Validate input
            input_data = ListRecordsInput(**arguments)
            table_id = TABLES[input_data.table]

            logger.info(f"Listing records from {input_data.table} (max: {input_data.max_records})")

            # Fetch records
            records = await airtable.list_records(
                table_id,
                view=input_data.view,
                max_records=input_data.max_records
            )

            result = format_records(records)
            return [TextContent(type="text", text=result)]

        elif name == "get_record":
            # Validate input
            input_data = GetRecordInput(**arguments)
            table_id = TABLES[input_data.table]

            logger.info(f"Getting record {input_data.record_id} from {input_data.table}")

            # Fetch record
            record = await airtable.get_record(table_id, input_data.record_id)

            result = format_record(record)
            return [TextContent(type="text", text=result)]

        elif name == "search_records":
            # Validate input
            input_data = SearchRecordsInput(**arguments)
            table_id = TABLES[input_data.table]

            logger.info(f"Searching {input_data.table} with formula: {input_data.filter_formula}")

            # Search records
            records = await airtable.search_records(
                table_id,
                input_data.filter_formula,
                max_records=input_data.max_records
            )

            result = format_records(records)
            return [TextContent(type="text", text=result)]

        elif name == "create_record":
            # Validate input
            input_data = CreateRecordInput(**arguments)
            table_id = TABLES[input_data.table]

            logger.info(f"Creating record in {input_data.table}")

            # Create record
            record = await airtable.create_record(table_id, input_data.fields)

            result = f"✅ Record created successfully!\n\n{format_record(record)}"
            return [TextContent(type="text", text=result)]

        elif name == "update_record":
            # Validate input
            input_data = UpdateRecordInput(**arguments)
            table_id = TABLES[input_data.table]

            logger.info(f"Updating record {input_data.record_id} in {input_data.table}")

            # Update record
            record = await airtable.update_record(
                table_id,
                input_data.record_id,
                input_data.fields
            )

            result = f"✅ Record updated successfully!\n\n{format_record(record)}"
            return [TextContent(type="text", text=result)]

        elif name == "delete_record":
            # Validate input
            input_data = DeleteRecordInput(**arguments)
            table_id = TABLES[input_data.table]

            logger.info(f"Deleting record {input_data.record_id} from {input_data.table}")

            # Delete record
            result_data = await airtable.delete_record(table_id, input_data.record_id)

            deleted_id = result_data.get("id", "Unknown")
            result = f"✅ Record deleted successfully!\nDeleted ID: {deleted_id}"
            return [TextContent(type="text", text=result)]

        else:
            raise ValueError(f"Unknown tool: {name}")

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return [TextContent(type="text", text=f"❌ Validation error: {str(e)}")]

    except TimeoutError as e:
        logger.error(f"Timeout: {e}")
        return [TextContent(type="text", text=f"❌ Timeout: {str(e)}")]

    except Exception as e:
        logger.error(f"Error in {name}: {e}", exc_info=True)
        return [TextContent(type="text", text=f"❌ Error: {str(e)}")]


# ============================================================================
# MAIN
# ============================================================================

async def main():
    """Run the MCP server."""
    logger.info("Starting Airtable MCP Server...")
    logger.info(f"Base ID: {settings.airtable_base_id}")
    logger.info(f"Rate limit: {settings.rate_limit_per_sec} req/sec")
    logger.info(f"Tables: {', '.join(TABLES.keys())}")

    from mcp.server.stdio import stdio_server

    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )


if __name__ == "__main__":
    asyncio.run(main())
