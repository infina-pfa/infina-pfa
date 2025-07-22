alter table "public"."users" add column "financial_metadata" json;

alter table "public"."users" alter column "budgeting_style" set default 'detail_tracker'::budgeting_style;


