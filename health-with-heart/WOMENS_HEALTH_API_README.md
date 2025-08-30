# Women's Health API Documentation

This document describes the API endpoints for managing women's health records, with a focus on efficient partial updates for inline editing.

## Base URL

```
/api/womens-health
```

## Endpoints

### 1. GET - Fetch Women's Health Records

Retrieves paginated women's health records with optional filtering.

**URL:** `GET /api/womens-health`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 29)
- `employee` (optional): Filter by employee ID
- `search` (optional): Search by employee name, ID, or findings

**Response:**

```json
{
  "womensHealth": [...],
  "pagination": {
    "page": 1,
    "limit": 29,
    "total": 100,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 2. POST - Create New Record

Creates a new women's health record.

**URL:** `POST /api/womens-health`

**Request Body:**

```json
{
  "employee_id": "emp_123",
  "gynaecological_symptoms": "No",
  "pap_result": "Normal",
  "breast_symptoms": "No",
  "pregnant": "No",
  "notes_text": "Initial assessment completed"
}
```

**Response:** `201 Created` with the created record

### 3. PUT - Update Record (Full Update)

Updates a women's health record, only modifying fields that have actually changed.

**URL:** `PUT /api/womens-health`

**Request Body:**

```json
{
  "id": "record_123",
  "breast_symptoms": "Yes",
  "mammogram_result": "Abnormal"
}
```

**Features:**

- Automatically detects which fields have changed
- Only updates modified fields
- Returns detailed information about what was changed
- If no changes detected, returns existing record unchanged

**Response:**

```json
{
  "id": "record_123",
  "breast_symptoms": "Yes",
  "mammogram_result": "Abnormal",
  "date_updated": "2024-01-15T10:30:00Z",
  "message": "Successfully updated 2 field(s): breast_symptoms, mammogram_result",
  "changedFields": ["breast_symptoms", "mammogram_result"],
  "unchangedFields": ["gynaecological_symptoms", "pap_result", ...]
}
```

### 4. PATCH - Partial Update (Section-based)

Efficiently updates specific sections of a women's health record.

**URL:** `PATCH /api/womens-health`

**Request Body:**

```json
{
  "id": "record_123",
  "section": "gynaecological",
  "gynaecological_symptoms": "Yes",
  "hormonal_contraception": "Yes"
}
```

**Supported Sections:**

- `gynaecological`: Gynecological health information
- `pap`: Pap smear information
- `breast`: Breast health information
- `pregnancy`: Pregnancy status
- `notes`: Notes section
- `recommendations`: Recommendations section

**Features:**

- Section-specific field validation
- Only updates fields within the specified section
- Efficient comparison with existing values
- Returns detailed change information

**Response:**

```json
{
  "id": "record_123",
  "gynaecological_symptoms": "Yes",
  "hormonal_contraception": "Yes",
  "date_updated": "2024-01-15T10:30:00Z",
  "message": "Successfully updated gynaecological section: 2 field(s) changed",
  "section": "gynaecological",
  "changedFields": ["gynaecological_symptoms", "hormonal_contraception"],
  "unchangedFields": [
    "yes_gynaecological_symptoms",
    "hormonel_replacement_therapy"
  ]
}
```

### 5. DELETE - Delete Record

Deletes a women's health record.

**URL:** `DELETE /api/womens-health?id=record_123`

**Query Parameters:**

- `id`: Record ID to delete

**Response:** `200 OK` with success message

## Field Mappings

### Gynaecological Section

- `gynaecological_symptoms` → `gynaecological_symptoms`
- `yes_gynaecological_symptoms` → `yes_gynaecological_symptoms`
- `hormonal_contraception` → `hormonal_contraception`
- `hormonel_replacement_therapy` → `hormonel_replacement_therapy`

### Pap Smear Section

- `last_pap` → `last_pap`
- `pap_date` → `pap_date`
- `pap_result` → `pap_result`
- `require_pap` → `require_pap`

### Breast Health Section

- `breast_symptoms` → `breast_symptoms`
- `breast_symptoms_yes` → `breast_symptoms_yes`
- `mammogram_result` → `mammogram_result`
- `last_mammogram` → `last_mammogram`
- `breast_problems` → `breast_problems`
- `require_mamogram` → `require_mamogram`

### Pregnancy Section

- `pregnant` → `pregnant`
- `pregnant_weeks` → `pregnant_weeks`
- `breastfeeding` → `breastfeeding`
- `concieve` → `concieve`

### Notes Section

- `notes_text` → `notes_text`

### Recommendations Section

- `recommendation_text` → `recommendation_text`

## Usage Examples

### Frontend Inline Editing

```javascript
// Save changes for a specific section
const saveEditing = async section => {
  const response = await fetch('/api/womens-health', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: recordId,
      section: section,
      ...editingData,
    }),
  });

  if (response.ok) {
    const result = await response.json();
    console.log(result.message); // Shows what was updated
  }
};
```

### Bulk Updates

```javascript
// Update multiple fields efficiently
const response = await fetch('/api/womens-health', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: recordId,
    breast_symptoms: 'Yes',
    mammogram_result: 'Abnormal',
    pap_result: 'Normal',
  }),
});
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful operation
- `201 Created`: Record created successfully
- `400 Bad Request`: Invalid input or missing required fields
- `404 Not Found`: Record not found
- `500 Internal Server Error`: Server error

Error responses include descriptive messages:

```json
{
  "error": "ID is required for update"
}
```

## Performance Features

1. **Efficient Updates**: Only changed fields are updated in the database
2. **Change Detection**: Automatic comparison with existing values
3. **Section-based Updates**: PATCH endpoint for targeted modifications
4. **Detailed Logging**: Comprehensive logging for debugging and monitoring
5. **Transaction Safety**: Database operations are atomic

## Testing

Use the provided test script to verify API functionality:

```bash
node test-womens-health-api.js
```

This will test all endpoints and demonstrate the change detection capabilities.

## Database Schema

The API works with the `womens_health` table containing all women's health assessment fields. The table automatically tracks:

- `date_created`: When the record was created
- `date_updated`: When the record was last modified
- `user_created`: Who created the record
- `user_updated`: Who last modified the record
