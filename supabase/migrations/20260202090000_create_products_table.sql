/*
  # Products Table for L'ArtPéro

  Creates a products table to manage all purchasable items:
  - Subscriptions (Standard, Premium, Elite, Prestige)
  - Single entries (Découverte, Guest)
  - Gift cards (Gift, Expérience)

  Also creates product_orders table to track purchases.
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('subscription', 'entry', 'gift_card')),
  price_cents integer NOT NULL,
  duration_months integer, -- For subscriptions
  events_included integer, -- Number of events included (for entries/gift cards)
  is_active boolean DEFAULT true,
  stripe_price_id text, -- Optional Stripe Price ID for recurring subscriptions
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can view active products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can view active products"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can manage products
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Product orders table
CREATE TABLE IF NOT EXISTS product_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1,
  total_amount integer NOT NULL, -- in cents
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_session_id text,
  stripe_payment_intent text,
  recipient_email text, -- For gift cards
  recipient_name text, -- For gift cards
  gift_code text UNIQUE, -- For gift cards
  gift_code_used boolean DEFAULT false,
  expires_at timestamptz, -- For gift cards
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_orders ENABLE ROW LEVEL SECURITY;

-- Users can view own orders
CREATE POLICY "Users can view own product orders"
  ON product_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create own orders
CREATE POLICY "Users can create own product orders"
  ON product_orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own pending orders
CREATE POLICY "Users can update own pending orders"
  ON product_orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND payment_status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all product orders"
  ON product_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all orders
CREATE POLICY "Admins can update all product orders"
  ON product_orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_orders_user_id ON product_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_product_id ON product_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_payment_status ON product_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_product_orders_gift_code ON product_orders(gift_code);

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_orders_updated_at BEFORE UPDATE ON product_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default products
INSERT INTO products (name, slug, description, category, price_cents, duration_months, events_included, metadata) VALUES
  -- Subscriptions
  ('Standard', 'standard', '2 events/mois, 1 verre offert, accès animations', 'subscription', 8500, 1, 2, '{"features": ["2 events/mois", "1 verre offert", "accès animations"]}'),
  ('Premium', 'premium', '2 events/mois, 1 verre offert, 1 guest/trimestre, animations', 'subscription', 24000, 3, 6, '{"features": ["2 events/mois", "1 verre offert", "1 guest/trimestre", "animations"]}'),
  ('Elite', 'elite', '2 events/mois, 1 verre offert, 1 guest/trimestre, animations', 'subscription', 45600, 6, 12, '{"features": ["2 events/mois", "1 verre offert", "1 guest/trimestre", "animations"]}'),
  ('Prestige', 'prestige', '2 events/mois, 1 verre offert, 1 guest/trimestre, animations', 'subscription', 88800, 12, 24, '{"features": ["2 events/mois", "1 verre offert", "1 guest/trimestre", "animations"]}'),

  -- Single entries
  ('Entrée Découverte', 'entree-decouverte', '1 event, 1 verre offert, accès animation', 'entry', 4900, NULL, 1, '{"features": ["1 event", "1 verre offert", "accès animation"]}'),
  ('Entrée Guest', 'entree-guest', 'Invité d''un membre, 1 verre offert, accès animation', 'entry', 3900, NULL, 1, '{"features": ["Invité d''un membre", "1 verre offert", "accès animation"], "requires_member_sponsor": true}'),

  -- Gift cards
  ('Art''Péro Gift', 'artpero-gift', '1 event, valable 6 mois, 1 verre offert, animation', 'gift_card', 5500, NULL, 1, '{"validity_months": 6, "features": ["1 event", "1 verre offert", "animation"]}'),
  ('Art''Péro Expérience', 'artpero-experience', '2 events, valable 6 mois, 1 verre offert, animation', 'gift_card', 9500, NULL, 2, '{"validity_months": 6, "features": ["2 events", "1 verre offert", "animation"]}')
ON CONFLICT (slug) DO NOTHING;
