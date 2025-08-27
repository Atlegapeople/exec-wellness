import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const logoFile = formData.get('logo') as File;
    const organizationId = formData.get('organization_id') as string;

    if (!logoFile) {
      return NextResponse.json(
        { error: 'Logo file is required' },
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!logoFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (logoFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = logoFile.name.split('.').pop();
    const fileName = `logo_${organizationId}_${Date.now()}.${fileExtension}`;
    const filePath = `organization-logos/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user_images') // Using existing bucket
      .upload(filePath, logoFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload logo file' },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('user_images')
      .getPublicUrl(filePath);

    const logoUrl = urlData.publicUrl;

    // Update organization with new logo URL
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        logo: logoUrl,
        date_updated: new Date().toISOString(),
        user_updated: '1', // TODO: Use actual user ID from auth
      })
      .eq('id', organizationId);

    if (updateError) {
      console.error('Error updating organization logo:', updateError);
      return NextResponse.json(
        { error: 'Failed to update organization logo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Logo uploaded successfully',
      logo_url: logoUrl,
      file_path: filePath,
    });
  } catch (error) {
    console.error('Error in logo upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Get current logo URL from organization
    const { data: organization, error: fetchError } = await supabase
      .from('organizations')
      .select('logo')
      .eq('id', organizationId)
      .single();

    if (fetchError) {
      console.error('Error fetching organization logo:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch organization logo' },
        { status: 500 }
      );
    }

    if (organization.logo) {
      // Extract file path from URL
      const urlParts = organization.logo.split('/');
      const filePath = urlParts.slice(-2).join('/'); // Get last two parts for path

      // Delete file from storage
      const { error: deleteError } = await supabase.storage
        .from('user_images')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting logo file:', deleteError);
        // Continue with database update even if file deletion fails
      }
    }

    // Update organization to remove logo URL
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        logo: null,
        date_updated: new Date().toISOString(),
        user_updated: '1', // TODO: Use actual user ID from auth
      })
      .eq('id', organizationId);

    if (updateError) {
      console.error('Error updating organization logo:', updateError);
      return NextResponse.json(
        { error: 'Failed to remove organization logo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Logo removed successfully',
    });
  } catch (error) {
    console.error('Error in logo deletion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
