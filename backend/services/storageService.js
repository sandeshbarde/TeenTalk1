const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const store = require('../models/store');

const getEvidenceEncryptionKey = () => {
  if (env.EVIDENCE_ENCRYPTION_KEY) {
    const configuredKey = /^[a-f0-9]{64}$/i.test(env.EVIDENCE_ENCRYPTION_KEY)
      ? Buffer.from(env.EVIDENCE_ENCRYPTION_KEY, 'hex')
      : Buffer.from(env.EVIDENCE_ENCRYPTION_KEY, 'base64');
    if (configuredKey.length !== 32) {
      throw new Error('EVIDENCE_ENCRYPTION_KEY must encode exactly 32 bytes (64 hex characters or base64)');
    }
    return configuredKey;
  }

  if (env.NODE_ENV === 'production') {
    throw new Error('EVIDENCE_ENCRYPTION_KEY must be configured in production');
  }
  return crypto.createHash('sha256').update(`teentalk-local-evidence:${env.JWT_SECRET}`).digest();
};

const encryptEvidenceFile = async (sourcePath) => {
  const key = getEvidenceEncryptionKey();
  const iv = crypto.randomBytes(12);
  const plaintext = await fs.promises.readFile(sourcePath);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const encryptedPath = `${sourcePath}.enc`;

  try {
    await fs.promises.writeFile(encryptedPath, encrypted, { flag: 'wx' });
    await fs.promises.unlink(sourcePath);
  } catch (error) {
    await fs.promises.unlink(encryptedPath).catch(() => {});
    throw error;
  }

  return { file_path: encryptedPath, encryption_iv: iv.toString('base64'), encryption_auth_tag: cipher.getAuthTag().toString('base64') };
};

const decryptEvidenceFile = async (evidence) => {
  if (!evidence.encryption_iv || !evidence.encryption_auth_tag) {
    return fs.promises.readFile(evidence.file_path);
  }
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getEvidenceEncryptionKey(),
    Buffer.from(evidence.encryption_iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(evidence.encryption_auth_tag, 'base64'));
  const encrypted = await fs.promises.readFile(evidence.file_path);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};

/**
 * Storage Service for Sensitive Complaint Evidence
 * Ensures evidence files are never exposed through public static file directories.
 */
const generateEvidenceAccessToken = (evidenceId, userId) => {
  return jwt.sign(
    {
      evidenceId,
      userId,
      purpose: 'evidence_download',
    },
    env.JWT_SECRET,
    { expiresIn: '15m' } // 15-minute expiring access grant
  );
};

const verifyEvidenceAccess = (user, evidenceId) => {
  const evidence = store.evidence.find(e => e.id === evidenceId);
  if (!evidence) {
    const error = new Error('Evidence record not found');
    error.statusCode = 404;
    error.code = 'EVIDENCE_NOT_FOUND';
    throw error;
  }

  const complaint = store.complaints.find(c => c.id === evidence.complaint_id);
  if (!complaint) {
    const error = new Error('Associated complaint not found');
    error.statusCode = 404;
    error.code = 'COMPLAINT_NOT_FOUND';
    throw error;
  }

  // Super admin and auditor can inspect
  if (['super_admin', 'auditor'].includes(user.role)) {
    return { evidence, complaint };
  }

  // Complainant can view if not anonymous or if uploaded by them
  if (complaint.user_id === user.id || evidence.uploaded_by === user.id) {
    return { evidence, complaint };
  }

  // Authorized HR, Counselor, or NGO in the same organization
  if (['hr', 'counselor', 'ngo'].includes(user.role) && complaint.org_id === user.org_id) {
    return { evidence, complaint };
  }

  const error = new Error('Forbidden: You are not authorized to view this confidential evidence');
  error.statusCode = 403;
  error.code = 'EVIDENCE_FORBIDDEN';
  throw error;
};

module.exports = {
  generateEvidenceAccessToken,
  verifyEvidenceAccess,
  encryptEvidenceFile,
  decryptEvidenceFile,
};
