-- ==============================================================================
-- 001_initial_schema.sql
-- Database Schema for Kyrgyzstan B2C USDT Purchasing Platform
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'CREATED',
        'AWAITING_PAYMENT',
        'PAID_CONFIRMED_BY_USER',
        'VERIFIED_BY_ADMIN',
        'USDT_DISPATCHED',
        'COMPLETED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE crypto_network AS ENUM (
        'TRC20',
        'BEP20',
        'ERC20',
        'TON'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fiat_currency AS ENUM (
        'KGS',
        'USD'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sender_role AS ENUM (
        'buyer',
        'admin',
        'system'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PAYMENT METHODS (Bank cards / Kyrgyz payment rails)
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_name VARCHAR(100) NOT NULL, -- e.g. "MBank", "Optima Bank", "DemirBank", "Bakai Bank", "KICB"
    card_number VARCHAR(64) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    currency fiat_currency NOT NULL DEFAULT 'KGS',
    is_active BOOLEAN NOT NULL DEFAULT true,
    instructions TEXT,
    daily_limit_kgs NUMERIC(14, 2) DEFAULT 1000000.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. NETWORK RESERVES & SPECS
CREATE TABLE IF NOT EXISTS network_reserves (
    network crypto_network PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    reserve_usdt NUMERIC(18, 4) NOT NULL DEFAULT 50000.0000,
    network_fee_usdt NUMERIC(8, 4) NOT NULL DEFAULT 1.0000,
    est_delivery_minutes INT NOT NULL DEFAULT 2,
    explorer_tx_url VARCHAR(255) NOT NULL, -- e.g. https://tronscan.org/#/transaction/
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. RATES CONFIGURATION
CREATE TABLE IF NOT EXISTS rates_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fiat_currency fiat_currency UNIQUE NOT NULL,
    base_rate_usd NUMERIC(10, 4) NOT NULL, -- e.g., 87.50 for KGS, 1.00 for USD
    margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 1.20, -- 1.2% platform spread
    min_order_usdt NUMERIC(10, 2) NOT NULL DEFAULT 20.00,
    max_order_usdt NUMERIC(10, 2) NOT NULL DEFAULT 10000.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. KG-USDT-74921
    secret_token UUID NOT NULL DEFAULT uuid_generate_v4(), -- public tracking token
    
    -- Financial Details
    fiat_currency fiat_currency NOT NULL,
    fiat_amount NUMERIC(14, 2) NOT NULL,
    crypto_network crypto_network NOT NULL,
    crypto_amount NUMERIC(18, 4) NOT NULL, -- Net USDT buyer receives
    exchange_rate NUMERIC(12, 4) NOT NULL, -- Effective exchange rate applied
    network_fee_usdt NUMERIC(8, 4) NOT NULL DEFAULT 1.00,
    
    -- Buyer Information
    wallet_address VARCHAR(255) NOT NULL,
    buyer_contact VARCHAR(100) NOT NULL, -- Phone / Telegram / WhatsApp
    buyer_name VARCHAR(150),
    
    -- Order Status & Payment Requisites
    status order_status NOT NULL DEFAULT 'CREATED',
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    user_receipt_url TEXT, -- Screenshot / receipt image in Supabase storage
    bank_reference_id VARCHAR(100), -- User-provided bank transaction ref
    
    -- Fulfillment
    tx_hash VARCHAR(255), -- On-chain transaction hash once dispatched
    admin_notes TEXT,
    
    -- Timestamps & Expiry
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
    paid_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for fast search and lookups
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_secret_token ON orders(secret_token);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 6. ORDER CHAT MESSAGES
CREATE TABLE IF NOT EXISTS order_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sender_type sender_role NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_messages_order_id ON order_messages(order_id, created_at ASC);

-- Enable Supabase Realtime publication on relevant tables
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE order_messages;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE network_reserves;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE rates_config;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
