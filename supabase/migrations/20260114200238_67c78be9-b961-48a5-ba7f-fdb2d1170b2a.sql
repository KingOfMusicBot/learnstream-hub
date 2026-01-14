-- Fix the permissive contact_submissions INSERT policy
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

-- Create a more restrictive policy that still allows public submissions
-- but with proper validation (requires all required fields)
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (
    name IS NOT NULL 
    AND email IS NOT NULL 
    AND message IS NOT NULL
    AND length(name) > 0
    AND length(email) > 0
    AND length(message) > 0
  );