# CLAUDE.md - ResidConnect SaaS

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ResidConnect is a property management SaaS application built with Next.js 14 and TypeScript. The platform connects tenants and property management professionals, providing features for news updates, maintenance requests, communication, and document management.

---

## 🔑 API CREDENTIALS & CONFIGURATION

### Airtable Integration
**⚠️ SECURITY NOTE**: Credentials are stored in `.env.local` - NEVER commit this file.

```
AIRTABLE_API_TOKEN=your_airtable_token_here
AIRTABLE_BASE_ID=appmujqM67OAxGBby
```

### Environment Variables Required
```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AIRTABLE_BASE_ID=appmujqM67OAxGBby

# Airtable (backend only)
AIRTABLE_API_TOKEN=your_airtable_token_here

# Email (optional)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=xxx
SMTP_PASS=xxx
```

---

## 📊 AIRTABLE SCHEMA REFERENCE

### Base Information
- **Base ID**: `appmujqM67OAxGBby`
- **Region**: US

### Table 1: TABLE_1 (GENERAL)
| Table ID | `tblWPgdjUAGeFz5YF` |
|----------|-------------------|
| **Field** | **Field ID** |
| Name | `fldHnwoqz9AJyQUs7` |
| Notes | `fld1HpDkFO29bF0P9` |
| Assignee | `fldKbqLUgSRYlJIcC` |
| Status | `fld8gkyUpTUAGisEa` |
| Attachments | `fld8JbGcy2KMLGL2f` |
| Attachment Summary | `fldgnZruMoqRvmipt` |

### Table 2: RESIDENCES
| Table ID | `tblx32X9SAlBpeB3C` |
|----------|-------------------|
| **Field** | **Field ID** | **Type** |
| name | `fldSlMmH9nIEOMd4K` | Text |
| address | `fldIM3LhtmNsOZfmS` | Long Text |
| agency_email | `fldyD0amh4QP5ZUTG` | Email |
| total_units | `fldSruKcnTtimCD39` | Number |
| created_at | `fldCezs14akLI82ot` | Date |
| TICKETS | `fldBirnOJrr1ivjUW` | Link to TICKETS |

### Table 3: TENANTS
| Table ID | `tbl18r4MzBthXlnth` |
|----------|-------------------|
| **Field** | **Field ID** | **Type** |
| email | `fldg4xlUQGWAMa1vq` | Email (Unique) |
| password_hash | `fld1BkzQo0EqKUMVM` | Text |
| unit | `fld9QHC92B3G3mEWn` | Text |
| phone | `fldV1nK2VzfncFWIa` | Phone |
| first_name | `fldCjf3UHzuXYax8B` | Text |
| last_name | `fldsGDRvealJ3yZdR` | Text |
| residence_name | `fldEKoG8PUyQLCC37` | Text |
| status | `fldK0XdnyBXTOkVfc` | Single Select (active/inactive) |
| created_at | `fldqd2KQ55XMKnF3R` | Date |
| TICKETS (link) | `fldoZAS0voQTlMBvx` | Link to TICKETS |

### Table 4: PROFESSIONALS
| Table ID | `tblIcANCLun1lb2Ap` |
|----------|-------------------|
| **Field** | **Field ID** | **Type** |
| email | `fldqgHmvZ7OFLCiBb` | Email (Unique) |
| password_hash | `fldk8Bk0F35G8I8jx` | Text |
| name | `fldLZ9GvZ3MvLNUyP` | Text |
| type | `fldNbHwBSYIaUON0b` | Single Select (plumber/electrician/concierge/agency) |
| phone | `fldRilhbZ3K92MnN8` | Phone |
| agency_email | `fldVubvDazWwArvo9` | Email |
| specialties | `fldNNWbU6lWIfx4Gt` | Text |
| created_at | `fldCZ6frTyuEBy0v3` | Date |

