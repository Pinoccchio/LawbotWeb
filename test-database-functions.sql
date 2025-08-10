-- Test if the functions exist and debug any issues
-- Run this AFTER running database-functions.sql

-- 1. Check if functions were created
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

-- 2. Test get_officer_recent_evidence function
-- Replace 'test_officer_id' with an actual officer Firebase UID from your database
SELECT * FROM get_officer_recent_evidence('test_officer_id', 5);

-- 3. If you get permission errors, check the grants
SELECT 
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_name IN (
    'get_officer_recent_evidence',
    'get_officer_weekly_activity',
    'get_officer_performance_metrics',
    'get_officer_upcoming_tasks',
    'get_officer_notification_summary'
);

-- 4. Get a sample officer ID for testing
SELECT firebase_uid, full_name 
FROM pnp_officer_profiles 
WHERE status = 'active' 
LIMIT 1;

-- 5. Check if there are any complaints assigned to officers
SELECT 
    c.assigned_officer_id,
    COUNT(*) as case_count,
    COUNT(DISTINCT ef.id) as evidence_count
FROM complaints c
LEFT JOIN evidence_files ef ON ef.complaint_id = c.id
WHERE c.assigned_officer_id IS NOT NULL
GROUP BY c.assigned_officer_id
LIMIT 5;