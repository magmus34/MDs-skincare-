import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export function ensureUploadDir(): string {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  return UPLOAD_DIR;
}

/**
 * Saves a base64 Data URL (data:image/...) to public/uploads/
 * Returns the public URL (e.g. /uploads/prod-xxx.jpg)
 * If the input is already a normal URL or path, returns it unchanged.
 */
export function persistImageIfDataUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return '';
  }

  const trimmed = imageUrl.trim();
  if (!trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  try {
    ensureUploadDir();

    // Format: data:image/png;base64,iVBORw0KGgo...
    const matches = trimmed.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches) {
      return trimmed;
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const filename = `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Failed to convert data URL to file:', err);
    return trimmed;
  }
}

/**
 * Saves a Buffer with a given mime type or extension to public/uploads/
 */
export async function saveUploadedFile(
  buffer: Buffer,
  originalFilename?: string,
  mimeType?: string
): Promise<string> {
  ensureUploadDir();

  let ext = 'jpg';
  if (originalFilename && path.extname(originalFilename)) {
    ext = path.extname(originalFilename).replace('.', '').toLowerCase();
  } else if (mimeType) {
    const parts = mimeType.split('/');
    if (parts[1]) ext = parts[1].toLowerCase();
  }
  if (ext === 'jpeg') ext = 'jpg';

  const filename = `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}
