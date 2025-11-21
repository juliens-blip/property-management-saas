description: Implémenter upload d'images DIRECTEMENT dans le champ Attachments d'Airtable
allowed-tools: [Read, Write, Edit, Bash, Grep]
argument-hint: none
model: sonnet

# IMAGE UPLOAD COMMAND - ResidConnect SaaS

## Objectif
Permettre aux utilisateurs d'uploader des images DIRECTEMENT dans le champ Attachments d'Airtable lors de la création/modification d'un ticket.

## Architecture
```
User upload image (TicketForm)
   ↓
POST /api/tenant/tickets/upload
   ↓
Backend upload vers content.airtable.com
   ↓
Airtable retourne attachmentId
   ↓
Frontend stocke attachmentId
   ↓
Créer ticket avec image dans Airtable
   ↓
TicketDetail affiche galerie d'images
```

## Contexte Airtable
- **Table**: TICKETS (tbl2qQrpJc4PC9yfk)
- **Champ**: images_urls (type: Attachments)
- **API Airtable**: https://content.airtable.com/v0/uploads (NOT api.airtable.com)
- **Auth**: Bearer Token (AIRTABLE_API_TOKEN)

---

# PHASE 1: EXPLORATION

## Step 1: Vérifier les fichiers existants

Read(components/TicketForm.tsx)
  → Affiche la structure du formulaire
  → Vérifie les états existants

Read(app/api/tenant/tickets/route.ts)
  → Affiche comment les tickets sont créés
  → Vérifie le format de sauvegarde

Read(app/tenant/tickets/[id]/page.tsx ou TicketDetail.tsx)
  → Affiche comment les tickets sont affichés
  → Vérifie comment afficher les images

---

# PHASE 2: PLAN

## Fichiers à créer/modifier

### À CRÉER:
1. lib/airtable-upload.ts
   - Fonction uploadAttachmentToAirtable(file)
   - Appelle content.airtable.com/v0/uploads
   - Retourne attachmentId

2. app/api/tenant/tickets/upload/route.ts
   - POST /api/tenant/tickets/upload
   - Reçoit FormData avec file
   - Appelle uploadAttachmentToAirtable
   - Valide le fichier (type, taille)
   - Retourne attachmentId

### À MODIFIER:
3. components/TicketForm.tsx
   - Ajouter input file (type="file", accept="image/*")
   - État: selectedFile (File | null)
   - État: uploadingImage (boolean)
   - État: uploadedImage ({ id, name } | null)
   - Preview de l'image avant upload
   - Button "Upload Image" qui appelle POST /api/tenant/tickets/upload
   - Afficher le nom du fichier uploadé
   - Option pour supprimer l'image sélectionnée
   - Passer uploadedImage au endpoint de création ticket

4. app/api/tenant/tickets/route.ts
   - Quand POST pour créer ticket
   - Si uploadedImage fourni dans body
   - Ajouter au champ images_urls en format Airtable attachments

5. app/tenant/tickets/[id]/page.tsx (TicketDetail)
   - Si images_urls contient des attachments
   - Afficher galerie d'images
   - Images cliquables pour voir en grand

---

# PHASE 3: CODE

## Step 3A: Créer lib/airtable-upload.ts

Write(lib/airtable-upload.ts)
```typescript
/**
 * Upload un fichier vers Airtable Attachments API
 * Utilise content.airtable.com (pas api.airtable.com)
 * 
 * @param file - File object du browser
 * @returns attachmentId pour Airtable
 * @throws Error si upload échoue
 */
export async function uploadAttachmentToAirtable(file: File): Promise<string> {
  if (!process.env.AIRTABLE_API_TOKEN) {
    throw new Error('AIRTABLE_API_TOKEN non défini');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('https://content.airtable.com/v0/uploads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Airtable upload failed: ${response.status} - ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    
    // Airtable retourne: { id, filename, size, url }
    // On retourne juste l'ID pour l'utiliser dans le ticket
    return data.id;
  } catch (error) {
    console.error('Airtable upload error:', error);
    throw error;
  }
}

/**
 * Valider un fichier image
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Type de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP.'
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Max ${MAX_SIZE / (1024 * 1024)}MB.`
    };
  }

  return { valid: true };
}
```

## Step 3B: Créer app/api/tenant/tickets/upload/route.ts

Write(app/api/tenant/tickets/upload/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { uploadAttachmentToAirtable, validateImageFile } from '@/lib/airtable-upload';

/**
 * POST /api/tenant/tickets/upload
 * Upload une image vers Airtable
 * 
 * Request: FormData avec 'file'
 * Response: { success, attachmentId, fileName, error? }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aucun fichier fourni'
        },
        { status: 400 }
      );
    }

    // Valider le fichier
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error
        },
        { status: 400 }
      );
    }

    // Uploader vers Airtable
    const attachmentId = await uploadAttachmentToAirtable(file);

    return NextResponse.json(
      {
        success: true,
        attachmentId,
        fileName: file.name,
        fileSize: file.size
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'upload'
      },
      { status: 500 }
    );
  }
}
```

