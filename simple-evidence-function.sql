-- Simple version of the evidence function to test
CREATE OR REPLACE FUNCTION get_officer_recent_evidence(
  p_officer_id TEXT,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  evidence_id UUID,
  complaint_id UUID,
  complaint_number TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  download_url TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
  WHERE c.assigned_officer_id = p_officer_id
    AND c.status IN ('Pending', 'Under Investigation', 'Requires More Information')
  ORDER BY ef.created_at DESC
  LIMIT p_limit;
$$;

-- Grant permission
GRANT EXECUTE ON FUNCTION get_officer_recent_evidence TO authenticated;
GRANT EXECUTE ON FUNCTION get_officer_recent_evidence TO anon;