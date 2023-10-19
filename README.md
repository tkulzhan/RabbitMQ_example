# test_case

SQL for history table:

CREATE TYPE action_type AS ENUM (
    'created',
    'updated'
);

CREATE TABLE public.history (
  id SERIAL PRIMARY KEY NOT NULL,
  "type" action_type NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  description TEXT,
  "user_id" INTEGER NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "public"."user"(id) ON DELETE CASCADE
)
