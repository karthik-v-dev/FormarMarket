-- ==============================================================================
-- MONTHLY CUSTOMER TIER RECALCULATION CRON JOB QUERY (PostgreSQL & MySQL)
-- ==============================================================================
-- Logic:
-- Recalculate customer tier on the 1st of every month at 00:01 AM
-- based on delivered/completed order frequency in the preceding 30 days / calendar month:
--   * Normal Customer (0-1 order/month): 0% discount
--   * Silver Customer (2-3 orders/month): 8% discount
--   * Gold Customer (4-6 orders/month): 15% discount
--   * Platinum Customer (>6 orders/month): 20% discount
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. MYSQL IMPLEMENTATION (MySQL Event Scheduler or Scheduled Query)
-- ------------------------------------------------------------------------------

-- Ensure Event Scheduler is enabled
SET GLOBAL event_scheduler = ON;

-- Optional: Add loyalty tier columns to users table if not already present
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS tier_status ENUM('normal', 'silver', 'gold', 'platinum') DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS monthly_order_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tier_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create Monthly Recalculation Stored Procedure
DELIMITER $$

DROP PROCEDURE IF EXISTS RecalculateMonthlyCustomerTiers$$

CREATE PROCEDURE RecalculateMonthlyCustomerTiers()
BEGIN
  -- Temporary table with last 30 days completed orders per user
  CREATE TEMPORARY TABLE IF NOT EXISTS MonthlyOrderStats AS (
    SELECT 
      u.id AS user_id,
      COUNT(o.id) AS orders_last_month
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id 
      AND o.status IN ('CONFIRMED', 'DELIVERED')
      AND o.placed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY u.id
  );

  -- Update users table with newly calculated tier based on order thresholds
  UPDATE users u
  JOIN MonthlyOrderStats s ON u.id = s.user_id
  SET 
    u.monthly_order_count = s.orders_last_month,
    u.tier_status = CASE 
      WHEN s.orders_last_month > 6 THEN 'platinum'
      WHEN s.orders_last_month >= 4 THEN 'gold'
      WHEN s.orders_last_month >= 2 THEN 'silver'
      ELSE 'normal'
    END,
    u.tier_updated_at = NOW();

  DROP TEMPORARY TABLE IF EXISTS MonthlyOrderStats;
END$$

DELIMITER ;

-- Schedule Monthly Cron Event (Runs on 1st of every month at 00:01 AM)
DROP EVENT IF EXISTS monthly_customer_tier_update_event;

CREATE EVENT monthly_customer_tier_update_event
ON SCHEDULE EVERY 1 MONTH
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 1 MINUTE)
DO
  CALL RecalculateMonthlyCustomerTiers();


-- ------------------------------------------------------------------------------
-- 2. POSTGRESQL IMPLEMENTATION (Compatible with pg_cron or Cloud SQL Cron)
-- ------------------------------------------------------------------------------

-- Schema migration check:
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='tier_status') THEN
    ALTER TABLE users ADD COLUMN tier_status VARCHAR(20) DEFAULT 'normal';
    ALTER TABLE users ADD COLUMN monthly_order_count INT DEFAULT 0;
    ALTER TABLE users ADD COLUMN tier_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Recalculation Function
CREATE OR REPLACE FUNCTION recalculate_monthly_customer_tiers()
RETURNS void AS $$
BEGIN
  WITH monthly_counts AS (
    SELECT 
      u.id AS user_id,
      COUNT(o.id) AS order_count
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id 
      AND o.status IN ('CONFIRMED', 'DELIVERED')
      AND o.placed_at >= (CURRENT_TIMESTAMP - INTERVAL '30 days')
    GROUP BY u.id
  )
  UPDATE users u
  SET 
    monthly_order_count = mc.order_count,
    tier_status = CASE 
      WHEN mc.order_count > 6 THEN 'platinum'
      WHEN mc.order_count >= 4 THEN 'gold'
      WHEN mc.order_count >= 2 THEN 'silver'
      ELSE 'normal'
    END,
    tier_updated_at = CURRENT_TIMESTAMP
  FROM monthly_counts mc
  WHERE u.id = mc.user_id;
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron (if extension enabled):
-- SELECT cron.schedule('monthly-tier-job', '1 0 1 * *', 'SELECT recalculate_monthly_customer_tiers()');
