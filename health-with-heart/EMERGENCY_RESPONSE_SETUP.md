# Emergency Response CRUD Setup Guide

This guide explains how to set up and test the emergency response CRUD (Create, Read, Update, Delete) functionality in the Health With Heart application.

## Overview

The emergency response system allows users to:

- **Create** new emergency response records
- **Read** existing emergency response records with search and pagination
- **Update** emergency response records
- **Delete** emergency response records

## Prerequisites

1. **PostgreSQL Database**: Must be running and accessible
2. **Database Schema**: The `emergency_responses` table must be created
3. **Employee Data**: At least one employee record must exist for testing

## Database Setup

### 1. Apply Database Schema

The `emergency_responses` table schema has been added to `database-schema.sql`. Run this schema to create the required table:

```sql
-- The emergency_responses table will be created with:
-- - UUID primary key
-- - Employee foreign key reference
-- - Emergency type validation
-- - Medical information fields
-- - Timestamps and audit fields
-- - Proper indexes for performance
```

### 2. Verify Table Creation

Check if the table was created successfully:

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'emergency_responses'
);
```

## API Endpoints

The emergency response API provides the following endpoints:

### GET `/api/emergency-responses`

- **Purpose**: Retrieve emergency response records
- **Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Records per page (default: 50)
  - `search`: Search term for filtering
- **Response**: Paginated list of emergency responses with metadata

### POST `/api/emergency-responses`

- **Purpose**: Create a new emergency response record
- **Required Fields**: `employee_id`, `emergency_type`
- **Response**: Created record with generated ID

### PUT `/api/emergency-responses`

- **Purpose**: Update an existing emergency response record
- **Required Fields**: `id`, `employee_id`, `emergency_type`
- **Response**: Updated record

### DELETE `/api/emergency-responses?id={id}`

- **Purpose**: Delete an emergency response record
- **Parameters**: `id` (record ID to delete)
- **Response**: Deletion confirmation

## Testing the CRUD Operations

### 1. Run the Test Script

Use the provided test script to verify all CRUD operations:

```bash
cd health-with-heart
node test-emergency-response.js
```

This script will:

- Test database connectivity
- Verify table existence
- Test CREATE operation
- Test READ operation
- Test UPDATE operation
- Test DELETE operation
- Verify data integrity

### 2. Manual Testing via Frontend

1. **Navigate** to `/emergency-responses` page
2. **Create** a new emergency response using the "New Emergency Response" button
3. **View** the created record in the list
4. **Edit** the record using the edit button
5. **Delete** the record using the delete button

## Frontend Features

The emergency response page includes:

- **Search and Filtering**: Search by ID, employee, type, complaint, diagnosis
- **Pagination**: Navigate through large datasets
- **Form Validation**: Required field validation with error messages
- **Tabbed Interface**: Organized form sections (Basic Info, Medical, Response, Additional)
- **Real-time Updates**: Automatic refresh after CRUD operations
- **Error Handling**: User-friendly error messages and validation feedback

## Data Model

### EmergencyResponse Interface

```typescript
interface EmergencyResponse {
  id: string;
  date_created?: Date;
  date_updated?: Date;
  user_created?: string;
  user_updated?: string;
  report_id?: string;
  employee_id: string;
  employee_name?: string;
  employee_surname?: string;
  employee_work_email?: string;
  injury_date?: Date;
  injury_time?: string;
  arrival_time?: string;
  location_id?: string;
  place?: string;
  emergency_type: string;
  injury?: string;
  main_complaint?: string;
  diagnosis?: string;
  findings?: string;
  intervention?: string;
  patient_history?: string;
  plan?: string;
  outcome?: string;
  reference?: string;
  manager?: string;
  sendemail?: string;
}
```

### Emergency Types

- **Medical**: Medical emergencies (chest pain, breathing issues)
- **Injury**: Physical injuries (falls, cuts, sprains)
- **Accident**: Workplace accidents
- **Other**: Miscellaneous emergency situations

## Troubleshooting

### Common Issues

1. **Table Does Not Exist**
   - Error: "Emergency responses table does not exist"
   - Solution: Run the database schema first

2. **Database Connection Failed**
   - Error: "Database connection refused"
   - Solution: Check if PostgreSQL is running and accessible

3. **Employee Not Found**
   - Error: "Invalid employee ID - employee does not exist"
   - Solution: Ensure employee records exist in the database

4. **Permission Denied**
   - Error: "Permission denied" or similar
   - Solution: Check database user permissions

### Debug Steps

1. **Check Database Status**

   ```bash
   node check-postgres.js
   ```

2. **Test Database Connection**

   ```bash
   node test-db.js
   ```

3. **Verify Table Structure**

   ```sql
   \d emergency_responses
   ```

4. **Check API Logs**
   - Monitor browser console for frontend errors
   - Check server logs for API errors

## Performance Considerations

- **Indexes**: The table includes indexes on frequently queried fields
- **Pagination**: Large datasets are paginated for better performance
- **Search Optimization**: Full-text search capabilities for efficient filtering
- **Connection Pooling**: Database connections are pooled for better resource management

## Security Features

- **Input Validation**: All user inputs are validated
- **SQL Injection Protection**: Parameterized queries prevent SQL injection
- **Access Control**: Role-based access control (if implemented)
- **Audit Trail**: All changes are logged with timestamps

## Next Steps

After successful setup:

1. **Customize Fields**: Modify the form fields based on your requirements
2. **Add Validation**: Implement additional business logic validation
3. **Integrate Notifications**: Add email/SMS notifications for emergency responses
4. **Reporting**: Create reports and analytics for emergency response data
5. **Workflow**: Implement approval workflows if needed

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the test script output for specific error details
3. Verify database connectivity and schema
4. Check browser console and server logs for error messages

The emergency response system is designed to be robust and user-friendly, providing comprehensive CRUD functionality for managing workplace emergency situations.
