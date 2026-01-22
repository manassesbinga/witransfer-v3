-- SEED DATA - BASEADO EXATAMENTE NO SCHEMA 20260117002500_refactor_schema.sql
-- Tabelas: vehicle_classes, extras, partners, users

-- Limpar dados existentes
TRUNCATE TABLE users, partners, vehicle_classes, extras, services RESTART IDENTITY CASCADE;

-- Garantir que os novos papéis são aceites (Correção de constraint)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('ADMIN', 'SUPER_ADMIN', 'GERENCIADOR', 'PARTNER_ADMIN', 'PARTNER_STAFF', 'DRIVER', 'CLIENT'));

-- Garantir que a tabela services tem as colunas necessárias (Compatibilidade Schema V5)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='min_quantity') THEN
        ALTER TABLE services ADD COLUMN min_quantity INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='included_quantity') THEN
        ALTER TABLE services ADD COLUMN included_quantity INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='extra_quantity_price') THEN
        ALTER TABLE services ADD COLUMN extra_quantity_price DECIMAL(10,2);
    END IF;
END $$;

-- 1. MASTER PARTNER & ADMINS
WITH main_p AS (
    INSERT INTO partners (name, legal_name, type, email, phone, manager_name, status, is_verified)
    VALUES ('WiTransfer Global', 'WiTransfer Group Lda', 'empresa', 'global@witransfer.com', '+244000000000', 'Sistema', 'active', true)
    RETURNING id
)
INSERT INTO users (email, password_hash, full_name, role, partner_id, is_active)
SELECT 
    'superadmin@witransfer.com',
    '$2b$10$HZzP/w9a0YQnjG5ra4LXl.Op50giem3CopqKH/NnI4gsvtH64JN4a', -- password: admin
    'Super Administrador',
    'SUPER_ADMIN',
    id,
    true 
FROM main_p
UNION ALL
SELECT 
    'admin@witransfer.com',
    '$2b$10$HZzP/w9a0YQnjG5ra4LXl.Op50giem3CopqKH/NnI4gsvtH64JN4a', -- password: admin
    'Administrador Geral',
    'ADMIN',
    id,
    true 
FROM main_p;

-- 2. VEHICLE CLASSES
INSERT INTO vehicle_classes (name, description, icon) VALUES 
('Económico', 'Veículos eficientes para o dia-a-dia', 'Car'),
('Executivo', 'Conforto e sofisticação', 'Star'),
('Van', 'Ideal para grupos', 'Bus'),
('Luxo', 'Experiência premium', 'Crown');

-- 3. EXTRAS
INSERT INTO extras (name, description, price, type) VALUES
('Cadeira de Bebé', 'Assento seguro', 2500, 'vehicle_feature'),
('GPS', 'Navegação', 1500, 'vehicle_feature'),
('Motorista Bilíngue', 'Inglês/Francês', 5000, 'service_extra'),
('Recepção Aeroporto', 'Placa com nome', 3000, 'service_extra');

-- 4. SERVICES (Standardized)
INSERT INTO services (name, description, billing_type, min_quantity, included_quantity, extra_quantity_price, is_active) VALUES
('Transfer', 'Serviço de transporte por KM', 'per_km', 1, 0, 0, true),
('Rental', 'Aluguer de veículo por dia', 'per_day', 1, 100, 0, true);

-- 4. PARCEIROS
WITH p1 AS (
    INSERT INTO partners (name, legal_name, type, email, phone, manager_name, status, is_verified)
    VALUES ('Transportes Rápidos', 'Transportes Rápidos Lda', 'empresa', 'rapidos@test.ao', '+244923456789', 'João Silva', 'active', true)
    RETURNING id
)
INSERT INTO users (email, password_hash, full_name, role, partner_id, is_active)
SELECT 'joao@rapidos.ao', '$2b$10$HZzP/w9a0YQnjG5ra4LXl.Op50giem3CopqKH/NnI4gsvtH64JN4a', 'João Silva', 'PARTNER_ADMIN', id, true FROM p1;

WITH p2 AS (
    INSERT INTO partners (name, legal_name, type, email, phone, manager_name, status, is_verified)
    VALUES ('Manuel Antonio', 'Manuel Antonio', 'individual', 'manuel@test.ao', '+244912345678', 'Manuel Antonio', 'pending', false)
    RETURNING id
)
INSERT INTO users (email, password_hash, full_name, role, partner_id, is_active)
SELECT 'manuel@test.ao', '$2b$10$HZzP/w9a0YQnjG5ra4LXl.Op50giem3CopqKH/NnI4gsvtH64JN4a', 'Manuel Antonio', 'PARTNER_ADMIN', id, true FROM p2;
