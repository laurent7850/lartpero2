/*
  # Add Stripe Fields to Orders Table

  ## Changes
  - Add `stripe_session_id` column to store Stripe Checkout Session ID
  - Add `stripe_payment_intent` column to store Stripe Payment Intent ID
  - Keep existing `payment_intent_id` for backwards compatibility
  
  ## Notes
  - These fields help track the payment flow through Stripe
  - Session ID is used during checkout
  - Payment Intent ID is used after successful payment
*/

-- Add stripe_session_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_session_id text;
  END IF;
END $$;

-- Add stripe_payment_intent column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stripe_payment_intent'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_payment_intent text;
  END IF;
END $$;

-- Create index for stripe_session_id for better lookup performance
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent);