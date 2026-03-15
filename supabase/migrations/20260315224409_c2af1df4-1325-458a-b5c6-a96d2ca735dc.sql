ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS product_goals text,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;