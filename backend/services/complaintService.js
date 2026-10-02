const { v4: uuidv4 } = require('uuid');
const { randomBytes } = require('crypto');
const fs = require('fs');
const store = require('../models/store');
const { logAuditEvent } = require('../middleware/audit');
const { COMPLAINT_STATUS } = require('../config/constants');
const { encryptEvidenceFile } = require('./storageService');

const generateTrackingCode = () => {
  const year = new Date().getFullYear();
  return `TT-CASE-${year}-${randomBytes(16).toString('hex').toUpperCase()}`;
};

const fileComplaint = async (userOrNull, complaintData) => {
  let tracking_code = generateTrackingCode();
  while (store.complaints.some((complaint) => complaint.tracking_code === tracking_code)) {
    tracking_code = generateTrackingCode();
  }
  const isAnonymous = Boolean(complaintData.is_anonymous);
  const userId = isAnonymous ? null : (userOrNull ? userOrNull.id : null);
  const orgId = complaintData.org_id || (userOrNull ? userOrNull.org_id : '44444444-4444-4444-4444-444444444444');

  const newComplaint = {
    id: uuidv4(),
    tracking_code,
    user_id: userId,
    org_id: orgId,
    title: complaintData.title,
    category: complaintData.category,
    description: complaintData.description,
    incident_date: complaintData.incident_date,
    is_anonymous: isAnonymous,
    severity: complaintData.severity || 'medium',
    status: COMPLAINT_STATUS.SUBMITTED,
    assigned_to: null,
    consent_confirmed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.complaints.unshift(newComplaint);

  await logAuditEvent({
    actorId: userId,
    action: 'COMPLAINT_FILED',
    resourceType: 'complaint',
    resourceId: newComplaint.id,
    details: {
      tracking_code,
      category: newComplaint.category,
      is_anonymous: isAnonymous,
      org_id: orgId,
    },
  });

  return newComplaint;
};

const uploadEvidence = async (userOrNull, complaintId, trackingCode, file) => {
  const complaint = store.complaints.find(c => c.id === complaintId || c.tracking_code === complaintId);
  if (!complaint) {
    const error = new Error('Complaint not found for attaching evidence');
    error.statusCode = 404;
    error.code = 'COMPLAINT_NOT_FOUND';
    throw error;
  }

  const isOwner = Boolean(userOrNull && complaint.user_id === userOrNull.id);
  const isPrivileged = Boolean(userOrNull && ['super_admin', 'auditor'].includes(userOrNull.role));
  const isOrgHandler = Boolean(userOrNull && ['hr', 'counselor', 'ngo'].includes(userOrNull.role) &&
    (complaint.org_id === userOrNull.org_id || complaint.assigned_to === userOrNull.id));
  const hasTrackingCode = typeof trackingCode === 'string' && trackingCode === complaint.tracking_code;
  if (!isOwner && !isPrivileged && !isOrgHandler && !hasTrackingCode) {
    const error = new Error('A valid tracking code or authorized account is required to attach evidence');
    error.statusCode = 403;
    error.code = 'EVIDENCE_FORBIDDEN';
    throw error;
  }

  const header = await fs.promises.readFile(file.path).then((buffer) => buffer.subarray(0, 12));
  const isValidSignature = file.mimetype === 'application/pdf'
    ? header.subarray(0, 5).toString() === '%PDF-'
    : file.mimetype === 'image/png'
      ? header.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))
      : file.mimetype === 'image/jpeg'
        ? header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff
        : file.mimetype === 'image/webp'
          ? header.subarray(0, 4).toString() === 'RIFF' && header.subarray(8, 12).toString() === 'WEBP'
          : false;
  if (!isValidSignature) {
    const error = new Error('The file contents do not match the selected evidence type');
    error.statusCode = 400;
    error.code = 'INVALID_FILE_CONTENT';
    throw error;
  }

  const encryptedFile = await encryptEvidenceFile(file.path);

  const newEvidence = {
    id: uuidv4(),
    complaint_id: complaint.id,
    file_name: file.originalname,
    file_path: encryptedFile.file_path,
    encryption_iv: encryptedFile.encryption_iv,
    encryption_auth_tag: encryptedFile.encryption_auth_tag,
    file_type: file.mimetype,
    file_size: file.size,
    uploaded_by: userOrNull ? userOrNull.id : null,
    is_verified: false,
    created_at: new Date().toISOString(),
  };

  store.evidence.push(newEvidence);

  await logAuditEvent({
    actorId: userOrNull ? userOrNull.id : null,
    action: 'EVIDENCE_UPLOADED',
    resourceType: 'evidence',
    resourceId: newEvidence.id,
    details: {
      complaint_id: complaint.id,
      file_name: file.originalname,
      file_size: file.size,
    },
  });

  return {
    id: newEvidence.id,
    complaint_id: complaint.id,
    file_name: newEvidence.file_name,
    file_size: newEvidence.file_size,
    file_type: newEvidence.file_type,
    created_at: newEvidence.created_at,
  };
};

