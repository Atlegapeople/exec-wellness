import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      );
    }

    // First, get the current record to compare with
    const getCurrentRecordQuery = `
      SELECT 
        prostate_enlarged, prostate_infection, prostate_cancer,
        testes_growth, erections, require_urologist,
        notes_header, notes_text, recommendation_text,
        report_id
      FROM mens_health 
      WHERE id = $1
    `;

    const currentRecordResult = await query(getCurrentRecordQuery, [id]);

    if (currentRecordResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Men's health record not found" },
        { status: 404 }
      );
    }

    const currentRecord = currentRecordResult.rows[0];

    // Only include fields that have actually changed
    const changedFields: Record<string, any> = {};
    const allowedFields = [
      'prostate_enlarged',
      'prostate_infection',
      'prostate_cancer',
      'testes_growth',
      'erections',
      'require_urologist',
      'notes_header',
      'notes_text',
      'recommendation_text',
      'report_id',
    ];

    for (const field of allowedFields) {
      if (
        updateData[field] !== undefined &&
        updateData[field] !== currentRecord[field]
      ) {
        changedFields[field] = updateData[field];
      }
    }

    // If no fields have changed, return the current record without updating
    if (Object.keys(changedFields).length === 0) {
      return NextResponse.json({
        message: 'No changes detected',
        record: currentRecord,
        unchanged: true,
      });
    }

    // Build the update query with only changed fields
    const fields = Object.keys(changedFields);
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');

    const updateQuery = `
      UPDATE mens_health 
      SET ${setClause}, date_updated = $1, user_updated = 'system'
      WHERE id = $${fields.length + 2}
      RETURNING *
    `;

    const params = [
      new Date(),
      ...fields.map(field => changedFields[field]),
      id,
    ];
    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Men's health record not found" },
        { status: 404 }
      );
    }

    const updatedRecord = result.rows[0];

    return NextResponse.json({
      message: 'Record updated successfully',
      record: updatedRecord,
      changedFields: Object.keys(changedFields),
      unchanged: false,
    });
  } catch (error) {
    console.error("Error updating men's health record:", error);
    return NextResponse.json(
      { error: "Failed to update men's health record" },
      { status: 500 }
    );
  }
}
