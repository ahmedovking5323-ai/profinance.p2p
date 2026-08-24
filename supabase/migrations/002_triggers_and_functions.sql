-- ==============================================================================
-- 002_triggers_and_functions.sql
-- Database Triggers and Functions for Automated Order Management & Chat
-- ==============================================================================

-- 1. Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER trigger_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_rates_config_updated_at ON rates_config;
CREATE TRIGGER trigger_rates_config_updated_at
    BEFORE UPDATE ON rates_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_network_reserves_updated_at ON network_reserves;
CREATE TRIGGER trigger_network_reserves_updated_at
    BEFORE UPDATE ON network_reserves
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 2. Function: Auto-generate order code if empty
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
DECLARE
    random_num INT;
BEGIN
    IF NEW.order_code IS NULL OR NEW.order_code = '' THEN
        random_num := floor(random() * (99999 - 10000 + 1) + 10000);
        NEW.order_code := 'KG-' || random_num::TEXT;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_orders_generate_code ON orders;
CREATE TRIGGER trigger_orders_generate_code
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_code();


-- 3. Function & Trigger: Automatic System Chat Messages on Status Transitions
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
    sys_msg TEXT;
BEGIN
    -- Only act if status actually changed or on initial creation
    IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
        CASE NEW.status
            WHEN 'CREATED' THEN
                sys_msg := '🚀 Заказ #' || NEW.order_code || ' создан. Сумма к оплате: ' || NEW.fiat_amount || ' ' || NEW.fiat_currency || '. Ожидается перевод на реквизиты.';
            WHEN 'AWAITING_PAYMENT' THEN
                sys_msg := '⏱ Ожидание оплаты покупателем. У вас есть 15 минут для перевода средств.';
            WHEN 'PAID_CONFIRMED_BY_USER' THEN
                sys_msg := '💳 Покупатель подтвердил оплату и прикрепил чек. Администратор проверяет поступление средств в мобильном банке...';
            WHEN 'VERIFIED_BY_ADMIN' THEN
                sys_msg := '✅ Оплата успешно подтверждена администратором! Подготовка отправки ' || NEW.crypto_amount || ' USDT в сети ' || NEW.crypto_network || '...';
            WHEN 'USDT_DISPATCHED' THEN
                sys_msg := '⚡️ USDT успешно отправлены на ваш кошелек ' || NEW.wallet_address || '! Хеш транзакции (TX): ' || COALESCE(NEW.tx_hash, 'в обработке сети');
            WHEN 'COMPLETED' THEN
                sys_msg := '🎉 Сделка успешно завершена! Спасибо, что выбрали наш сервис обмена в Кыргызстане.';
            WHEN 'CANCELLED' THEN
                sys_msg := '❌ Заказ отменен. Причина: истекло время ожидания или отмена оператором.';
            ELSE
                sys_msg := 'ℹ️ Статус заказа обновлен: ' || NEW.status;
        END CASE;

        -- Insert automatic system message into chat
        INSERT INTO order_messages (order_id, sender_type, sender_name, message, created_at)
        VALUES (NEW.id, 'system', 'Система Escrow KG', sys_msg, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_order_status_chat_notify ON orders;
CREATE TRIGGER trigger_order_status_chat_notify
    AFTER INSERT OR UPDATE OF status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_order_status_change();
