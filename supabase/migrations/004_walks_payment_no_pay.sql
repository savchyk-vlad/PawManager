-- Complementary / not charging: walks excluded from outstanding balance
ALTER TABLE public.walks DROP CONSTRAINT IF EXISTS walks_payment_status_check;
ALTER TABLE public.walks
  ADD CONSTRAINT walks_payment_status_check
  CHECK (payment_status IN ('unpaid', 'paid', 'no_pay'));
