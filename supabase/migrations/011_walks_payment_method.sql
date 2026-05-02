-- How a completed walk was paid (cash, venmo, zelle, card, or custom text).
ALTER TABLE public.walks
  ADD COLUMN IF NOT EXISTS payment_method text;

-- Keep payloads tidy while allowing custom labels such as "Apple Pay".
ALTER TABLE public.walks
  DROP CONSTRAINT IF EXISTS walks_payment_method_len_check;
ALTER TABLE public.walks
  ADD CONSTRAINT walks_payment_method_len_check
  CHECK (payment_method IS NULL OR char_length(trim(payment_method)) BETWEEN 1 AND 40);

CREATE INDEX IF NOT EXISTS walks_payment_method_idx
  ON public.walks (payment_method);
