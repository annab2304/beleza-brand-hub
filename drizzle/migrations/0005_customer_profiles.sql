CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 full_name text NOT NULL DEFAULT '',
 phone text NOT NULL DEFAULT '',
 shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "customers insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "customers update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE FUNCTION public.create_customer_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 INSERT INTO public.profiles (id, full_name, phone, shipping_address)
 VALUES (NEW.id, left(coalesce(NEW.raw_user_meta_data->>'full_name', ''), 120), left(coalesce(NEW.raw_user_meta_data->>'phone', ''), 20),
 CASE WHEN jsonb_typeof(NEW.raw_user_meta_data->'shipping_address') = 'object' THEN jsonb_build_object(
 'cep', left(coalesce(NEW.raw_user_meta_data->'shipping_address'->>'cep', ''), 8),
 'street', left(coalesce(NEW.raw_user_meta_data->'shipping_address'->>'street', ''), 160),
 'number', left(coalesce(NEW.raw_user_meta_data->'shipping_address'->>'number', ''), 20),
 'complement', left(coalesce(NEW.raw_user_meta_data->'shipping_address'->>'complement', ''), 80),
 'neighborhood', left(coalesce(NEW.raw_user_meta_data->'shipping_address'->>'neighborhood', ''), 100),
 'city', left(coalesce(NEW.raw_user_meta_data->'shipping_address'->>'city', ''), 100),
 'state', left(coalesce(NEW.raw_user_meta_data->'shipping_address'->>'state', ''), 2)) ELSE '{}'::jsonb END)
 ON CONFLICT (id) DO NOTHING;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.create_customer_profile() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER create_customer_profile_on_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_customer_profile();
INSERT INTO public.profiles (id, full_name) SELECT id, left(coalesce(raw_user_meta_data->>'full_name', ''), 120) FROM auth.users ON CONFLICT (id) DO NOTHING;