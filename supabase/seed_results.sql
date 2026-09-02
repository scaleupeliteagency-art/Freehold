-- Seed script for result_definitions and result_records
-- Assumes you have at least one active system in 'systems' table

DO $$
DECLARE
  v_system_id UUID;
  v_def_revenue UUID;
  v_def_meetings UUID;
BEGIN
  -- Get active system
  SELECT id INTO v_system_id FROM systems WHERE status = 'active' LIMIT 1;
  
  IF v_system_id IS NULL THEN
    RAISE NOTICE 'No active system found. Skipping seed.';
    RETURN;
  END IF;

  -- Create Monthly Revenue Definition
  INSERT INTO result_definitions (system_id, name, description, type, unit, direction, target, baseline, category, measurement_period)
  VALUES (
    v_system_id, 
    'Monthly Revenue', 
    'Recurring revenue generated per month.', 
    'Currency', 
    'USD', 
    'Higher is better', 
    700, 
    430, 
    'Business', 
    'Monthly'
  ) RETURNING id INTO v_def_revenue;

  -- Create Qualified Meetings Definition
  INSERT INTO result_definitions (system_id, name, description, type, unit, direction, target, baseline, category, measurement_period)
  VALUES (
    v_system_id, 
    'Qualified Meetings', 
    'Number of ICP qualified sales meetings held.', 
    'Number', 
    'meetings', 
    'Higher is better', 
    30, 
    8, 
    'Growth', 
    'Weekly'
  ) RETURNING id INTO v_def_meetings;

  -- Seed historical records for Revenue
  INSERT INTO result_records (result_definition_id, period_label, period_start, period_end, actual_value, target_value, baseline_value, created_at)
  VALUES 
    (v_def_revenue, 'June 2026', '2026-06-01', '2026-06-30', 420, 700, 430, NOW() - INTERVAL '90 days'),
    (v_def_revenue, 'July 2026', '2026-07-01', '2026-07-31', 500, 700, 430, NOW() - INTERVAL '60 days'),
    (v_def_revenue, 'August 2026', '2026-08-01', '2026-08-31', 620, 700, 430, NOW() - INTERVAL '30 days'),
    (v_def_revenue, 'September 2026', '2026-09-01', '2026-09-30', 685, 700, 430, NOW() - INTERVAL '1 days');

  -- Seed historical records for Meetings
  INSERT INTO result_records (result_definition_id, period_label, period_start, period_end, actual_value, target_value, baseline_value, created_at)
  VALUES 
    (v_def_meetings, 'Week 34', '2026-08-17', '2026-08-23', 12, 30, 8, NOW() - INTERVAL '14 days'),
    (v_def_meetings, 'Week 35', '2026-08-24', '2026-08-30', 15, 30, 8, NOW() - INTERVAL '7 days'),
    (v_def_meetings, 'Week 36', '2026-08-31', '2026-09-06', 18, 30, 8, NOW() - INTERVAL '1 days');

END $$;
