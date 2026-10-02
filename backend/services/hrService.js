const store = require('../models/store');
const { v4: uuidv4 } = require('uuid');
const { logAuditEvent } = require('../middleware/audit');
const { COMPLAINT_STATUS } = require('../config/constants');

const getHRCases = async (hrUser, filters = {}) => {
  let cases = store.complaints.filter(c => hrUser.role === 'super_admin' || c.org_id === hrUser.org_id);

  if (filters.status) {
    cases = cases.filter(c => c.status === filters.status);
  }
  if (filters.category) {
    cases = cases.filter(c => c.category === filters.category);
  }

  return cases.map(c => {
    const evidenceCount = store.evidence.filter(e => e.complaint_id === c.id).length;
    const notesCount = store.case_notes.filter(n => n.complaint_id === c.id).length;
    const assigned = store.users.find(u => u.id === c.assigned_to);

    return {
      ...c,
      evidence_count: evidenceCount,
      notes_count: notesCount,
      assigned_to_name: assigned ? assigned.full_name : 'Unassigned',
    };
  });
};

const getHRCaseById = async (hrUser, caseId) => {
  const c = store.complaints.find(comp => comp.id === caseId || comp.tracking_code === caseId);
  if (!c) {
    const error = new Error('Case not found');
    error.statusCode = 404;
    error.code = 'CASE_NOT_FOUND';
    throw error;
  }

  if (hrUser.role !== 'super_admin' && c.org_id !== hrUser.org_id) {
    const error = new Error('Forbidden: Case belongs to another organization');
    error.statusCode = 403;
    error.code = 'ORG_MISMATCH';
    throw error;
  }

  const complainant = c.is_anonymous ? null : store.users.find(u => u.id === c.user_id);
  const evidence = store.evidence.filter(e => e.complaint_id === c.id).map(e => ({
    id: e.id,
    file_name: e.file_name,
    file_type: e.file_type,
    file_size: e.file_size,
    created_at: e.created_at,
  }));

  const notes = store.case_notes.filter(n => n.complaint_id === c.id).map(n => {
    const author = store.users.find(u => u.id === n.author_id);
    return {
      ...n,
      author_name: author ? author.full_name : 'Internal Team',
    };
  });

  return {
    ...c,
    complainant: complainant ? { full_name: complainant.full_name, email: complainant.email } : { full_name: 'Anonymous Reporter' },
    evidence,
    case_notes: notes,
  };
};

const updateHRCase = async (hrUser, caseId, updates) => {
  const cIndex = store.complaints.findIndex(comp => comp.id === caseId || comp.tracking_code === caseId);
  if (cIndex === -1) {
    const error = new Error('Case not found');
    error.statusCode = 404;
    error.code = 'CASE_NOT_FOUND';
    throw error;
  }

  const currentCase = store.complaints[cIndex];
  if (hrUser.role !== 'super_admin' && currentCase.org_id !== hrUser.org_id) {
    const error = new Error('Forbidden: Case belongs to another organization');
    error.statusCode = 403;
    error.code = 'ORG_MISMATCH';
    throw error;
  }

  const allowedUpdates = ['status', 'severity', 'assigned_to', 'resolution_summary'];
  for (const field of allowedUpdates) {
    if (updates[field] !== undefined) {
      store.complaints[cIndex][field] = updates[field];
    }
  }

  store.complaints[cIndex].updated_at = new Date().toISOString();

  await logAuditEvent({
    actorId: hrUser.id,
    action: 'HR_CASE_UPDATED',
    resourceType: 'complaint',
    resourceId: currentCase.id,
    details: {
      tracking_code: currentCase.tracking_code,
      updated_fields: updates,
    },
  });

  return store.complaints[cIndex];
};

const addHRCaseNote = async (hrUser, caseId, noteText) => {
  if (!noteText || !noteText.trim()) {
    const error = new Error('Note text is required');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const complaint = store.complaints.find((item) => item.id === caseId || item.tracking_code === caseId);
  if (!complaint) {
    const error = new Error('Case not found');
    error.statusCode = 404;
    error.code = 'CASE_NOT_FOUND';
    throw error;
  }
  if (hrUser.role !== 'super_admin' && complaint.org_id !== hrUser.org_id) {
    const error = new Error('Forbidden: Case belongs to another organization');
    error.statusCode = 403;
    error.code = 'ORG_MISMATCH';
    throw error;
  }

  const note = {
    id: uuidv4(),
    complaint_id: complaint.id,
    author_id: hrUser.id,
    note_text: noteText.trim(),
    is_private: true,
    created_at: new Date().toISOString(),
  };
  store.case_notes.push(note);
  await logAuditEvent({
    actorId: hrUser.id,
    action: 'HR_CASE_NOTE_ADDED',
    resourceType: 'case_notes',
    resourceId: note.id,
    details: { complaint_id: complaint.id },
  });

  return { ...note, author_name: hrUser.full_name };
};

module.exports = {
  getHRCases,
  getHRCaseById,
  updateHRCase,
  addHRCaseNote,
};
