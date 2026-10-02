require('dotenv').config();

const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || 'teentalk-academic-super-secure-jwt-secret-key-2026',
  EVIDENCE_ENCRYPTION_KEY: process.env.EVIDENCE_ENCRYPTION_KEY || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  STORAGE_BUCKET_NAME: process.env.STORAGE_BUCKET_NAME || 'complaint-evidence',
};

if (config.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Production requires a unique JWT_SECRET of at least 32 characters');
  }
  if (!config.EVIDENCE_ENCRYPTION_KEY) {
    throw new Error('Production requires EVIDENCE_ENCRYPTION_KEY for encrypted evidence storage');
  }
}

module.exports = config;