### Table 5: TICKETS
| Table ID | `tbl2qQrpJc4PC9yfk` |
|----------|-------------------|
| **Field** | **Field ID** | **Type** |
| title | `fld51ebPXV9129Tof` | Text |
| description | `fldSs15cz93JSy6zO` | Long Text |
| category | `fldx8DUYFYylqMyq1` | Single Select (plomberie/électricité/concierge/autre) |
| status | `fldT3OYmpscavHWgC` | Single Select (open/assigned/in_progress/resolved/closed) |
| priority | `fldx5UszT8duxQZyY` | Single Select (low/medium/high/urgent) |
| tenant_email | `fldZGRcdiXnoNS5OL` | Email |
| unit | `fldRj1kcmJSu4nQQ2` | Text |
| assigned_to | `fld3bfcdn71PUNPZI` | Text |
| name (lookup) | `fld1jLo386MlJgxZr` | Lookup Formula |
| created_at | `fldDIUilSLOXpLuec` | Date |
| updated_at | `fldwa2gEGI645x9FC` | Date |
| resolved_at | `flddYiLBPnCYtBClV` | Date |
| resolution_notes | `fldOWkLenvlefCm7Q` | Long Text |
| images_urls | `flduOSxLcMx3dXktM` | Text (comma-separated URLs) |

### Table 6: MESSAGES
| Table ID | `tblvQrZVzdAaxb7Kr` |
|----------|-------------------|
| **Field** | **Field ID** | **Type** |
| titre du message | `fldgHiPzTjNpqYOGW` | Text |
| message | `flddnEGi0vpj3tGR3` | Long Text |
| categorie | `fldpEomz71o8ClGvr` | Single Select (intervention/evenement/general) |
| TENANTS | `fldlmSdHe0ENnaA7Q` | Link to another record |
| PROFESSIONALS | `fldqIic59UdS0KdF1` | Link to another record |
| Date de création | `fldVALw6rlBn1yMae` | Created time |

---

## 🛣️ API ENDPOINTS REFERENCE

### Authentication Routes
```
POST /api/auth/login
  body: {email, password, role: "tenant" | "professional"}
  returns: {token, user: {id, email, role, ...}}

POST /api/auth/register
  body: {email, password, first_name, last_name, unit?, phone?}
  returns: {token, user}
```

### Tenant Routes
```
GET  /api/tenant/me
GET  /api/tenant/tickets
GET  /api/tenant/tickets/:id
POST /api/tenant/tickets
POST /api/tenant/tickets/:id/messages
```

### Professional Routes
```
GET  /api/professional/dashboard
GET  /api/professional/tickets
PATCH /api/professional/tickets/:id
POST /api/professional/tickets/:id/messages
```

### Agency Routes
```
GET  /api/agency/dashboard
GET  /api/agency/tickets
GET  /api/agency/tickets/:id
PATCH /api/agency/tickets/:id
GET  /api/agency/professionals
GET  /api/agency/analytics
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## Architecture

### Framework & Stack
- **Next.js 14** with App Router (not Pages Router)
- **TypeScript** with strict mode enabled
- **React 18** Server and Client Components
- **Airtable API v0** for data storage
- SEO optimization via Next.js metadata API

### Project Structure
```
app/
  layout.tsx           # Root layout with SEO metadata
  page.tsx             # Login landing page (Client Component)
  api/
    auth/
      login/route.ts   # Authentication endpoint
      register/route.ts
    tenant/
      route.ts         # Tenant endpoints
    professional/
      route.ts         # Professional endpoints
    agency/
      route.ts         # Agency endpoints
  tenant/
    dashboard/page.tsx # Tenant dashboard
    tickets/page.tsx   # Tenant tickets list
  professional/
    dashboard/page.tsx # Professional dashboard
  agency/
    dashboard/page.tsx # Agency dashboard
