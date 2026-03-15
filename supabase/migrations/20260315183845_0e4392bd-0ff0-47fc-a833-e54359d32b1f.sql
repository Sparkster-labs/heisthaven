
-- Auto-create player data on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  
  -- Create safehouse
  INSERT INTO public.safehouse (user_id) VALUES (NEW.id);
  
  -- Create default crew members (5 unlocked)
  INSERT INTO public.crew_state (user_id, crew_id, unlocked) VALUES
    (NEW.id, 'fingers', true),
    (NEW.id, 'echo', true),
    (NEW.id, 'brick', true),
    (NEW.id, 'silk', true),
    (NEW.id, 'ghost', true);
  
  -- Create city progress for new_cavendish with docks unlocked
  INSERT INTO public.city_progress (user_id, city_id, unlocked_districts)
  VALUES (NEW.id, 'new_cavendish', ARRAY['docks']);
  
  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
