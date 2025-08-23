import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const userImagesDir = join(process.cwd(), 'public', 'user_images');
    
    // Check if directory exists
    if (!existsSync(userImagesDir)) {
      return NextResponse.json({
        hasSignature: false,
        signaturePath: null
      });
    }

    // Read directory contents
    const files = await readdir(userImagesDir);
    
    console.log(`Looking for signature file for userId: ${userId}`);
    console.log(`Available files:`, files.slice(0, 10));
    
    // Look for files that match the user ID (which seems to be the filename pattern)
    // The files appear to be named with UUID-like strings followed by extension
    const matchingFile = files.find(file => {
      // Remove extension and check if it matches userId or starts with userId
      const fileNameWithoutExt = file.replace(/\.[^/.]+$/, '');
      const matches = fileNameWithoutExt === userId || file.startsWith(userId);
      console.log(`Checking file: ${file}, nameWithoutExt: ${fileNameWithoutExt}, matches: ${matches}`);
      return matches;
    });

    console.log(`Found matching file: ${matchingFile}`);
    
    if (matchingFile) {
      return NextResponse.json({
        hasSignature: true,
        signaturePath: `user_images/${matchingFile}`
      });
    }

    return NextResponse.json({
      hasSignature: false,
      signaturePath: null
    });

  } catch (error) {
    console.error('Error checking signature:', error);
    return NextResponse.json(
      { error: 'Failed to check signature' },
      { status: 500 }
    );
  }
}