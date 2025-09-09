import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('signature') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing signature file or user ID' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image file.' },
        { status: 400 }
      );
    }

    // Create filename based on userId (to match existing file structure)
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}.${fileExtension}`;

    // Define upload directory
    const uploadDir = join(process.cwd(), 'public', 'user_images');

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write file to disk
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update database with signature path
    const signaturePath = `user_images/${fileName}`;
    const updateQuery = `
      UPDATE users 
      SET signature = $1, date_updated = NOW()
      WHERE id = $2
      RETURNING id, signature
    `;

    const result = await query(updateQuery, [signaturePath, userId]);

    return NextResponse.json({
      message: 'Signature uploaded successfully',
      signaturePath: (result.rows[0] as { signature: string }).signature,
      userId: (result.rows[0] as { id: string }).id,
    });
  } catch (error) {
    console.error('Error uploading signature:', error);
    return NextResponse.json(
      { error: 'Failed to upload signature' },
      { status: 500 }
    );
  }
}
