-- Database Functions for PNP Dashboard Real Data
-- These functions provide real-time data aggregation for the PNP officer dashboard

-- 1. Get recent evidence files for officer's cases
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
) AS $$
BEGIN
  RETURN QUERY
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Get officer's weekly activity (cases by day)
CREATE OR REPLACE FUNCTION get_officer_weekly_activity(
  p_officer_id TEXT,
  p_days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  activity_date DATE,
  cases_updated INTEGER,
  status_changes INTEGER,
  evidence_uploaded INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '1 day' * (p_days_back - 1),
      CURRENT_DATE,
      INTERVAL '1 day'
    )::DATE AS activity_date
  ),
  case_updates AS (
    SELECT 
      DATE(sh.timestamp) AS update_date,
      COUNT(DISTINCT sh.complaint_id) AS cases_updated,
      COUNT(*) AS status_changes
    FROM status_history sh
    JOIN complaints c ON sh.complaint_id = c.id
    WHERE c.assigned_officer_id = p_officer_id
      AND sh.timestamp >= CURRENT_DATE - INTERVAL '1 day' * p_days_back
    GROUP BY DATE(sh.timestamp)
  ),
  evidence_uploads AS (
    SELECT 
      DATE(ef.created_at) AS upload_date,
      COUNT(*) AS evidence_count
    FROM evidence_files ef
    JOIN complaints c ON ef.complaint_id = c.id
    WHERE c.assigned_officer_id = p_officer_id
      AND ef.created_at >= CURRENT_DATE - INTERVAL '1 day' * p_days_back
    GROUP BY DATE(ef.created_at)
  )
  SELECT 
    ds.activity_date,
    COALESCE(cu.cases_updated, 0)::INTEGER AS cases_updated,
    COALESCE(cu.status_changes, 0)::INTEGER AS status_changes,
    COALESCE(eu.evidence_count, 0)::INTEGER AS evidence_uploaded
  FROM date_series ds
  LEFT JOIN case_updates cu ON ds.activity_date = cu.update_date
  LEFT JOIN evidence_uploads eu ON ds.activity_date = eu.upload_date
  ORDER BY ds.activity_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Get officer's performance metrics with trends
CREATE OR REPLACE FUNCTION get_officer_performance_metrics(
  p_officer_id TEXT
)
RETURNS TABLE (
  metric_name TEXT,
  current_value NUMERIC,
  previous_value NUMERIC,
  trend_direction TEXT,
  percentage_change NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH current_month AS (
    SELECT 
      COUNT(*) FILTER (WHERE status = 'Resolved') AS resolved_this_month,
      COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS new_cases_this_month,
      AVG(EXTRACT(DAY FROM (updated_at - created_at))) FILTER (WHERE status IN ('Resolved', 'Dismissed')) AS avg_resolution_days
    FROM complaints
    WHERE assigned_officer_id = p_officer_id
      AND updated_at >= DATE_TRUNC('month', CURRENT_DATE)
  ),
  previous_month AS (
    SELECT 
      COUNT(*) FILTER (WHERE status = 'Resolved') AS resolved_last_month,
      COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') 
                         AND created_at < DATE_TRUNC('month', CURRENT_DATE)) AS new_cases_last_month,
      AVG(EXTRACT(DAY FROM (updated_at - created_at))) FILTER (WHERE status IN ('Resolved', 'Dismissed')) AS avg_resolution_days
    FROM complaints
    WHERE assigned_officer_id = p_officer_id
      AND updated_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      AND updated_at < DATE_TRUNC('month', CURRENT_DATE)
  )
  SELECT 
    'Cases Resolved' AS metric_name,
    cm.resolved_this_month AS current_value,
    pm.resolved_last_month AS previous_value,
    CASE 
      WHEN cm.resolved_this_month > pm.resolved_last_month THEN 'up'
      WHEN cm.resolved_this_month < pm.resolved_last_month THEN 'down'
      ELSE 'stable'
    END AS trend_direction,
    CASE 
      WHEN pm.resolved_last_month > 0 THEN 
        ROUND(((cm.resolved_this_month - pm.resolved_last_month)::NUMERIC / pm.resolved_last_month) * 100, 1)
      ELSE 0
    END AS percentage_change
  FROM current_month cm, previous_month pm
  
  UNION ALL
  
  SELECT 
    'New Cases' AS metric_name,
    cm.new_cases_this_month AS current_value,
    pm.new_cases_last_month AS previous_value,
    CASE 
      WHEN cm.new_cases_this_month > pm.new_cases_last_month THEN 'up'
      WHEN cm.new_cases_this_month < pm.new_cases_last_month THEN 'down'
      ELSE 'stable'
    END AS trend_direction,
    CASE 
      WHEN pm.new_cases_last_month > 0 THEN 
        ROUND(((cm.new_cases_this_month - pm.new_cases_last_month)::NUMERIC / pm.new_cases_last_month) * 100, 1)
      ELSE 0
    END AS percentage_change
  FROM current_month cm, previous_month pm
  
  UNION ALL
  
  SELECT 
    'Avg Resolution Time' AS metric_name,
    ROUND(cm.avg_resolution_days, 1) AS current_value,
    ROUND(pm.avg_resolution_days, 1) AS previous_value,
    CASE 
      WHEN cm.avg_resolution_days < pm.avg_resolution_days THEN 'down' -- Lower is better
      WHEN cm.avg_resolution_days > pm.avg_resolution_days THEN 'up'
      ELSE 'stable'
    END AS trend_direction,
    CASE 
      WHEN pm.avg_resolution_days > 0 THEN 
        ROUND(((cm.avg_resolution_days - pm.avg_resolution_days) / pm.avg_resolution_days) * 100, 1)
      ELSE 0
    END AS percentage_change
  FROM current_month cm, previous_month pm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Get officer's upcoming deadlines and tasks
