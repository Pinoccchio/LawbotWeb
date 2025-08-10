-- Debug script to identify issues with the functions

-- 1. Check if assigned_officer_id has any data
SELECT 
    COUNT(*) as total_complaints,
    COUNT(assigned_officer_id) as assigned_complaints,
    COUNT(DISTINCT assigned_officer_id) as unique_officers
FROM complaints;

-- 2. Check sample assigned_officer_id values
SELECT DISTINCT 
    assigned_officer_id,
    COUNT(*) as case_count
FROM complaints
WHERE assigned_officer_id IS NOT NULL
GROUP BY assigned_officer_id
LIMIT 5;

-- 3. Check if any evidence files exist for assigned cases
SELECT 
    c.assigned_officer_id,
    COUNT(DISTINCT c.id) as cases_with_evidence,
    COUNT(ef.id) as total_evidence_files
FROM complaints c
JOIN evidence_files ef ON ef.complaint_id = c.id
WHERE c.assigned_officer_id IS NOT NULL
GROUP BY c.assigned_officer_id
LIMIT 5;

-- 4. Test a simple version without any type issues
CREATE OR REPLACE FUNCTION test_officer_evidence()
RETURNS TABLE (
  officer_id TEXT,
  evidence_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.assigned_officer_id,
    COUNT(ef.id)
  FROM complaints c
  LEFT JOIN evidence_files ef ON ef.complaint_id = c.id
  WHERE c.assigned_officer_id IS NOT NULL
  GROUP BY c.assigned_officer_id;
END;
$$ LANGUAGE plpgsql;

-- Test the simple function
SELECT * FROM test_officer_evidence();

-- 5. Check the exact data types in the schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'complaints' 
    AND column_name IN ('id', 'assigned_officer_id', 'status', 'priority')
ORDER BY ordinal_position;

-- 6. Check if there are any PNP officers in the system
SELECT 
    firebase_uid,
    full_name,
    badge_number,
    status
FROM pnp_officer_profiles
WHERE status = 'active'
LIMIT 5;

-- 7. Manual test of the evidence function with a known officer ID
-- Replace 'ACTUAL_OFFICER_ID' with a real firebase_uid from the query above
/*
SELECT 
    ef.id AS evidence_id,
    ef.complaint_id,
    c.complaint_number,
    ef.file_name,
    ef.file_type,
    ef.file_size,
    ef.download_url,
    ef.created_at AS uploaded_at
FROM evidence_files ef
JOIN complaints c ON ef.complaint_id = c.id
WHERE c.assigned_officer_id = 'ACTUAL_OFFICER_ID'
    AND c.status IN ('Pending', 'Under Investigation', 'Requires More Information')
ORDER BY ef.created_at DESC
LIMIT 5;
*/