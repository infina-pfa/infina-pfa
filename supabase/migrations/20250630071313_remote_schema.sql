alter table "public"."goals" add column "user_id" uuid not null;

CREATE INDEX idx_budget_transactions_budget_created ON public.budget_transactions USING btree (budget_id, created_at DESC);

CREATE INDEX idx_budget_transactions_budget_id ON public.budget_transactions USING btree (budget_id);

CREATE INDEX idx_budget_transactions_transaction_id ON public.budget_transactions USING btree (transaction_id);

CREATE INDEX idx_budget_transactions_user_id ON public.budget_transactions USING btree (user_id);

CREATE INDEX idx_budgets_user_id ON public.budgets USING btree (user_id);

CREATE INDEX idx_budgets_user_month_year ON public.budgets USING btree (user_id, year, month);

CREATE INDEX idx_conversations_user_id ON public.conversations USING btree (user_id);

CREATE INDEX idx_debt_transactions_debt_created ON public.debt_transactions USING btree (debt_id, created_at DESC);

CREATE INDEX idx_debt_transactions_debt_id ON public.debt_transactions USING btree (debt_id);

CREATE INDEX idx_debt_transactions_transaction_id ON public.debt_transactions USING btree (transaction_id);

CREATE INDEX idx_debt_transactions_user_id ON public.debt_transactions USING btree (user_id);

CREATE INDEX idx_debts_due_date ON public.debts USING btree (due_date);

CREATE INDEX idx_debts_user_id ON public.debts USING btree (user_id);

CREATE INDEX idx_goal_transactions_goal_created ON public.goal_transactions USING btree (goal_id, created_at DESC);

CREATE INDEX idx_goal_transactions_goal_id ON public.goal_transactions USING btree (goal_id);

CREATE INDEX idx_goal_transactions_transaction_id ON public.goal_transactions USING btree (transaction_id);

CREATE INDEX idx_goal_transactions_user_id ON public.goal_transactions USING btree (user_id);

CREATE INDEX idx_goals_active ON public.goals USING btree (user_id, due_date) WHERE (current_amount < target_amount);

CREATE INDEX idx_goals_due_date ON public.goals USING btree (due_date);

CREATE INDEX idx_goals_user_id ON public.goals USING btree (user_id);

CREATE INDEX idx_messages_conversation_created ON public.messages USING btree (conversation_id, created_at DESC);

CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);

CREATE INDEX idx_messages_sender_type ON public.messages USING btree (sender, type);

CREATE INDEX idx_messages_user_id ON public.messages USING btree (user_id);

CREATE INDEX idx_transactions_recurring ON public.transactions USING btree (recurring) WHERE (recurring > 0);

CREATE INDEX idx_transactions_type ON public.transactions USING btree (type);

CREATE INDEX idx_transactions_user_created ON public.transactions USING btree (user_id, created_at DESC);

CREATE INDEX idx_transactions_user_id ON public.transactions USING btree (user_id);

CREATE INDEX idx_transactions_user_type ON public.transactions USING btree (user_id, type);

CREATE INDEX idx_users_user_id ON public.users USING btree (user_id);

alter table "public"."goals" add constraint "goals_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."goals" validate constraint "goals_user_id_fkey";

create policy "budget_transactions_delete_own"
on "public"."budget_transactions"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "budget_transactions_insert_own"
on "public"."budget_transactions"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "budget_transactions_select_own"
on "public"."budget_transactions"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "budget_transactions_update_own"
on "public"."budget_transactions"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "budgets_delete_own"
on "public"."budgets"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "budgets_insert_own"
on "public"."budgets"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "budgets_select_own"
on "public"."budgets"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "budgets_update_own"
on "public"."budgets"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "conversations_delete_own"
on "public"."conversations"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "conversations_insert_own"
on "public"."conversations"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "conversations_select_own"
on "public"."conversations"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "conversations_update_own"
on "public"."conversations"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "debt_transactions_delete_own"
on "public"."debt_transactions"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "debt_transactions_insert_own"
on "public"."debt_transactions"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "debt_transactions_select_own"
on "public"."debt_transactions"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "debt_transactions_update_own"
on "public"."debt_transactions"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "debts_delete_own"
on "public"."debts"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "debts_insert_own"
on "public"."debts"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "debts_select_own"
on "public"."debts"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "debts_update_own"
on "public"."debts"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "goal_transactions_delete_own"
on "public"."goal_transactions"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "goal_transactions_insert_own"
on "public"."goal_transactions"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "goal_transactions_select_own"
on "public"."goal_transactions"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "goal_transactions_update_own"
on "public"."goal_transactions"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "goals_delete_own"
on "public"."goals"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "goals_insert_own"
on "public"."goals"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "goals_select_own"
on "public"."goals"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "goals_update_own"
on "public"."goals"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "messages_delete_own"
on "public"."messages"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "messages_insert_own"
on "public"."messages"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "messages_select_own"
on "public"."messages"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "messages_update_own"
on "public"."messages"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "transactions_delete_own"
on "public"."transactions"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "transactions_insert_own"
on "public"."transactions"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "transactions_select_own"
on "public"."transactions"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "transactions_update_own"
on "public"."transactions"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "users_insert_own"
on "public"."users"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "users_select_own"
on "public"."users"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "users_update_own"
on "public"."users"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));



