import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;

    // Sanitize filename to prevent directory traversal
    const safeName = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'uploads', safeName);

    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(safeName).toLowerCase().replace('.', '');
      let mimeType = 'image/jpeg';
      if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'svg') mimeType = 'image/svg+xml';
      else if (ext === 'gif') mimeType = 'image/gif';

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': 'inline',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Fallback: check if we can recover the image from Firestore
    try {
      const { firestore } = await import('@/lib/firebase');
      const { collection, getDocs } = await import('firebase/firestore');
      const snap = await getDocs(collection(firestore, 'products'));
      for (const d of snap.docs) {
        const prod = d.data();
        if (prod.imageUrl && prod.imageUrl.includes(safeName)) {
          if (prod.imageUrl.startsWith('data:image/')) {
            const [, base64Data] = prod.imageUrl.split(',');
            const buffer = Buffer.from(base64Data, 'base64');
            return new NextResponse(buffer, {
              headers: {
                'Content-Type': 'image/jpeg',
                'Content-Disposition': 'inline',
                'Cache-Control': 'public, max-age=31536000, immutable',
              },
            });
          }
        }
      }
    } catch {}

    return new NextResponse('Image not found', { status: 404 });
  } catch (error) {
    console.error('Error serving upload:', error);
    return new NextResponse('Internal error serving image', { status: 500 });
  }
}
