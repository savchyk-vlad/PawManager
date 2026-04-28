-- Allow explicit red-risk dog traits.

ALTER TABLE dog_traits DROP CONSTRAINT IF EXISTS dog_traits_type_check;

ALTER TABLE dog_traits
  ADD CONSTRAINT dog_traits_type_check
  CHECK (type IN ('positive', 'warning', 'red'));
