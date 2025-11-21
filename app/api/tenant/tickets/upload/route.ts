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
