-- Migration: Add per-category registration fees
-- Adds a JSONB column for individual fees per tournament category
-- (SMA Putra, SMA Putri, SMP Putra, SMP Putri)

-- Step 1: Add new JSONB column
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS registration_fees jsonb 
DEFAULT '{"sma_putra": "350000", "sma_putri": "350000", "smp_putra": "350000", "smp_putri": "350000"}'::jsonb;

-- Step 2: Always sync existing registration_fee value to all 4 categories
-- (no WHERE clause — ensures existing rows get the correct value from the old column)
UPDATE public.settings 
SET registration_fees = jsonb_build_object(
  'sma_putra', registration_fee,
  'sma_putri', registration_fee,
  'smp_putra', registration_fee,
  'smp_putri', registration_fee
);
