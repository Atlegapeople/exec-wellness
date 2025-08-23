import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File;
    const organizationId = formData.get('organizationId') as string;

    if (!file || !organizationId) {
      return NextResponse.json(
        { error: 'Missing logo file or organization ID' },
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

    // Create filename based on organization ID
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${organizationId}.${fileExtension}`;
    
    // Define upload directory
    const uploadDir = join(process.cwd(), 'public', 'organization_logos');
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write file to disk
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update database with logo path
    const logoPath = `organization_logos/${fileName}`;
    const updateQuery = `
      UPDATE organisation 
      SET logo = $1, date_updated = NOW()
      WHERE id = $2
      RETURNING id, logo
    `;

    const result = await query(updateQuery, [logoPath, organizationId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Logo uploaded successfully',
      logoPath: result.rows[0].logo,
      organizationId: result.rows[0].id
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    );
  }
}