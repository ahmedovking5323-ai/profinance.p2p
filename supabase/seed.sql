-- ==============================================================================
-- seed.sql
-- Seed Data for Kyrgyzstan B2C USDT Purchasing Platform
-- ==============================================================================

-- 1. SEED RATES CONFIGURATION
INSERT INTO rates_config (fiat_currency, base_rate_usd, margin_percent, min_order_usdt, max_order_usdt, is_active)
VALUES
    ('KGS', 87.5000, 1.20, 20.00, 10000.00, true),
    ('USD', 1.0000, 1.00, 20.00, 15000.00, true)
ON CONFLICT (fiat_currency) DO UPDATE SET
    base_rate_usd = EXCLUDED.base_rate_usd,
    margin_percent = EXCLUDED.margin_percent,
    min_order_usdt = EXCLUDED.min_order_usdt,
    max_order_usdt = EXCLUDED.max_order_usdt,
    updated_at = NOW();

-- 2. SEED NETWORK RESERVES & EXPLORERS
INSERT INTO network_reserves (network, name, reserve_usdt, network_fee_usdt, est_delivery_minutes, explorer_tx_url, is_active)
VALUES
    ('TRC20', 'TRON (TRC-20)', 75000.0000, 1.2000, 2, 'https://tronscan.org/#/transaction/', true),
    ('BEP20', 'BNB Smart Chain (BEP-20)', 50000.0000, 0.4000, 1, 'https://bscscan.com/tx/', true),
    ('ERC20', 'Ethereum (ERC-20)', 30000.0000, 4.5000, 5, 'https://etherscan.io/tx/', true),
    ('TON', 'The Open Network (TON)', 40000.0000, 0.2500, 1, 'https://tonscan.org/tx/', true)
ON CONFLICT (network) DO UPDATE SET
    reserve_usdt = EXCLUDED.reserve_usdt,
    network_fee_usdt = EXCLUDED.network_fee_usdt,
    est_delivery_minutes = EXCLUDED.est_delivery_minutes,
    explorer_tx_url = EXCLUDED.explorer_tx_url,
    updated_at = NOW();

-- 3. SEED KYRGYZSTAN BANK PAYMENT REQUISITES
INSERT INTO payment_methods (bank_name, card_number, recipient_name, currency, is_active, instructions, daily_limit_kgs)
VALUES
    ('MBank (КБ Кыргызстан)', '0999119118', 'Ахмедов У.', 'KGS', true, 'Перевод по номеру телефона или через MBank: 0999119118 (Ахмедов У.). В комментарии укажите номер заказа.', 1500000.00),
    ('Optima Bank (Оптима)', '0999119118', 'Ахмедов У.', 'KGS', true, 'Перевод по номеру или карте Optima Bank: 0999119118. Обязательно сохраните и прикрепите квитанцию об оплате.', 1200000.00),
    ('DemirBank (Демир)', '0999119118', 'Akhmedov U.', 'USD', true, 'USD transfer: 0999119118. Recipient: Akhmedov U.', 50000.00),
    ('Bakai Bank (Бакай Банк)', '0999119118', 'Ахмедов У.', 'KGS', true, 'Перевод на карту Бакай Банк через приложение Bakai24.', 1000000.00);
