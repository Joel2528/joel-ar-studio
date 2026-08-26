-- PostgreSQL Database Schema for Multi-Tenant AR Business Platform

-- 1. Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'C001'
    name VARCHAR(255) NOT NULL, -- e.g. 'John Wedding'
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Frames Table
CREATE TABLE IF NOT EXISTS frames (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'F001'
    client_id VARCHAR(50) REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g. 'Wedding Frame'
    target_file VARCHAR(255) NOT NULL, -- e.g. 'frame001.mind'
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Videos Table
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'V001'
    frame_id VARCHAR(50) REFERENCES frames(id) ON DELETE CASCADE,
    storage_key VARCHAR(500) NOT NULL, -- e.g. 'clients/C001/F001/video.mp4'
    filename VARCHAR(255) NOT NULL,
    duration INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Seed Data
INSERT INTO clients (id, name, email) VALUES 
('C001', 'John Wedding', 'john@example.com'),
('C002', 'Sarah Birthday', 'sarah@example.com'),
('C003', 'Kumar Memorial', 'kumar@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO frames (id, client_id, name, target_file, active) VALUES 
('F001', 'C001', 'Wedding Frame #1', 'frame001.mind', true),
('F002', 'C001', 'Wedding Frame #2', 'frame002.mind', true),
('F003', 'C002', 'Birthday Celebration', 'frame003.mind', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO videos (id, frame_id, storage_key, filename, duration) VALUES 
('V001', 'F001', 'clients/C001/F001/video.mp4', 'wedding_final.mp4', 15),
('V002', 'F002', 'clients/C001/F002/video.mp4', 'reception.mp4', 24),
('V003', 'F003', 'clients/C002/F003/video.mp4', 'bday_party.mp4', 18)
ON CONFLICT (id) DO NOTHING;
