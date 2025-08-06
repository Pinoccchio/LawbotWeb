-- Test Data Setup for PNP Officer My Cases View
-- This script creates test data for development and testing purposes

-- Step 1: Create a test PNP officer profile
-- Note: Replace 'firebase_officer_001' with actual Firebase UID after creating test user
INSERT INTO pnp_officer_profiles (
    firebase_uid,
    email,
    full_name,
    phone_number,
    badge_number,
    rank,
    unit_id,
    region,
    status,
    availability_status,
    total_cases,
    active_cases,
    resolved_cases,
    success_rate,
    created_at,
    updated_at
) VALUES (
    'firebase_officer_001', -- Replace with actual Firebase UID
    'test.officer@pnp.gov.ph',
    'Juan Dela Cruz',
    '+63 912 345 6789',
    'PNP-12345',
    'Police Officer III',
    NULL, -- Will be set later after creating unit
    'National Capital Region (NCR)',
    'active',
    'available',
    10,
    3,
    7,
    70,
    NOW(),
    NOW()
) ON CONFLICT (firebase_uid) DO UPDATE
SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Step 2: Create test complaints/cases
-- These will be assigned to the test officer

-- Case 1: Online Banking Fraud (High Priority)
INSERT INTO complaints (
    id,
    user_id,
    complaint_number,
    title,
    description,
    crime_type,
    status,
    priority,
    risk_score,
    estimated_loss,
    incident_date_time,
    incident_location,
    assigned_officer,
    assigned_officer_id,
    assigned_unit,
    platform_website,
    account_reference,
    ai_priority,
    ai_risk_score,
    ai_confidence_score,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'user_test_001',
    'CYB-2025-TEST-001',
    'Online Banking Fraud Case',
    'Unauthorized access to online banking account resulting in fraudulent transactions totaling ₱50,000',
    'Online Banking Fraud',
    'Under Investigation',
    'high',
    85,
    50000,
    NOW() - INTERVAL '2 days',
    'BPI Branch, Makati City',
    'Juan Dela Cruz',
    (SELECT id FROM pnp_officer_profiles WHERE firebase_uid = 'firebase_officer_001'),
    'Economic Offenses Wing',
    'BPI Online',
    'ACC-789012345',
    'high',
    88,
    92,
    NOW() - INTERVAL '2 days',
    NOW()
) ON CONFLICT (complaint_number) DO UPDATE
SET 
    status = EXCLUDED.status,
    updated_at = NOW();

-- Case 2: Phishing Attack (Medium Priority)
INSERT INTO complaints (
    id,
    user_id,
    complaint_number,
    title,
    description,
    crime_type,
    status,
    priority,
    risk_score,
    estimated_loss,
    incident_date_time,
    incident_location,
    assigned_officer,
    assigned_officer_id,
    assigned_unit,
    platform_website,
    account_reference,
    ai_priority,
    ai_risk_score,
    ai_confidence_score,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'user_test_002',
    'CYB-2025-TEST-002',
    'Phishing Email Attack',
    'Received suspicious email claiming to be from bank, requesting login credentials',
    'Phishing',
    'Pending',
    'medium',
    65,
    0,
    NOW() - INTERVAL '1 day',
    'Online - Email',
    'Juan Dela Cruz',
    (SELECT id FROM pnp_officer_profiles WHERE firebase_uid = 'firebase_officer_001'),
    'Cyber Crime Investigation Cell',
    'Gmail',
    'phishing_email_001',
    'medium',
    68,
    85,
    NOW() - INTERVAL '1 day',
    NOW()
) ON CONFLICT (complaint_number) DO UPDATE
SET 
    status = EXCLUDED.status,
    updated_at = NOW();

-- Case 3: Social Media Harassment (Low Priority)
INSERT INTO complaints (
    id,
    user_id,
    complaint_number,
    title,
    description,
    crime_type,
    status,
    priority,
    risk_score,
    estimated_loss,
    incident_date_time,
    incident_location,
    assigned_officer,
    assigned_officer_id,
    assigned_unit,
    platform_website,
    account_reference,
    ai_priority,
    ai_risk_score,
    ai_confidence_score,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'user_test_003',
    'CYB-2025-TEST-003',
    'Social Media Harassment',
    'Continuous harassment and threats received through social media platforms',
    'Online Harassment',
    'Requires More Information',
    'low',
    45,
    0,
    NOW() - INTERVAL '3 days',
    'Online - Social Media',
    'Juan Dela Cruz',
    (SELECT id FROM pnp_officer_profiles WHERE firebase_uid = 'firebase_officer_001'),
    'Cyber Crime Against Women and Children',
    'Facebook',
    '@victim_user',
    'low',
    48,
    78,
    NOW() - INTERVAL '3 days',
    NOW()
) ON CONFLICT (complaint_number) DO UPDATE
SET 
    status = EXCLUDED.status,
    updated_at = NOW();

-- Step 3: Add test evidence files for the cases
-- Evidence for Case 1
INSERT INTO evidence_files (
    id,
    complaint_id,
    file_name,
    file_type,
    file_size,
    file_url,
    uploaded_by,
    description,
    category,
    is_verified,
    uploaded_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM complaints WHERE complaint_number = 'CYB-2025-TEST-001'),
    'banking_screenshot.png',
    'image/png',
    2048576,
    'https://example.com/evidence/banking_screenshot.png',
    'Juan Dela Cruz',
    'Screenshot showing unauthorized transactions',
    'image',
    true,
    NOW() - INTERVAL '1 day'
) ON CONFLICT DO NOTHING;

