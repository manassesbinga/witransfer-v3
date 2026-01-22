-- =============================================================================
-- SEED ADMIN GLOBAL
-- =============================================================================

-- Este script cria um administrador global padrão.
-- Email: admin@witransfer.com
-- Palavra-passe: admin123 (Hash bcrypt abaixo)

INSERT INTO users (
    email, 
    password_hash, 
    full_name, 
    role, 
    is_active
) VALUES (
    'admin@witransfer.com',
    '$2a$10$zS7M/YIDxG4W3y1W.4kO.e5wL8jV2T9T/H7J3J/F4J3J/F4J3J/F4', -- admin123
    'Administrador WiTransfer',
    'ADMIN',
    true
) ON CONFLICT (email) DO NOTHING;