```

### Key Architectural Decisions

**App Router Pattern**: Uses Next.js App Router (Next.js 13+), not Pages Router. All routes in `app/` directory.

**Client vs Server Components**:
- `app/layout.tsx`: Server Component exporting metadata for SEO
- `app/page.tsx`: Client Component (`'use client'`) for interactive login

**Airtable Integration**:
- Uses Airtable REST API v0 (`/v0/{baseId}/{tableName}`)
- Table names can be used OR Table IDs (IDs are recommended for stability)
- Bearer token authentication in headers
- Fetch library for HTTP requests (Node.js native, no external dependency)

**TypeScript Paths**: `@/*` alias references root-level imports (configured in `tsconfig.json`)

---

## User Types & Authentication

The application supports two user types:

### Tenant
- Resides in a property unit
- Can create tickets for maintenance/issues
- Can view their own tickets and messages
- Cannot view other tenants' tickets

### Professional
- Property manager, electrician, plumber, or concierge
- Can be assigned tickets
- Can update ticket status and add messages
- Can view all tickets assigned to them

---

## Language & Localization

- Application is in **French** (`lang="fr"` in layout)
- All UI text, form labels, error messages in French
- SEO metadata configured for French content
- Date formatting: `dd/MM/yyyy` (French format)

---

## Common Development Tasks

### Adding a New Route

1. Create file in `app/api/{section}/{action}/route.ts`
2. Import Airtable config and auth middleware
3. Validate request body with proper error handling
4. Query Airtable using table ID + field IDs
5. Return JSON with consistent format: `{success, data, error}`

**Example**:
```typescript
// app/api/tenant/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({success: false, error: 'Unauthorized'}, {status: 401});
    
    // Fetch from Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/appmujqM67OAxGBby/tbl2qQrpJc4PC9yfk`,
      {
        headers: {'Authorization': `Bearer ${process.env.AIRTABLE_API_TOKEN}`}
      }
    );
    
    const data = await response.json();
    return NextResponse.json({success: true, data: data.records});
  } catch (error) {
    return NextResponse.json({success: false, error: error.message}, {status: 500});
  }
}
```

### Querying Airtable

Always use Table IDs (e.g., `tbl18r4MzBthXlnth`) instead of table names for reliability.

Filter formula example:
```
filterByFormula={email}='user@example.com'
```

Sort example:
```
sort[0][field]=created_at&sort[0][direction]=desc
```

### Adding Authentication Check

Middleware pattern:
```typescript
const token = request.headers.get('Authorization')?.replace('Bearer ', '');
if (!token) {
  return NextResponse.json({success: false, error: 'No token'}, {status: 401});
}
```

---

## Testing Credentials
Toujours faire des tests avec les vraies données airtables 


---

## Future Considerations

- Add proper form validation beyond HTML5 required attributes
- Implement state management (Zustand recommended over Redux for this scale)
- Add error handling and loading states throughout
- Set up CI/CD pipeline for automated testing and deployment
- Add database migration scripts if schema changes
- Consider caching strategy for frequently accessed data
- Implement rate limiting on API endpoints
- Add logging system for debugging production issues
- Set up monitoring and error tracking (Sentry, etc.)

---

## Debugging Tips

**Airtable API Issues**:
- Check Bearer token validity (tokens can expire)
- Verify field IDs match exactly (copy from Airtable UI)
- Check table ID format starts with `tbl`
- Use `filterByFormula` for complex queries instead of client-side filtering

**Authentication Issues**:
- Verify token stored in localStorage/cookies
- Check token not expired (JWT decode to verify expiry)
- Ensure Authorization header format is `Bearer {token}`

**Data Not Appearing**:
- Check Airtable base ID is correct
- Verify user has proper access permissions
- Check record exists in Airtable first
- Validate API response in browser DevTools Network tab

---

## 🤖 AGENT MCP-CREATOR

### Vue d'ensemble

L'agent **mcp-creator** est un agent spécialisé dans la création complète de serveurs Model Context Protocol (MCP) pour Claude Code. Il produit des serveurs production-ready avec validation Pydantic/Zod, error handling robuste, et documentation exhaustive.

**Fichier:** `.claude/agents/mcp-creator.md` (658 lignes)

### Utilisation Rapide

```bash
# Commande slash (recommandé)
/mcp créer un serveur pour intégrer Gmail avec recherche et envoi d'emails

# Mention directe
@mcp-creator Je veux créer un serveur MCP pour...
```

### Capacités

- ✅ Création serveurs MCP complets (Python/TypeScript)
- ✅ Architecture optimale avec diagrammes ASCII
- ✅ Validation Pydantic/Zod stricte
- ✅ Error handling + logging robustes
- ✅ Configuration Claude Desktop automatique
- ✅ Documentation complète avec exemples
- ✅ Consultation docs officielles MCP en temps réel

### Processus en 6 Phases

```
Phase 1: DISCOVERY (2-3 min)
  → Pose 5-7 questions pour comprendre le besoin

Phase 2: ARCHITECTURE (2-3 min)
  → Propose architecture + tech stack + diagramme

Phase 3: SCAFFOLDING (1-2 min)
  → Crée structure fichiers + requirements/package.json

Phase 4: IMPLÉMENTATION (5-10 min)
  → Code handlers avec type hints + error handling + logging

Phase 5: INTÉGRATION (2-3 min)
  → Configure Claude Desktop + tests

Phase 6: OPTIMISATION (1-2 min)
  → Ajoute caching + finalise documentation

Durée totale: 13-23 minutes selon complexité
```

### Exemples d'Utilisation

**Exemple Simple:**
```bash
/mcp créer un serveur pour l'API OpenWeather avec recherche météo par ville
```

**Exemple Avancé (ResidConnect):**
```bash
/mcp créer un serveur MCP pour ResidConnect avec:
- CRUD sur tickets via Airtable API
- Notifications locataires par email
- Recherche tickets par status/priorité/date
- Cache Redis des requêtes fréquentes
- Intégration avec MCP Airtable existant
- Rate limiting 10 req/sec
```

**Exemple Extension:**
```bash
@mcp-creator Ajoute une fonction de recherche full-text au MCP Airtable existant avec filtres avancés
```

### Standards de Qualité

**Code:**
- Type hints complets (Python) ou TypeScript strict
- Docstrings détaillées (Google/NumPy style)
- Error handling avec logging approprié
- Async/await pour toutes les I/O
- Variables d'environnement pour secrets
- 0 TODO/FIXME dans le code livré

**Configuration:**
- JSON valide et correctement indenté
- Chemins absolus pour tous les exécutables
- Versions de dépendances fixées
- .env.example complet

**Documentation:**
- README.md avec instructions setup pas-à-pas
- Exemples d'utilisation concrets
- Guide troubleshooting
- Architecture expliquée avec diagrammes

### Livrables

Après exécution, l'agent fournit:

1. **Code complet** (copy-paste ready)
   - Tous les fichiers Python/TypeScript
   - Type hints et docstrings complets
   - Error handling robuste

2. **Configurations**
   - `claude_desktop_config.json` valide
   - `.env.example` avec toutes les variables
   - `requirements.txt` ou `package.json`

3. **Documentation**
   - README.md complet
   - Instructions setup pas-à-pas
   - Exemples d'utilisation
   - Guide troubleshooting

4. **Architecture**
   - Diagrammes ASCII
   - Explication des choix techniques
   - Plan d'évolution

### Ressources Consultées

L'agent a accès automatique à:
- https://code.claude.com/docs/fr/mcp (Doc officielle Claude Code)
- https://modelcontextprotocol.io/docs (Doc MCP officielle)
- https://www.anthropic.com/learn/build-with-claude
- https://apidog.com/fr/blog (Tutoriels FR)
- https://www.cometapi.com (Exemples)

### Tips pour de Meilleurs Résultats

**Soyez spécifique:**
- ❌ Vague: "Crée un MCP pour email"
- ✅ Spécifique: "Crée un MCP Gmail avec recherche par date/expéditeur, envoi d'emails, et lecture des 50 derniers emails"

**Mentionnez les contraintes:**
```bash
/mcp serveur Notion avec:
- Python 3.11+
- Cache Redis requis
- OAuth2 authentication
- Intégration avec MCP Airtable existant
```

**Précisez les opérations:**
```bash
/mcp serveur Todoist avec:
- CREATE: nouvelles tâches
- READ: tâches par projet/tag/date
- UPDATE: modifier tâches existantes
- DELETE: supprimer tâches
- SEARCH: recherche full-text
```

### Commandes Utiles

```bash
# Lister tous les MCPs installés
claude mcp list

# Ajouter un nouveau MCP
claude mcp add /path/to/mcp

# Supprimer un MCP
claude mcp remove mcp-name

# Tester un MCP Python
python mcp/your_server/main.py
```

### Configuration Requise

Les permissions suivantes sont configurées dans `.claude/settings.local.json`:
- `WebFetch(domain:modelcontextprotocol.io)`
- `WebFetch(domain:code.claude.com)`
- `WebFetch(domain:anthropic.com)`
- `WebFetch(domain:apidog.com)`
- `WebFetch(domain:cometapi.com)`
- `Bash(claude mcp add:*)`
- `Bash(claude mcp list:*)`
- `Bash(claude mcp remove:*)`

### Outils Disponibles

L'agent mcp-creator a accès à:
- **Read, Write, Edit** - Gestion des fichiers
- **Bash** - Installation dépendances et tests
- **Grep, Glob** - Exploration du projet
- **WebFetch** - Consultation documentation
- **WebSearch** - Recherche patterns récents

---

## 🔧 AGENT MCP-DOCTOR

### Vue d'ensemble

L'agent **mcp-doctor** est un agent spécialisé dans le diagnostic, debugging et réparation de serveurs Model Context Protocol (MCP). Il identifie les problèmes de configuration, dépendances, connectivité et propose des solutions automatiques.

**Fichier:** `.claude/agents/mcp-doctor.md` (800+ lignes)

### Utilisation Rapide

```bash
# Diagnostic complet d'un MCP
/mcp-check nom-du-mcp

# Diagnostic de tous les MCPs
/mcp-check

# Réparation automatique
/mcp-fix nom-du-mcp
```

### Capacités

- ✅ Diagnostic complet (config, dépendances, connectivité)
- ✅ Détection erreurs courantes (chemins, timeouts, validation)
- ✅ Consultation documentation officielle en temps réel
- ✅ Utilisation MCP Context7 (recherche doc)
- ✅ Utilisation MCP Gemini (recherche web solutions)
- ✅ Réparation automatique des problèmes standards
- ✅ Rapport détaillé avec recommandations
- ✅ Tests de validation post-correction

### Processus en 5 Phases

```
Phase 1: DISCOVERY & TRIAGE (1-2 min)
  → Identifie le MCP et les symptômes
  → Liste MCPs installés (claude mcp list)
  → Recherche problèmes connus (GitHub issues)

Phase 2: INSPECTION SYSTÈME (2-3 min)
  → Vérifie configuration Claude Desktop
  → Lit fichiers sources et dépendances
  → Teste chemins et permissions

Phase 3: ANALYSE & DIAGNOSTIC (3-5 min)
  → Checklist complète (config, code, env, handlers)
  → Consultation doc officielle MCP
  → Recherche solutions avec Context7 + Gemini

Phase 4: SOLUTION & RÉPARATION (3-10 min)
  → Propose corrections priorisées
  → Applique réparations (avec validation)
  → Teste après chaque correction

Phase 5: VALIDATION & RAPPORT (1-2 min)
  → Vérifie "claude mcp list" (Connected)
  → Teste handlers critiques
  → Génère rapport complet

Durée totale: 10-22 minutes selon complexité
```

### Exemples d'Utilisation

**Exemple Simple:**
```bash
# MCP ne se connecte pas
/mcp-check airtable
```

**Exemple Diagnostic Général:**
```bash
# Vérifier tous les MCPs
/mcp-check
```

**Exemple Réparation:**
```bash
# Réparer automatiquement les problèmes standards
/mcp-fix airtable
```

### Problèmes Détectés Automatiquement

**Configuration:**
- ❌ JSON invalide dans claude_desktop_config.json
- ❌ Chemins relatifs au lieu d'absolus
- ❌ Command/args incorrects
- ❌ Variables d'environnement manquantes

**Dépendances:**
- ❌ Modules Python/Node manquants
- ❌ Versions incompatibles
- ❌ Conflits de versions

**Code & Handlers:**
- ❌ Erreurs de syntaxe
- ❌ Type hints Pydantic invalides
- ❌ Handlers mal définis
- ❌ Imports manquants

**Connectivité:**
- ❌ Timeouts
- ❌ MCP ne répond pas
- ❌ Rate limiting mal configuré

### Format de Rapport

Chaque diagnostic génère un rapport structuré:

```markdown
🔍 RÉSUMÉ EXÉCUTIF
  Status: ✅ Connecté | ⚠️ Dégradé | ❌ Déconnecté
  Problèmes: X critiques, Y warnings

✅ CHECKS SYSTÈME
  Configuration: [résultats]
  Dépendances: [résultats]
  Fichiers: [résultats]
  Handlers: [résultats]
  Connectivité: [résultats]

🐛 PROBLÈMES DÉTECTÉS
  [CRITIQUE] Problème 1
  [WARNING] Problème 2
  [INFO] Problème 3

🔧 SOLUTIONS PROPOSÉES
  Solution 1 (PRIORITÉ HAUTE)
  Solution 2 (PRIORITÉ MOYENNE)

📊 ACTIONS EFFECTUÉES
  ✅ Corrections appliquées
  ⏭️ Actions nécessitant validation

🧪 TESTS DE VALIDATION
  ✅ Tests réussis
  ❌ Tests échoués

💡 RECOMMANDATIONS
  Court terme, Moyen terme, Long terme
```

### Ressources Consultées

L'agent a accès automatique à:
- https://code.claude.com/docs/fr/mcp (Doc Claude Code FR)
- https://modelcontextprotocol.io/docs/tools/debugging (Debugging officiel)
- https://modelcontextprotocol.io/docs/tools/inspector (MCP Inspector)
- https://modelcontextprotocol.io/docs/develop/connect-local-servers (Local servers)
- https://modelcontextprotocol.io/docs/develop/build-server (Build servers)
- https://www.cometapi.com/fr/create-a-mcp-server-for-claude-code/ (CometAPI FR)
- https://github.com/anthropics/claude-code/issues/72 (Known issues)

**MCPs utilisés:**
- **Context7** - Recherche dans documentation MCP
- **Gemini** - Recherche web de solutions

### Différence avec /mcp (mcp-creator)

| Aspect | /mcp (mcp-creator) | /mcp-check (mcp-doctor) |
|--------|-------------------|------------------------|
| **Objectif** | Créer un nouveau MCP | Diagnostiquer/Réparer MCP existant |
| **Input** | Description du besoin | Nom du MCP ou symptômes |
| **Output** | Code + Config + Docs | Rapport diagnostic + Corrections |
| **Durée** | 13-23 min | 10-22 min |
| **Mode** | Création | Maintenance |

### Commandes Disponibles

```bash
# Lister tous les MCPs et leur status
claude mcp list

# Diagnostic complet
/mcp-check [nom-du-mcp]

# Réparation automatique
/mcp-fix nom-du-mcp

# Tester un MCP manuellement
python path/to/mcp/main.py  # Python
node path/to/mcp/server.js  # Node.js
```

### Configuration Requise

Permissions configurées dans `.claude/settings.local.json`:
- `SlashCommand(/mcp-check:*)`
- `SlashCommand(/mcp-fix:*)`
- `Bash(claude mcp list:*)`
- `Bash(claude mcp install:*)`
- `WebFetch(domain:modelcontextprotocol.io)`
- `WebFetch(domain:code.claude.com)`
- `WebFetch(domain:cometapi.com/fr)`
- `WebFetch(domain:github.com)`

### Outils Disponibles

L'agent mcp-doctor a accès à:
- **MCP Context7** - Recherche dans doc MCP officielle
- **MCP Gemini** - Recherche web de solutions
- **Read, Write, Edit** - Analyse et correction fichiers
- **Bash** - Tests et validation
- **Grep, Glob** - Exploration projet
- **WebFetch** - Consultation docs officielles

### Tips pour de Meilleurs Diagnostics

**Fournir le contexte:**
```bash
# ❌ Vague
/mcp-check mon-mcp

# ✅ Spécifique avec symptômes
/mcp-check airtable
Message d'erreur: "TypeError: 'NoneType' object is not subscriptable"
Depuis hier après mise à jour Python
```

**Logs disponibles:**
```bash
# Si vous avez des logs, mentionnez-les
/mcp-check gemini
Le MCP démarre mais timeout après 30s
Logs dans C:\Users\user\mcp\logs\error.log
```

**Quand utiliser /mcp-check vs /mcp-fix:**
- `/mcp-check` - Pour comprendre le problème en détail
- `/mcp-fix` - Pour réparer rapidement les problèmes standards