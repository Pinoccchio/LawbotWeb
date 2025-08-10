-- Verify the functions are working properly

-- 1. Check if all functions were created
SELECT 
    p.proname AS function_name,
    pg_catalog.pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_catalog.pg_proc p
WHERE p.proname IN (
    'get_officer_recent_evidence',
    'get_officer_weekly_activity', 
    'get_officer_performance_metrics',
    'get_officer_upcoming_tasks',
    'get_officer_notification_summary'
)
ORDER BY p.proname;

-- 2. Get a test officer ID
SELECT 
    firebase_uid,
    full_name,
    badge_number
FROM pnp_officer_profiles
WHERE status = 'active'
LIMIT 1;

-- 3. Test each function with a real officer ID
-- Replace 'YOUR_OFFICER_FIREBASE_UID' with the firebase_uid from query #2

-- Test recent evidence
SELECT * FROM get_officer_recent_evidence('YOUR_OFFICER_FIREBASE_UID', 5);

-- Test weekly activity
SELECT * FROM get_officer_weekly_activity('YOUR_OFFICER_FIREBASE_UID', 7);

-- Test performance metrics
SELECT * FROM get_officer_performance_metrics('YOUR_OFFICER_FIREBASE_UID');

-- Test upcoming tasks
SELECT * FROM get_officer_upcoming_tasks('YOUR_OFFICER_FIREBASE_UID', 7);

-- Test notification summary
SELECT * FROM get_officer_notification_summary('YOUR_OFFICER_FIREBASE_UID');

-- 4. Check if there are complaints assigned to any officer
SELECT 
    assigned_officer_id,
    COUNT(*) as case_count,
    COUNT(CASE WHEN status IN ('Pending', 'Under Investigation', 'Requires More Information') THEN 1 END) as active_cases
FROM complaints
WHERE assigned_officer_id IS NOT NULL
GROUP BY assigned_officer_id
ORDER BY case_count DESC
LIMIT 5;