CREATE OR REPLACE FUNCTION get_officer_upcoming_tasks(
  p_officer_id TEXT,
  p_days_ahead INTEGER DEFAULT 7
)
RETURNS TABLE (
  task_type TEXT,
  complaint_id UUID,
  complaint_number TEXT,
  task_description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT,
  days_until_due INTEGER
) AS $$
BEGIN
  RETURN QUERY
  -- Cases requiring status update (no update in 3 days)
  SELECT 
    'Status Update Required' AS task_type,
    c.id AS complaint_id,
    c.complaint_number,
    'Case has not been updated in 3 days' AS task_description,
    c.updated_at + INTERVAL '3 days' AS due_date,
    c.priority,
    EXTRACT(DAY FROM (c.updated_at + INTERVAL '3 days' - NOW()))::INTEGER AS days_until_due
  FROM complaints c
  WHERE c.assigned_officer_id = p_officer_id
    AND c.status IN ('Pending', 'Under Investigation')
    AND c.updated_at < NOW() - INTERVAL '3 days'
    AND c.updated_at + INTERVAL '3 days' <= NOW() + INTERVAL '1 day' * p_days_ahead
  
  UNION ALL
  
  -- Cases with "Requires More Information" status waiting for citizen response
  SELECT 
    'Awaiting Citizen Response' AS task_type,
    c.id AS complaint_id,
    c.complaint_number,
    CONCAT('Requested info on ', TO_CHAR(c.updated_at, 'Mon DD')) AS task_description,
    c.updated_at + INTERVAL '7 days' AS due_date,
    c.priority,
    EXTRACT(DAY FROM (c.updated_at + INTERVAL '7 days' - NOW()))::INTEGER AS days_until_due
  FROM complaints c
  WHERE c.assigned_officer_id = p_officer_id
    AND c.status = 'Requires More Information'
    AND c.last_citizen_update IS NULL -- Citizen hasn't responded yet
    AND c.updated_at + INTERVAL '7 days' <= NOW() + INTERVAL '1 day' * p_days_ahead
  
  UNION ALL
  
  -- High priority cases older than 24 hours
  SELECT 
    'High Priority Review' AS task_type,
    c.id AS complaint_id,
    c.complaint_number,
    'High priority case requires immediate attention' AS task_description,
    c.created_at + INTERVAL '1 day' AS due_date,
    'high' AS priority,
    CASE 
      WHEN c.created_at + INTERVAL '1 day' < NOW() THEN 0
      ELSE EXTRACT(DAY FROM (c.created_at + INTERVAL '1 day' - NOW()))::INTEGER
    END AS days_until_due
  FROM complaints c
  WHERE c.assigned_officer_id = p_officer_id
    AND c.priority = 'high'
    AND c.status = 'Pending'
    AND c.created_at < NOW() - INTERVAL '1 day'
  
  ORDER BY days_until_due ASC, priority DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Get real-time notification count for officer
CREATE OR REPLACE FUNCTION get_officer_notification_summary(
  p_officer_id TEXT
)
RETURNS TABLE (
  unread_notifications INTEGER,
  new_cases_today INTEGER,
  pending_updates INTEGER,
  total_active_cases INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM notifications WHERE user_id = p_officer_id AND is_read = FALSE)::INTEGER AS unread_notifications,
    (SELECT COUNT(*) FROM complaints WHERE assigned_officer_id = p_officer_id AND DATE(created_at) = CURRENT_DATE)::INTEGER AS new_cases_today,
    (SELECT COUNT(*) FROM complaints WHERE assigned_officer_id = p_officer_id AND status = 'Requires More Information' AND last_citizen_update > updated_at)::INTEGER AS pending_updates,
    (SELECT COUNT(*) FROM complaints WHERE assigned_officer_id = p_officer_id AND status IN ('Pending', 'Under Investigation', 'Requires More Information'))::INTEGER AS total_active_cases;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_officer_recent_evidence TO authenticated;
GRANT EXECUTE ON FUNCTION get_officer_weekly_activity TO authenticated;
GRANT EXECUTE ON FUNCTION get_officer_performance_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_officer_upcoming_tasks TO authenticated;
GRANT EXECUTE ON FUNCTION get_officer_notification_summary TO authenticated;