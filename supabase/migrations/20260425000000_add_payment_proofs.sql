-- Add payment_proofs column to registrations table
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_proofs TEXT;
