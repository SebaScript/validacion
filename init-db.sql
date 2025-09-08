-- Initialize Vallmere database
CREATE DATABASE vallmere;

-- Create user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'vallmere_user') THEN

      CREATE ROLE vallmere_user LOGIN PASSWORD 'vallmere_password';
   END IF;
END
$do$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE vallmere TO vallmere_user;

-- Connect to the database
\c vallmere

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO vallmere_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vallmere_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vallmere_user; 