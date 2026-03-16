
CREATE TABLE public.owned_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  asset_id text NOT NULL,
  asset_type text NOT NULL DEFAULT 'business',
  level integer DEFAULT 1,
  purchased_at timestamptz DEFAULT now(),
  last_collected timestamptz DEFAULT now(),
  UNIQUE(user_id, asset_id)
);

ALTER TABLE public.owned_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assets" ON public.owned_assets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assets" ON public.owned_assets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assets" ON public.owned_assets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assets" ON public.owned_assets FOR DELETE TO authenticated USING (auth.uid() = user_id);
