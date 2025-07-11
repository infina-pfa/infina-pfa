alter table "public"."users" drop constraint "check_financial_stage_valid";

alter table "public"."users" drop constraint "check_stage_confidence_range";

drop index if exists "public"."idx_users_financial_stage";

drop index if exists "public"."idx_users_onboarding_completed";

alter table "public"."users" drop column "financial_stage";

alter table "public"."users" drop column "onboarding_completed";

alter table "public"."users" drop column "stage_confidence";

alter table "public"."users" drop column "stage_reasoning";


