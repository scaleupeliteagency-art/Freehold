DROP FUNCTION IF EXISTS public.get_goal_leaderboard();

CREATE FUNCTION public.get_goal_leaderboard()
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  display_name TEXT,
  progress NUMERIC,
  current_value NUMERIC,
  target_value NUMERIC,
  unit TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  WITH goal_progress AS (
    SELECT
      p.user_id,
      COALESCE(NULLIF(p.name, ''), 'Ledger member') AS display_name,
      ROUND(GREATEST(0, LEAST(100, COALESCE(g.current_value, g.starting_value, 0) / NULLIF(g.target_value, 0) * 100)), 1) AS progress,
      COALESCE(g.current_value, g.starting_value, 0) AS current_value,
      g.target_value,
      g.unit,
      ROW_NUMBER() OVER (PARTITION BY p.user_id ORDER BY COALESCE(g.current_value, g.starting_value, 0) / NULLIF(g.target_value, 0) DESC NULLS LAST) AS goal_rank
    FROM profiles p
    JOIN systems s ON s.user_id = p.user_id
    JOIN north_star_goals g ON g.system_id = s.id
    WHERE g.target_value IS NOT NULL AND g.target_value > 0
  ), ranked_users AS (
    SELECT *, DENSE_RANK() OVER (ORDER BY progress DESC) AS user_rank
    FROM goal_progress
    WHERE goal_rank = 1
  )
  SELECT user_rank AS rank, user_id, display_name, progress, current_value, target_value, unit
  FROM ranked_users
  ORDER BY user_rank, display_name;
$$;

REVOKE ALL ON FUNCTION public.get_goal_leaderboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_goal_leaderboard() TO authenticated;
