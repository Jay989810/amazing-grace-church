-- Amazing Grace Baptist Church Database Schema
-- Run this SQL in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create sermons table
CREATE TABLE IF NOT EXISTS sermons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    speaker VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Sunday Service', 'Bible Study', 'Mid-week')),
    audio_url TEXT,
    video_url TEXT,
    notes_url TEXT,
    description TEXT,
    thumbnail TEXT,
    duration VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Service', 'Conference', 'Crusade', 'Youth Program', 'Other')),
    image TEXT,
    registration_required BOOLEAN DEFAULT FALSE,
    registration_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    album VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    photographer VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create church_settings table
CREATE TABLE IF NOT EXISTS church_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    pastor VARCHAR(255) NOT NULL,
    service_times JSONB NOT NULL,
    social_media JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON sermons FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON events FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON announcements FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON church_settings FOR SELECT USING (true);

-- Create policies for contact messages (public insert, admin all)
CREATE POLICY "Enable insert for all users" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable all access for admins" ON contact_messages FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.email = auth.jwt() ->> 'email' 
        AND users.role = 'admin'
    )
);

-- Create policies for admin-only tables
CREATE POLICY "Enable all access for admins" ON sermons FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.email = auth.jwt() ->> 'email' 
        AND users.role = 'admin'
    )
);

CREATE POLICY "Enable all access for admins" ON events FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.email = auth.jwt() ->> 'email' 
        AND users.role = 'admin'
    )
);

CREATE POLICY "Enable all access for admins" ON gallery_images FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.email = auth.jwt() ->> 'email' 
        AND users.role = 'admin'
    )
);

CREATE POLICY "Enable all access for admins" ON users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.email = auth.jwt() ->> 'email' 
        AND users.role = 'admin'
    )
);

CREATE POLICY "Enable all access for admins" ON church_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.email = auth.jwt() ->> 'email' 
        AND users.role = 'admin'
    )
);

CREATE POLICY "Enable all access for admins" ON announcements FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.email = auth.jwt() ->> 'email' 
        AND users.role = 'admin'
    )
);

-- Insert default admin user
INSERT INTO users (email, name, password, role) 
VALUES ('admin@amazinggracechurch.org', 'Admin User', 'grace1234', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default church settings
INSERT INTO church_settings (name, address, phone, email, pastor, service_times, social_media)
VALUES (
    'Amazing Grace Baptist Church',
    'U/Zawu, Gonin Gora, Kaduna State, Nigeria',
    '+234 XXX XXX XXXX',
    'info@amazinggracechurch.org',
    'Pastor John Doe',
    '{"sunday": ["8:00 AM", "10:00 AM"], "midweek": ["6:00 PM"], "bibleStudy": ["7:00 PM"]}',
    '{"facebook": "", "instagram": "", "youtube": "", "twitter": ""}'
)
ON CONFLICT DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_sermons_updated_at BEFORE UPDATE ON sermons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_images_updated_at BEFORE UPDATE ON gallery_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_church_settings_updated_at BEFORE UPDATE ON church_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE sermons;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE gallery_images;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
