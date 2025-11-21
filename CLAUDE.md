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