const getMyComplaints = async (user) => {
  return store.complaints
    .filter(c => c.user_id === user.id)
    .map(c => {
      const evidenceList = store.evidence.filter(e => e.complaint_id === c.id);
      return {
        ...c,
        evidence_count: evidenceList.length,
      };
    });
};

const getComplaintById = async (userOrNull, identifier) => {
  const complaint = store.complaints.find(c => c.id === identifier || c.tracking_code === identifier);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    error.code = 'COMPLAINT_NOT_FOUND';
    throw error;
  }

  const lookupByTrackingCode = identifier === complaint.tracking_code;

  // Check authorization if user is logged in
  if (userOrNull) {
    const isOwner = complaint.user_id === userOrNull.id;
    const isAssigned = complaint.assigned_to === userOrNull.id;
    const isPrivileged = ['super_admin', 'auditor'].includes(userOrNull.role);
    const isOrgHandler = ['hr', 'counselor', 'ngo'].includes(userOrNull.role) && complaint.org_id === userOrNull.org_id;

    if (!isOwner && !isAssigned && !isPrivileged && !isOrgHandler && !lookupByTrackingCode) {
      const error = new Error('Forbidden: You do not have permission to view this complaint');
      error.statusCode = 403;
      error.code = 'COMPLAINT_FORBIDDEN';
      throw error;
    }
  } else if (!lookupByTrackingCode) {
    const error = new Error('Use the confidential tracking code to look up a case');
    error.statusCode = 403;
    error.code = 'TRACKING_CODE_REQUIRED';
    throw error;
  }

  const evidenceList = store.evidence.filter(e => e.complaint_id === complaint.id).map(e => ({
    id: e.id,
    file_name: e.file_name,
    file_size: e.file_size,
    file_type: e.file_type,
    created_at: e.created_at,
  }));

  const canReadInternalNotes = Boolean(userOrNull && (
    userOrNull.role === 'super_admin' ||
    (['hr', 'counselor', 'ngo'].includes(userOrNull.role) &&
      (complaint.org_id === userOrNull.org_id || complaint.assigned_to === userOrNull.id))
  ));
  const notesList = canReadInternalNotes
    ? store.case_notes.filter(n => n.complaint_id === complaint.id).map((note) => {
      const author = store.users.find((item) => item.id === note.author_id);
      return { ...note, author_name: author ? author.full_name : 'Authorized Responder' };
    })
    : [];

  const org = store.organizations.find(o => o.id === complaint.org_id);
  const assignedUser = store.users.find(u => u.id === complaint.assigned_to);

  return {
    ...complaint,
    organization_name: org ? org.name : 'Unknown Organization',
    assigned_name: assignedUser ? assignedUser.full_name : 'Unassigned',
    evidence: evidenceList,
    notes_count: notesList.length,
    case_notes: notesList,
  };
};

module.exports = {
  fileComplaint,
  uploadEvidence,
  getMyComplaints,
  getComplaintById,
};
