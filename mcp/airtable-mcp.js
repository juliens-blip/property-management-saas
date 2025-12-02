#!/usr/bin/env node

/**
 * MCP Server pour Airtable - ResidConnect
 * Protocole MCP Standard - Compatible avec Claude Code
 */

const https = require('https');
const readline = require('readline');

// Configuration Airtable depuis les variables d'environnement
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

const TABLES = {
  TENANTS: process.env.AIRTABLE_TABLE_TENANTS,
  TICKETS: process.env.AIRTABLE_TABLE_TICKETS,
  RESIDENCES: process.env.AIRTABLE_TABLE_RESIDENCES,
  MESSAGES: process.env.AIRTABLE_TABLE_MESSAGES,
  PROFESSIONALS: process.env.AIRTABLE_TABLE_PROFESSIONALS || 'tblIcANCLun1lb2Ap',
};

// Validation de la configuration
if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  process.stderr.write('ERROR: AIRTABLE_API_KEY and AIRTABLE_BASE_ID are required\n');
  process.exit(1);
}

// Fonction pour faire des requêtes HTTP à l'API Airtable
function airtableRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${AIRTABLE_BASE_ID}${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Airtable API Error ${res.statusCode}: ${parsed.error?.message || data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Définition des outils MCP
const tools = [
  {
    name: 'list_records',
    description: 'List all records from an Airtable table. Returns up to maxRecords records.',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Table name to list records from',
          enum: ['TENANTS', 'TICKETS', 'RESIDENCES', 'MESSAGES', 'PROFESSIONALS'],
        },
        maxRecords: {
          type: 'number',
          description: 'Maximum number of records to return (default: 100, max: 100)',
          default: 100,
        },
        view: {
          type: 'string',
          description: 'Optional: Name of a view to use',
        },
      },
      required: ['table'],
    },
  },
  {
    name: 'get_record',
    description: 'Get a specific record by ID from an Airtable table',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Table name',
          enum: ['TENANTS', 'TICKETS', 'RESIDENCES', 'MESSAGES', 'PROFESSIONALS'],
        },
        recordId: {
          type: 'string',
          description: 'Airtable record ID (starts with "rec")',
        },
      },
      required: ['table', 'recordId'],
    },
  },
  {
    name: 'search_records',
    description: 'Search records using Airtable filter formula. Example: "{email}=\'test@example.com\'"',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Table name to search in',
          enum: ['TENANTS', 'TICKETS', 'RESIDENCES', 'MESSAGES', 'PROFESSIONALS'],
        },
        filterFormula: {
          type: 'string',
          description: 'Airtable filter formula. Use field names in curly braces.',
        },
        maxRecords: {
          type: 'number',
          description: 'Maximum number of records to return',
          default: 100,
        },
      },
      required: ['table', 'filterFormula'],
    },
  },
  {
    name: 'create_record',
    description: 'Create a new record in an Airtable table',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Table name',
          enum: ['TENANTS', 'TICKETS', 'RESIDENCES', 'MESSAGES', 'PROFESSIONALS'],
        },
        fields: {
          type: 'object',
          description: 'Object containing field names and values for the new record',
        },
      },
      required: ['table', 'fields'],
    },
  },
  {
    name: 'update_record',
    description: 'Update an existing record in an Airtable table',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Table name',
          enum: ['TENANTS', 'TICKETS', 'RESIDENCES', 'MESSAGES', 'PROFESSIONALS'],
        },
        recordId: {
          type: 'string',
          description: 'Airtable record ID to update',
        },
        fields: {
          type: 'object',
          description: 'Object containing field names and new values',
        },
      },
      required: ['table', 'recordId', 'fields'],
    },
  },
  {
    name: 'delete_record',
    description: 'Delete a record from an Airtable table',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Table name',
          enum: ['TENANTS', 'TICKETS', 'RESIDENCES', 'MESSAGES', 'PROFESSIONALS'],
        },
        recordId: {
          type: 'string',
          description: 'Airtable record ID to delete',
        },
      },
      required: ['table', 'recordId'],
    },
  },
];

