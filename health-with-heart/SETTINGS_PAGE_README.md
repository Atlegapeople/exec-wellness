# Settings Page Documentation

## Overview

The Settings page provides comprehensive configuration options for organizations to customize their Health With Heart experience. It's accessible from the sidebar navigation under the "System" section.

## Features

### 1. General Settings

- **Organization Information**: Name, registration number, contact details
- **Contact Information**: Email, phone, website URL
- **Address Details**: Street address, city, country, postal code
- **Regional Settings**: Timezone, date format, currency, language
- **Notes**: Additional organization information

### 2. Branding & Logo

- **Logo Management**: Upload, preview, and remove organization logos
- **Color Scheme**: Customize primary and secondary colors
- **Display Preferences**: Date format, currency, language settings

#### Logo Upload Requirements:

- File types: PNG, JPG, JPEG, GIF
- Maximum size: 5MB
- Recommended dimensions: 200x200px
- Stored in Supabase Storage under `organization-logos/`

### 3. Notification Preferences

- **Communication Channels**: Email and SMS notifications
- **Alert Types**:
  - Appointment reminders
  - Report completion alerts
  - Emergency response alerts
  - System maintenance alerts

### 4. Security Configuration

- **Session Management**: Session timeout settings
- **Multi-Factor Authentication**: Enable/disable MFA requirement
- **Password Policies**: Length, special characters, numbers
- **Account Protection**: Failed login attempts, lockout duration

### 5. Data Management

- **Backup Settings**: Frequency and retention period
- **Export Options**: Automatic export, format selection
- **Data Protection**: Encryption settings
- **Manual Actions**: Export, import, and backup creation

## API Endpoints

### Main Settings

- `GET /api/settings?organization_id={id}` - Fetch organization settings
- `PUT /api/settings` - Update organization settings

### Logo Management

- `POST /api/settings/logo` - Upload new logo
- `DELETE /api/settings/logo?organization_id={id}` - Remove logo

## Usage

### Accessing Settings

1. Navigate to the sidebar
2. Click on "Settings" under the "System" section
3. The page will load with the current organization settings

### Making Changes

1. Navigate to the appropriate tab (General, Branding, Notifications, Security, Data)
2. Modify the desired settings
3. Click "Save Changes" to persist your modifications
4. A success message will confirm the save operation

### Logo Management

1. Go to the "Branding" tab
2. Click "Upload Logo" to select a new image file
3. Preview the logo before saving
4. Use the trash icon to remove existing logos
5. Save changes to apply logo updates

### Resetting to Defaults

- Click "Reset to Defaults" to restore all settings to their initial values
- This action cannot be undone

## Technical Details

### State Management

- Uses React hooks for local state management
- Settings are organized into logical groups (organization, notifications, security, data)
- Form validation and error handling included

### Data Persistence

- Settings are saved to the Supabase database
- Logo files are stored in Supabase Storage
- Real-time updates and error handling

### Responsive Design

- Mobile-friendly interface
- Tabbed navigation for better organization
- Consistent with the application's design system

## Future Enhancements

### Planned Features

- User role-based access control for settings
- Audit logging for setting changes
- Bulk import/export of settings
- Advanced notification scheduling
- Integration with external authentication providers

### API Improvements

- WebSocket support for real-time updates
- Batch operations for multiple setting updates
- Advanced filtering and search capabilities

## Troubleshooting

### Common Issues

1. **Logo upload fails**: Check file size and format requirements
2. **Settings not saving**: Verify organization ID and permissions
3. **API errors**: Check network connectivity and Supabase configuration

### Debug Information

- Check browser console for error messages
- Verify API endpoint responses
- Confirm Supabase environment variables are set correctly

## Security Considerations

- All settings changes are logged
- File uploads are validated for type and size
- Authentication required for all settings modifications
- Sensitive data is encrypted in transit and at rest

## Support

For technical support or feature requests related to the Settings page, please contact the development team or create an issue in the project repository.