INSERT INTO evidence_files (
    id,
    complaint_id,
    file_name,
    file_type,
    file_size,
    file_url,
    uploaded_by,
    description,
    category,
    is_verified,
    uploaded_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM complaints WHERE complaint_number = 'CYB-2025-TEST-001'),
    'transaction_receipt.pdf',
    'application/pdf',
    1024000,
    'https://example.com/evidence/transaction_receipt.pdf',
    'Juan Dela Cruz',
    'Bank transaction receipt showing fraudulent activity',
    'pdf',
    false,
    NOW() - INTERVAL '12 hours'
) ON CONFLICT DO NOTHING;

-- Evidence for Case 2
INSERT INTO evidence_files (
    id,
    complaint_id,
    file_name,
    file_type,
    file_size,
    file_url,
    uploaded_by,
    description,
    category,
    is_verified,
    uploaded_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM complaints WHERE complaint_number = 'CYB-2025-TEST-002'),
    'phishing_email.eml',
    'message/rfc822',
    45632,
    'https://example.com/evidence/phishing_email.eml',
    'Juan Dela Cruz',
    'Original phishing email with headers',
    'document',
    true,
    NOW() - INTERVAL '6 hours'
) ON CONFLICT DO NOTHING;

-- Evidence for Case 3
INSERT INTO evidence_files (
    id,
    complaint_id,
    file_name,
    file_type,
    file_size,
    file_url,
    uploaded_by,
    description,
    category,
    is_verified,
    uploaded_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM complaints WHERE complaint_number = 'CYB-2025-TEST-003'),
    'facebook_threats.png',
    'image/png',
    1234567,
    'https://example.com/evidence/facebook_threats.png',
    'Juan Dela Cruz',
    'Screenshots of threatening messages on Facebook',
    'image',
    false,
    NOW() - INTERVAL '2 days'
) ON CONFLICT DO NOTHING;

INSERT INTO evidence_files (
    id,
    complaint_id,
    file_name,
    file_type,
    file_size,
    file_url,
    uploaded_by,
    description,
    category,
    is_verified,
    uploaded_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM complaints WHERE complaint_number = 'CYB-2025-TEST-003'),
    'harassment_video.mp4',
    'video/mp4',
    5242880,
    'https://example.com/evidence/harassment_video.mp4',
    'Juan Dela Cruz',
    'Video evidence of online harassment',
    'video',
    false,
    NOW() - INTERVAL '1 day'
) ON CONFLICT DO NOTHING;

-- Step 4: Create test user profiles for complainants
INSERT INTO user_profiles (
    id,
    firebase_uid,
    email,
    full_name,
    phone_number,
    user_type,
    created_at,
    updated_at
) VALUES (
    'user_test_001',
    'firebase_user_test_001',
    'victim1@email.com',
    'Maria Santos',
    '+63 917 123 4567',
    'CLIENT',
    NOW() - INTERVAL '10 days',
    NOW()
) ON CONFLICT (id) DO UPDATE
SET 
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

INSERT INTO user_profiles (
    id,
    firebase_uid,
    email,
    full_name,
    phone_number,
    user_type,
    created_at,
    updated_at
) VALUES (
    'user_test_002',
    'firebase_user_test_002',
    'victim2@email.com',
    'Pedro Garcia',
    '+63 916 987 6543',
    'CLIENT',
    NOW() - INTERVAL '10 days',
    NOW()
) ON CONFLICT (id) DO UPDATE
SET 
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

INSERT INTO user_profiles (
    id,
    firebase_uid,
    email,
    full_name,
    phone_number,
    user_type,
    created_at,
    updated_at
) VALUES (
    'user_test_003',
    'firebase_user_test_003',
    'victim3@email.com',
    'Ana Reyes',
    '+63 915 555 1234',
    'CLIENT',
    NOW() - INTERVAL '10 days',
    NOW()
) ON CONFLICT (id) DO UPDATE
SET 
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

-- Step 5: Optional - Create case assignments if table exists
-- This creates formal assignments in the case_assignments table
INSERT INTO case_assignments (
    id,
    complaint_id,
    officer_id,
    assignment_type,
    status,
    notes,
    created_at
) 
SELECT 
    gen_random_uuid(),
    c.id,
    (SELECT id FROM pnp_officer_profiles WHERE firebase_uid = 'firebase_officer_001'),
    'primary',
    'active',
    'Test assignment for development',
    NOW()
FROM complaints c
WHERE c.complaint_number IN ('CYB-2025-TEST-001', 'CYB-2025-TEST-002', 'CYB-2025-TEST-003')
ON CONFLICT DO NOTHING;

-- Verification Query - Run this to check if test data was created successfully
SELECT 
    'Officer Profile' as data_type,
    COUNT(*) as count 
FROM pnp_officer_profiles 
WHERE firebase_uid = 'firebase_officer_001'
UNION ALL
SELECT 
    'Test Complaints' as data_type,
    COUNT(*) as count 
FROM complaints 
WHERE complaint_number LIKE 'CYB-2025-TEST-%'
UNION ALL
SELECT 
    'Evidence Files' as data_type,
    COUNT(*) as count 
FROM evidence_files 
WHERE complaint_id IN (
    SELECT id FROM complaints WHERE complaint_number LIKE 'CYB-2025-TEST-%'
)
UNION ALL
SELECT 
    'User Profiles' as data_type,
    COUNT(*) as count 
FROM user_profiles 
WHERE id LIKE 'user_test_%';

-- Instructions:
-- 1. First create a test Firebase user and note the UID
-- 2. Replace 'firebase_officer_001' with the actual Firebase UID
-- 3. Run this SQL script in your Supabase SQL editor
-- 4. Login to the web app with the test Firebase user
-- 5. Navigate to My Cases to see the test cases