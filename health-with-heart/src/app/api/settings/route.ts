import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Fetch organization settings
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (orgError) {
      console.error('Error fetching organization:', orgError);
      return NextResponse.json(
        { error: 'Failed to fetch organization settings' },
        { status: 500 }
      );
    }

    // Fetch additional settings from a settings table if it exists
    // For now, we'll return the organization data as the base settings
    const settings = {
      organization: {
        id: organization.id,
        name: organization.name,
        registration_number: organization.registration_number,
        logo: organization.logo,
        notes: organization.notes,
        // Add other fields as needed
      },
      notifications: {
        email_notifications: true,
        sms_notifications: false,
        appointment_reminders: true,
        report_completion_alerts: true,
        emergency_response_alerts: true,
        system_maintenance_alerts: false,
      },
      security: {
        session_timeout: 30,
        require_mfa: false,
        password_min_length: 8,
        password_require_special: true,
        password_require_numbers: true,
        failed_login_attempts: 5,
        account_lockout_duration: 15,
      },
      data: {
        backup_frequency: 'daily',
        retention_period: 7,
        auto_export: false,
        export_format: 'CSV',
        data_encryption: true,
      },
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in settings GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { organization, notifications, security, data } = body;

    if (!organization?.id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Update organization settings
    const { error: orgError } = await supabase
      .from('organizations')
      .update({
        name: organization.name,
        registration_number: organization.registration_number,
        logo: organization.logo,
        notes: organization.notes,
        date_updated: new Date().toISOString(),
        user_updated: '1', // TODO: Use actual user ID from auth
      })
      .eq('id', organization.id);

    if (orgError) {
      console.error('Error updating organization:', orgError);
      return NextResponse.json(
        { error: 'Failed to update organization settings' },
        { status: 500 }
      );
    }

    // TODO: Save other settings to appropriate tables
    // For now, we'll just return success for the organization update

    return NextResponse.json({
      message: 'Settings updated successfully',
      organization: organization,
    });
  } catch (error) {
    console.error('Error in settings PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
