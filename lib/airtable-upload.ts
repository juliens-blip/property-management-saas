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