// Handler pour les appels d'outils
async function handleToolCall(name, args) {
  const tableId = TABLES[args.table];

  if (!tableId) {
    throw new Error(`Unknown table: ${args.table}. Available: ${Object.keys(TABLES).join(', ')}`);
  }

  switch (name) {
    case 'list_records': {
      const maxRecords = args.maxRecords || 100;
      let path = `/${tableId}?maxRecords=${maxRecords}`;

      if (args.view) {
        path += `&view=${encodeURIComponent(args.view)}`;
      }

      const data = await airtableRequest(path);
      return {
        content: [
          {
            type: 'text',
            text: `Found ${data.records.length} records in ${args.table}:\n\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    }

    case 'get_record': {
      const path = `/${tableId}/${args.recordId}`;
      const data = await airtableRequest(path);
      return {
        content: [
          {
            type: 'text',
            text: `Record ${args.recordId} from ${args.table}:\n\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    }

    case 'search_records': {
      const encodedFormula = encodeURIComponent(args.filterFormula);
      const maxRecords = args.maxRecords || 100;
      const path = `/${tableId}?filterByFormula=${encodedFormula}&maxRecords=${maxRecords}`;
      const data = await airtableRequest(path);
      return {
        content: [
          {
            type: 'text',
            text: `Search results in ${args.table} (filter: ${args.filterFormula}):\n\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    }

    case 'create_record': {
      const path = `/${tableId}`;
      const body = { fields: args.fields };
      const data = await airtableRequest(path, 'POST', body);
      return {
        content: [
          {
            type: 'text',
            text: `Created record in ${args.table}:\n\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    }

    case 'update_record': {
      const path = `/${tableId}/${args.recordId}`;
      const body = { fields: args.fields };
      const data = await airtableRequest(path, 'PATCH', body);
      return {
        content: [
          {
            type: 'text',
            text: `Updated record ${args.recordId} in ${args.table}:\n\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    }

    case 'delete_record': {
      const path = `/${tableId}/${args.recordId}`;
      const data = await airtableRequest(path, 'DELETE');
      return {
        content: [
          {
            type: 'text',
            text: `Deleted record ${args.recordId} from ${args.table}:\n\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Fonction pour envoyer une réponse JSON-RPC
function sendResponse(id, result) {
  const response = {
    jsonrpc: '2.0',
    id: id,
    result: result,
  };
  console.log(JSON.stringify(response));
}

// Fonction pour envoyer une erreur JSON-RPC
function sendError(id, code, message) {
  const response = {
    jsonrpc: '2.0',
    id: id,
    error: {
      code: code,
      message: message,
    },
  };
  console.log(JSON.stringify(response));
}

// Traitement des messages MCP
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', async (line) => {
  try {
    const message = JSON.parse(line);

    // Handle initialize
    if (message.method === 'initialize') {
      sendResponse(message.id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'airtable-mcp-resid-connect',
          version: '1.0.0',
        },
      });
      return;
    }

    // Handle tools/list
    if (message.method === 'tools/list') {
      sendResponse(message.id, { tools: tools });
      return;
    }

    // Handle tools/call
    if (message.method === 'tools/call') {
      try {
        const { name, arguments: args } = message.params;
        const result = await handleToolCall(name, args);
        sendResponse(message.id, result);
      } catch (error) {
        sendError(message.id, -32603, error.message);
      }
      return;
    }

    // Handle notifications/initialized
    if (message.method === 'notifications/initialized') {
      // No response needed for notifications
      return;
    }

    // Unknown method
    sendError(message.id, -32601, `Method not found: ${message.method}`);

  } catch (error) {
    process.stderr.write(`Error processing message: ${error.message}\n`);
    sendError(null, -32700, 'Parse error');
  }
});

rl.on('close', () => {
  process.exit(0);
});

// Signal que le serveur est prêt
process.stderr.write('✓ Airtable MCP Server ready\n');
process.stderr.write(`  Tables: ${Object.keys(TABLES).join(', ')}\n`);
process.stderr.write(`  Base ID: ${AIRTABLE_BASE_ID}\n`);
