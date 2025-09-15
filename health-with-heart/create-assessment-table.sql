-- Create the missing assesment table
CREATE TABLE IF NOT EXISTS public.assesment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES public.employee(id) ON DELETE CASCADE NOT NULL,
    report_id UUID REFERENCES public.medical_report(id) ON DELETE CASCADE,
    assessment_type TEXT,
    assessment_complete BOOLEAN DEFAULT FALSE,
    user_created UUID REFERENCES public.users(id),
    user_updated UUID REFERENCES public.users(id),
    date_created TIMESTAMPTZ DEFAULT NOW(),
    date_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assesment_employee_id ON public.assesment(employee_id);
CREATE INDEX IF NOT EXISTS idx_assesment_report_id ON public.assesment(report_id);
CREATE INDEX IF NOT EXISTS idx_assesment_date_created ON public.assesment(date_created);

-- Add comments for documentation
COMMENT ON TABLE public.assesment IS 'Assessment records for executive medical assessments';
COMMENT ON COLUMN public.assesment.assessment_type IS 'Type of assessment (Insurance, Pre-employment, Annual, Exit)';
COMMENT ON COLUMN public.assesment.assessment_complete IS 'Whether the assessment is complete or not';
