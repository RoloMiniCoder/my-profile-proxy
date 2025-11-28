-- setup_reset.sql

-- 1. TERMINATE CONNECTIONS (Crucial for a successful DROP DATABASE)
----------------------------------------------------------------------
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'myprofile'
  AND pid <> pg_backend_pid();

-- 2. TEARDOWN (DROP RESOURCES IF THEY EXIST)
---------------------------------------------
DROP DATABASE IF EXISTS myprofile;
DROP USER IF EXISTS app_user;


-- 3. RECREATION (SETUP)
-------------------------

-- Create a new database user for your application 
CREATE USER app_user WITH PASSWORD 'strongpassword';

-- Create the 'myprofile' database
CREATE DATABASE myprofile OWNER app_user;

-- Grant all privileges on the new database to the new user (Redundant due to OWNER, but good practice)
GRANT ALL PRIVILEGES ON DATABASE myprofile TO app_user;

-- Connect to the newly created database to proceed with table creation
\c myprofile

-- Create the 'posts' table
CREATE TABLE posts (
    -- Unique identifier for the post. 'SERIAL' creates an auto-incrementing integer.
    id SERIAL PRIMARY KEY,

    -- The title of the post. Cannot be empty.
    title VARCHAR(255) NOT NULL,

    -- A URL-friendly identifier for clean URLs.
    --slug VARCHAR(255) UNIQUE NOT NULL,

    -- Used to differentiate content. ADDING CHECK CONSTRAINT HERE
    post_type VARCHAR(50) NOT NULL CHECK (post_type IN ('books', 'notes', 'tech', 'music', 'movies')),

    -- The main body of the post, stored as Markdown text.
    content_body TEXT NOT NULL,

    -- Path to the main image/thumbnail (optional).
    thumbnail_url VARCHAR(255),

    -- Timestamp for when the post was created (default to the current time).
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Timestamp for when the post was last updated.
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 4. FIX PERMISSIONS FOR APP_USER (CRITICAL FOR YOUR ERROR)
-----------------------------------------------------------

-- Grant DML (Data Manipulation Language) privileges to app_user on the new table.
-- The app_user needs these permissions to read, create, update, and delete posts.
GRANT SELECT, INSERT, UPDATE, DELETE ON posts TO app_user;

-- Grant USAGE and SELECT privileges on the SEQUENCE created by SERIAL.
-- This is necessary for app_user to successfully insert new rows, as SERIAL uses a sequence
-- to generate the next 'id'.
GRANT USAGE, SELECT ON SEQUENCE posts_id_seq TO app_user;