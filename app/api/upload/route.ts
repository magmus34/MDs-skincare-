import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedFile, persistImageIfDataUrl } from '@/lib/imageStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // 1. Multipart Form Data (direct file upload from input[type="file"])
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file uploaded. Please select an image file.' },
          { status: 400 }
        );
      }

      // Validate image type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: 'Selected file is not an image. Please choose a JPG, PNG, or WEBP photo.' },
          { status: 400 }
        );
      }

      // Max size check: 20MB
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'Image file is too large (max 20MB).' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const url = await saveUploadedFile(buffer, file.name, file.type);

      return NextResponse.json({
        success: true,
        url,
        message: 'Image uploaded and stored successfully.',
      });
    }

    // 2. JSON Payload (base64 Data URL or direct data)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { dataUrl, imageUrl } = body;
      const target = dataUrl || imageUrl;

      if (!target) {
        return NextResponse.json(
          { success: false, error: 'No image data provided.' },
          { status: 400 }
        );
      }

      const url = persistImageIfDataUrl(target);

      return NextResponse.json({
        success: true,
        url,
        message: 'Image processed and saved successfully.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported Content-Type. Expected multipart/form-data or application/json.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
