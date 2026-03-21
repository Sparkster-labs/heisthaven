CREATE TABLE public.jail_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  jailed_at timestamp with time zone NOT NULL DEFAULT now(),
  release_at timestamp with time zone NOT NULL,
  bail_cost integer NOT NULL DEFAULT 500,
  offense_count integer NOT NULL DEFAULT 1,
  paid boolean NOT NULL DEFAULT false,
  UNIQUE (user_id)
);

ALTER TABLE public.jail_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own jail state"
ON public.jail_state
FOR ALL
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);