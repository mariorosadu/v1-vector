-- Add DELETE policy for problem_surface_answers table
-- This allows rows to be deleted by anyone (matching the existing INSERT/SELECT policies)
CREATE POLICY "allow_delete_answers" ON public.problem_surface_answers
  FOR DELETE
  USING (true);
