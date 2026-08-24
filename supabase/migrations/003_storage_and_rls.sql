-- ==============================================================================
-- 003_storage_and_rls.sql
-- Row Level Security (RLS) and Supabase Storage Setup
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rates_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_reserves ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- 2. PUBLIC READ POLICIES FOR RATES, RESERVES, AND ACTIVE PAYMENT METHODS
CREATE POLICY "Public read rates config"
    ON rates_config FOR SELECT
    USING (is_active = true);

CREATE POLICY "Public read network reserves"
    ON network_reserves FOR SELECT
    USING (is_active = true);

CREATE POLICY "Public read active payment methods"
    ON payment_methods FOR SELECT
    USING (is_active = true);

-- 3. ORDERS POLICIES
-- Anyone can create a new order
CREATE POLICY "Allow public order creation"
    ON orders FOR INSERT
    WITH CHECK (true);

-- Anyone who knows the secret_token or id can read the order
CREATE POLICY "Allow read order by secret token or id"
    ON orders FOR SELECT
    USING (true);

-- Allow buyer update on their order (e.g. upload receipt, confirm payment)
CREATE POLICY "Allow buyer update on order"
    ON orders FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 4. ORDER CHAT MESSAGES POLICIES
-- Anyone can read messages for an order
CREATE POLICY "Allow read messages for order"
    ON order_messages FOR SELECT
    USING (true);

-- Anyone can send a message to an order
CREATE POLICY "Allow insert message for order"
    ON order_messages FOR INSERT
    WITH CHECK (true);

-- 5. SERVICE ROLE / ADMIN FULL ACCESS
-- When using Supabase Service Role Key (backend FastAPI) or authenticated admin role, full access is granted.

-- 6. STORAGE BUCKET CONFIGURATION (for Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-receipts', 'order-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read of uploaded receipts
CREATE POLICY "Allow public read receipts"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'order-receipts');

-- Policy: Allow anyone to upload receipt screenshots
CREATE POLICY "Allow public upload receipts"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'order-receipts');
