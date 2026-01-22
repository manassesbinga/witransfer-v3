-- =============================================================================
-- WITRANSFER DEFINITIVE SCHEMA V5.1
-- Optimized and Cleaned Up Migration
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLEANUP (Careful: This drops existing data)
DROP TABLE IF EXISTS booking_waitlist CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS quote_requests CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS vehicle_usage_logs CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS service_class_prices CASCADE;
DROP TABLE IF EXISTS vehicle_service_prices CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS vehicle_classes CASCADE;
DROP TABLE IF EXISTS extras CASCADE;

-- =============================================================================
-- 0. CATALOG
-- =============================================================================
CREATE TABLE vehicle_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    partner_id UUID, -- NULL for global, or specific
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    legal_name TEXT,
    nif TEXT,
    type TEXT CHECK (type IN ('empresa', 'individual')),
    business_license TEXT,
    foundation_year TEXT,
    employees_count TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    phone_alt TEXT,
    whatsapp TEXT,
    manager_name TEXT,
    website TEXT,
    address_province TEXT,
    address_city TEXT,
    address_street TEXT,
    address_zip TEXT,
    address_number TEXT,
    address_country TEXT DEFAULT 'Angola',
    commission_rate DECIMAL(5,2) DEFAULT 15.00,
    remuneration_type TEXT DEFAULT 'percentual',
    remuneration_value TEXT,
    currency TEXT DEFAULT 'AOA',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    is_verified BOOLEAN DEFAULT false,
    is_principal BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 5.00,
    avatar_url TEXT,
    logo_url TEXT,
    document_url TEXT,
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    type TEXT, -- 'vehicle_feature' or 'service_extra'
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    billing_type TEXT NOT NULL CHECK (billing_type IN ('per_km', 'per_day', 'fixed', 'per_hour')),
    min_quantity INTEGER,
    included_quantity INTEGER,
    extra_quantity_price DECIMAL(10,2),
    currency TEXT DEFAULT 'AOA',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. USERS
-- =============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    full_name TEXT NOT NULL,
    nickname TEXT,
    gender TEXT,
    nationality TEXT,
    date_of_birth DATE,
    nif TEXT,
    document_number TEXT,
    avatar_url TEXT,
    phone TEXT,
    phone_alt TEXT,
    address_street TEXT,
    address_city TEXT,
    address_province TEXT,
    role TEXT NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('ADMIN', 'SUPER_ADMIN', 'GERENCIADOR', 'PARTNER_ADMIN', 'PARTNER_STAFF', 'DRIVER', 'CLIENT')),
    sub_role TEXT,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    license_number TEXT,
    license_category TEXT,
    license_date DATE,
    license_expiry DATE,
    professional_license BOOLEAN DEFAULT false,
    experience_years INTEGER,
    languages TEXT[],
    driver_status TEXT DEFAULT 'offline',
    otp_code TEXT,
    otp_expiry TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. VEHICLES
-- =============================================================================
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    color TEXT,
    vehicle_class_id UUID REFERENCES vehicle_classes(id) ON DELETE SET NULL,
    license_plate TEXT,
    status TEXT DEFAULT 'available',
    vin TEXT,
    engine_number TEXT,
    fuel_type TEXT,
    transmission TEXT,
    potency TEXT,
    displacement TEXT,
    mileage DECIMAL(10,2),
    condition TEXT,
    condition_level TEXT,
    seats INTEGER DEFAULT 4,
    doors INTEGER DEFAULT 4,
    luggage_big INTEGER,
    luggage_small INTEGER,
    has_ac BOOLEAN DEFAULT false,
    has_abs BOOLEAN DEFAULT false,
    has_airbags BOOLEAN DEFAULT false,
    has_lsd BOOLEAN DEFAULT false,
    has_eb BOOLEAN DEFAULT false,
    last_service DATE,
    next_service DATE,
    insurance_company TEXT,
    insurance_policy TEXT,
    insurance_expiry DATE,
    inspection_last DATE,
    inspection_expiry DATE,
    current_driver_id UUID REFERENCES users(id) ON DELETE SET NULL, 
    image_url TEXT,
    extras TEXT[], -- Array of UUIDs as text
    services TEXT[], -- Array of UUIDs as text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 4. PRICING & LOGS
-- =============================================================================
CREATE TABLE service_class_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    vehicle_class_id UUID REFERENCES vehicle_classes(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_price DECIMAL(10,2), 
    extra_price DECIMAL(10,2),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_id, vehicle_class_id, partner_id)
);

CREATE TABLE vehicle_service_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vehicle_id, service_id)
);

CREATE TABLE vehicle_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    mileage_start DECIMAL(10,2),
    mileage_end DECIMAL(10,2),
    purpose TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 5. BOOKINGS & WAITLIST
-- =============================================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    client_id UUID REFERENCES users(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    service_type TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT,
    stops TEXT[],
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    total_price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'AOA',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE booking_waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    original_partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    original_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    original_driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    service_type TEXT,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'reassigned', 'expired', 'canceled')),
    reason TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    reassigned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quote_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    service_type TEXT,
    pickup_location TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',
    quoted_amount DECIMAL(10,2),
    partner_id UUID REFERENCES partners(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number TEXT NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SECURITY & POLICIES
-- =============================================================================
ALTER TABLE vehicle_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_class_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_service_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Fallback Public Access (Simplificado para o Admin Assistant)
CREATE POLICY "Public Access" ON vehicle_classes FOR ALL USING (true);
CREATE POLICY "Public Access" ON partners FOR ALL USING (true);
CREATE POLICY "Public Access" ON extras FOR ALL USING (true);
CREATE POLICY "Public Access" ON services FOR ALL USING (true);
CREATE POLICY "Public Access" ON users FOR ALL USING (true);
CREATE POLICY "Public Access" ON vehicles FOR ALL USING (true);
CREATE POLICY "Public Access" ON service_class_prices FOR ALL USING (true);
CREATE POLICY "Public Access" ON vehicle_service_prices FOR ALL USING (true);
CREATE POLICY "Public Access" ON vehicle_usage_logs FOR ALL USING (true);
CREATE POLICY "Public Access" ON bookings FOR ALL USING (true);
CREATE POLICY "Public Access" ON booking_waitlist FOR ALL USING (true);
CREATE POLICY "Public Access" ON quote_requests FOR ALL USING (true);
CREATE POLICY "Public Access" ON transactions FOR ALL USING (true);
CREATE POLICY "Public Access" ON invoices FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON booking_waitlist(status) WHERE status = 'waiting';
CREATE INDEX IF NOT EXISTS idx_waitlist_booking ON booking_waitlist(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_partner ON vehicles(partner_id);