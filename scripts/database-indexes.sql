
CREATE INDEX IF NOT EXISTS idx_budgets_user_category_month_year 
ON budgets(user_id, category, month, year);

CREATE INDEX IF NOT EXISTS idx_budget_transactions_user_created 
ON budget_transactions(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_transactions_type_created 
ON transactions(type, created_at);

CREATE INDEX IF NOT EXISTS idx_goal_transactions_user_goal 
ON goal_transactions(user_id, goal_id);

CREATE INDEX IF NOT EXISTS idx_goals_user_created 
ON goals(user_id, created_at);

ANALYZE budgets;
ANALYZE budget_transactions;
ANALYZE transactions;
ANALYZE goal_transactions;
ANALYZE goals;