## Step 3C: Modifier components/TicketForm.tsx

Edit(components/TicketForm.tsx)
  → Ajouter import useState
  → Ajouter states:
    - selectedFile: File | null
    - uploadingImage: boolean
    - uploadedImage: { id: string; name: string } | null
    - imageError: string | null

  → Ajouter fonction handleFileSelect():
    - Reçoit event du input file
    - Valide le fichier
    - Set selectedFile et preview

  → Ajouter fonction handleUploadImage():
    - FormData avec selectedFile
    - POST /api/tenant/tickets/upload
    - Set uploadingImage = true
    - Reçoit attachmentId
    - Set uploadedImage
    - Clear selectedFile
    - Set uploadingImage = false

  → Ajouter fonction handleRemoveImage():
    - Set uploadedImage = null
    - Clear selectedFile

  → Dans le JSX:
    - Input type="file" accept="image/*" onChange={handleFileSelect}
    - Si selectedFile: afficher preview
    - Button "Uploader l'image" (disabled si uploadingImage)
    - Si uploadingImage: afficher spinner
    - Si uploadedImage: afficher nom + bouton supprimer
    - Si imageError: afficher message erreur en rouge

  → Quand créer le ticket:
    - Si uploadedImage.id, ajouter au body:
      images_urls: [{ id: uploadedImage.id, filename: uploadedImage.name }]

## Step 3D: Modifier app/api/tenant/tickets/route.ts

Edit(app/api/tenant/tickets/route.ts)
  → Quand POST pour créer ticket
  → Ajouter paramètre optionnel: images_urls (array)
  → Si images_urls fourni:
    ```typescript
    const ticketFields = {
      title,
      description,
      category,
      priority,
      status: 'open',
      tenant_email,
      unit,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images_urls: images_urls // Airtable gère le format automatiquement
    };
    ```

## Step 3E: Modifier TicketDetail.tsx

Edit(app/tenant/tickets/[id]/page.tsx)
  → Récupérer ticket depuis API
  → Si ticket.images_urls && Array.isArray(ticket.images_urls):
    - Afficher section "Pièces jointes"
    - Boucle sur images_urls
    - Pour chaque image:
      - Afficher thumbnail
      - Lien pour download/voir en grand
      - Afficher nom du fichier

---

# PHASE 4: TEST

## Step 4: Tests

Bash(npm run dev)
  → Démarrer le serveur

Test 1: Upload image
  - Aller à /tenant/tickets/new
  - Sélectionner une image
  - Vérifier preview
  - Cliquer "Uploader l'image"
  - Vérifier que ça dit "Image uploadée"
  - Créer le ticket

Test 2: Vérifier Airtable
  - Aller dans Airtable
  - Table TICKETS
  - Nouveau ticket
  - Champ images_urls
  - Vérifier que l'image est présente (avec vignette)

Test 3: Afficher l'image
  - Aller à la page du ticket
  - Vérifier que l'image s'affiche
  - Vérifier que c'est cliquable

Test 4: Erreurs
  - Essayer upload fichier > 10MB → erreur
  - Essayer upload non-image → erreur

---

# PHASE 5: RÉSUMÉ

Output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ IMAGE UPLOAD IMPLEMENTATION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 FICHIERS CRÉÉS:
  ✅ lib/airtable-upload.ts
  ✅ app/api/tenant/tickets/upload/route.ts

✏️ FICHIERS MODIFIÉS:
  ✅ components/TicketForm.tsx (+ upload UI)
  ✅ app/api/tenant/tickets/route.ts (+ images_urls)
  ✅ app/tenant/tickets/[id]/page.tsx (+ galerie)

🎯 FONCTIONNALITÉS:
  ✅ Upload image direct vers Airtable
  ✅ Validation fichier (type, taille)
  ✅ Preview avant upload
  ✅ Stocker dans champ Attachments
  ✅ Galerie dans ticket detail
  ✅ Gestion erreurs

📊 TESTS:
  → npm run dev
  → Aller à /tenant/tickets/new
  → Uploader une image
  → Créer un ticket
  → Vérifier l'image dans Airtable
  → Vérifier l'affichage dans le ticket

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

# UTILISATION

Appeler depuis Claude Code:
```
@image
```

Ou si besoin de retouche:
```
@image
Modifie la galerie pour afficher 3 images par ligne au lieu de 1
```