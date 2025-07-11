create extension if not exists "vector" with schema "extensions";


create table "public"."onboarding_chat" (
    "id" uuid not null default gen_random_uuid(),
    "conversation_id" uuid not null,
    "user_id" uuid not null,
    "sender" message_sender not null,
    "content" text not null,
    "component_id" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."onboarding_chat" enable row level security;

create table "public"."onboarding_profiles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "profile_data" jsonb not null default '{}'::jsonb,
    "is_completed" boolean default false,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."onboarding_profiles" enable row level security;

create table "public"."onboarding_responses" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "component_id" text not null,
    "response_data" jsonb not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."onboarding_responses" enable row level security;

alter table "public"."users" add column "financial_stage" text;

alter table "public"."users" add column "onboarding_completed" boolean default false;

alter table "public"."users" add column "onboarding_completed_at" timestamp with time zone;

alter table "public"."users" add column "stage_confidence" real;

alter table "public"."users" add column "stage_reasoning" text;

CREATE INDEX idx_onboarding_chat_conv_created ON public.onboarding_chat USING btree (conversation_id, created_at);

CREATE INDEX idx_onboarding_profiles_completed ON public.onboarding_profiles USING btree (is_completed);

CREATE INDEX idx_onboarding_profiles_created_at ON public.onboarding_profiles USING btree (created_at);

CREATE INDEX idx_onboarding_profiles_user_id ON public.onboarding_profiles USING btree (user_id);

CREATE INDEX idx_onboarding_responses_component_id ON public.onboarding_responses USING btree (component_id);

CREATE INDEX idx_onboarding_responses_created_at ON public.onboarding_responses USING btree (created_at);

CREATE INDEX idx_onboarding_responses_user_id ON public.onboarding_responses USING btree (user_id);

CREATE INDEX idx_users_financial_stage ON public.users USING btree (financial_stage);

CREATE INDEX idx_users_onboarding_completed ON public.users USING btree (onboarding_completed);

CREATE UNIQUE INDEX onboarding_chat_pkey ON public.onboarding_chat USING btree (id);

CREATE UNIQUE INDEX onboarding_profiles_pkey ON public.onboarding_profiles USING btree (id);

CREATE UNIQUE INDEX onboarding_profiles_user_id_key ON public.onboarding_profiles USING btree (user_id);

CREATE UNIQUE INDEX onboarding_responses_pkey ON public.onboarding_responses USING btree (id);

CREATE UNIQUE INDEX onboarding_responses_user_id_component_id_key ON public.onboarding_responses USING btree (user_id, component_id);

CREATE UNIQUE INDEX users_user_id_unique ON public.users USING btree (user_id);

alter table "public"."onboarding_chat" add constraint "onboarding_chat_pkey" PRIMARY KEY using index "onboarding_chat_pkey";

alter table "public"."onboarding_profiles" add constraint "onboarding_profiles_pkey" PRIMARY KEY using index "onboarding_profiles_pkey";

alter table "public"."onboarding_responses" add constraint "onboarding_responses_pkey" PRIMARY KEY using index "onboarding_responses_pkey";

alter table "public"."onboarding_chat" add constraint "onboarding_chat_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE not valid;

alter table "public"."onboarding_chat" validate constraint "onboarding_chat_conversation_id_fkey";

alter table "public"."onboarding_chat" add constraint "onboarding_chat_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."onboarding_chat" validate constraint "onboarding_chat_user_id_fkey";

alter table "public"."onboarding_profiles" add constraint "onboarding_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."onboarding_profiles" validate constraint "onboarding_profiles_user_id_fkey";

alter table "public"."onboarding_profiles" add constraint "onboarding_profiles_user_id_key" UNIQUE using index "onboarding_profiles_user_id_key";

alter table "public"."onboarding_responses" add constraint "onboarding_responses_user_id_component_id_key" UNIQUE using index "onboarding_responses_user_id_component_id_key";

alter table "public"."onboarding_responses" add constraint "onboarding_responses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."onboarding_responses" validate constraint "onboarding_responses_user_id_fkey";

alter table "public"."users" add constraint "check_financial_stage_valid" CHECK (((financial_stage IS NULL) OR (financial_stage = ANY (ARRAY['survival'::text, 'debt'::text, 'foundation'::text, 'investing'::text, 'optimizing'::text, 'protecting'::text, 'retirement'::text])))) not valid;

alter table "public"."users" validate constraint "check_financial_stage_valid";

alter table "public"."users" add constraint "check_stage_confidence_range" CHECK (((stage_confidence IS NULL) OR ((stage_confidence >= (0.0)::double precision) AND (stage_confidence <= (1.0)::double precision)))) not valid;

alter table "public"."users" validate constraint "check_stage_confidence_range";

alter table "public"."users" add constraint "users_user_id_unique" UNIQUE using index "users_user_id_unique";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

create type "public"."vector" as ("values" double precision[]);

grant delete on table "public"."onboarding_chat" to "anon";

grant insert on table "public"."onboarding_chat" to "anon";

grant references on table "public"."onboarding_chat" to "anon";

grant select on table "public"."onboarding_chat" to "anon";

grant trigger on table "public"."onboarding_chat" to "anon";

grant truncate on table "public"."onboarding_chat" to "anon";

grant update on table "public"."onboarding_chat" to "anon";

grant delete on table "public"."onboarding_chat" to "authenticated";

grant insert on table "public"."onboarding_chat" to "authenticated";

grant references on table "public"."onboarding_chat" to "authenticated";

grant select on table "public"."onboarding_chat" to "authenticated";

grant trigger on table "public"."onboarding_chat" to "authenticated";

grant truncate on table "public"."onboarding_chat" to "authenticated";

grant update on table "public"."onboarding_chat" to "authenticated";

grant delete on table "public"."onboarding_chat" to "service_role";

grant insert on table "public"."onboarding_chat" to "service_role";

grant references on table "public"."onboarding_chat" to "service_role";

grant select on table "public"."onboarding_chat" to "service_role";

grant trigger on table "public"."onboarding_chat" to "service_role";

grant truncate on table "public"."onboarding_chat" to "service_role";

grant update on table "public"."onboarding_chat" to "service_role";

grant delete on table "public"."onboarding_profiles" to "anon";

grant insert on table "public"."onboarding_profiles" to "anon";

grant references on table "public"."onboarding_profiles" to "anon";

grant select on table "public"."onboarding_profiles" to "anon";

grant trigger on table "public"."onboarding_profiles" to "anon";

grant truncate on table "public"."onboarding_profiles" to "anon";

grant update on table "public"."onboarding_profiles" to "anon";

grant delete on table "public"."onboarding_profiles" to "authenticated";

grant insert on table "public"."onboarding_profiles" to "authenticated";

grant references on table "public"."onboarding_profiles" to "authenticated";

grant select on table "public"."onboarding_profiles" to "authenticated";

grant trigger on table "public"."onboarding_profiles" to "authenticated";

grant truncate on table "public"."onboarding_profiles" to "authenticated";

grant update on table "public"."onboarding_profiles" to "authenticated";

grant delete on table "public"."onboarding_profiles" to "service_role";

grant insert on table "public"."onboarding_profiles" to "service_role";

grant references on table "public"."onboarding_profiles" to "service_role";

grant select on table "public"."onboarding_profiles" to "service_role";

grant trigger on table "public"."onboarding_profiles" to "service_role";

grant truncate on table "public"."onboarding_profiles" to "service_role";

grant update on table "public"."onboarding_profiles" to "service_role";

grant delete on table "public"."onboarding_responses" to "anon";

grant insert on table "public"."onboarding_responses" to "anon";

grant references on table "public"."onboarding_responses" to "anon";

grant select on table "public"."onboarding_responses" to "anon";

grant trigger on table "public"."onboarding_responses" to "anon";

grant truncate on table "public"."onboarding_responses" to "anon";

grant update on table "public"."onboarding_responses" to "anon";

grant delete on table "public"."onboarding_responses" to "authenticated";

grant insert on table "public"."onboarding_responses" to "authenticated";

grant references on table "public"."onboarding_responses" to "authenticated";

grant select on table "public"."onboarding_responses" to "authenticated";

grant trigger on table "public"."onboarding_responses" to "authenticated";

grant truncate on table "public"."onboarding_responses" to "authenticated";

grant update on table "public"."onboarding_responses" to "authenticated";

grant delete on table "public"."onboarding_responses" to "service_role";

grant insert on table "public"."onboarding_responses" to "service_role";

grant references on table "public"."onboarding_responses" to "service_role";

grant select on table "public"."onboarding_responses" to "service_role";

grant trigger on table "public"."onboarding_responses" to "service_role";

grant truncate on table "public"."onboarding_responses" to "service_role";

grant update on table "public"."onboarding_responses" to "service_role";

create policy "Users can delete own onboarding chat"
on "public"."onboarding_chat"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert own onboarding chat"
on "public"."onboarding_chat"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update own onboarding chat"
on "public"."onboarding_chat"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own onboarding chat"
on "public"."onboarding_chat"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can delete own onboarding profile"
on "public"."onboarding_profiles"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert own onboarding profile"
on "public"."onboarding_profiles"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update own onboarding profile"
on "public"."onboarding_profiles"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own onboarding profile"
on "public"."onboarding_profiles"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can delete own onboarding responses"
on "public"."onboarding_responses"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert own onboarding responses"
on "public"."onboarding_responses"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update own onboarding responses"
on "public"."onboarding_responses"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own onboarding responses"
on "public"."onboarding_responses"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER trg_onboarding_chat_updated BEFORE UPDATE ON public.onboarding_chat FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER update_onboarding_profiles_updated_at BEFORE UPDATE ON public.onboarding_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_responses_updated_at BEFORE UPDATE ON public.onboarding_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


