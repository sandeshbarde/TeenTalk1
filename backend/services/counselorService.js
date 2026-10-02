const { v4: uuidv4 } = require('uuid');
const store = require('../models/store');
const { logAuditEvent } = require('../middleware/audit');

const getCounselorCases = async (counselorUser) => {
  // Counselor can view complaints requiring guidance or assigned to them, or in their org
  const cases = store.complaints.filter(
    c => counselorUser.role === 'super_admin' || c.org_id === counselorUser.org_id || c.assigned_to === counselorUser.id
  );

  return cases.map(c => {
    const notesCount = store.case_notes.filter(n => n.complaint_id === c.id).length;
    return {
      ...c,
      notes_count: notesCount,
    };
  });
};

const addCaseNote = async (counselorUser, { complaint_id, note_text, is_private = true }) => {
  if (!complaint_id || !note_text || !note_text.trim()) {
    const error = new Error('Complaint ID and note text are required');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const complaint = store.complaints.find(c => c.id === complaint_id || c.tracking_code === complaint_id);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    error.code = 'COMPLAINT_NOT_FOUND';
    throw error;
  }

  const canHandleCase = counselorUser.role === 'super_admin' ||
    complaint.org_id === counselorUser.org_id || complaint.assigned_to === counselorUser.id;
  if (!canHandleCase) {
    const error = new Error('You are not authorized to add notes to this case');
    error.statusCode = 403;
    error.code = 'CASE_FORBIDDEN';
    throw error;
  }

  const newNote = {
    id: uuidv4(),
    complaint_id: complaint.id,
    author_id: counselorUser.id,
    note_text: note_text.trim(),
    is_private: Boolean(is_private),
    created_at: new Date().toISOString(),
  };

  store.case_notes.push(newNote);

  await logAuditEvent({
    actorId: counselorUser.id,
    action: 'COUNSELOR_NOTE_ADDED',
    resourceType: 'case_notes',
    resourceId: newNote.id,
    details: { complaint_id: complaint.id },
  });

  return {
    ...newNote,
    author_name: counselorUser.full_name,
  };
};

const getCounselorCalendar = async (counselorUser) => {
  // Simulated sessions scheduled for student wellbeing
  return [
    {
      id: 'session-01',
      student_alias: 'Student #409',
      topic: 'Cyberbullying recovery & anxiety coping',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '10:30 AM - 11:15 AM',
      location: 'School Wellness Room 204 / Secure Tele-session',
      status: 'confirmed',
    },
    {
      id: 'session-02',
      student_alias: 'Student #112',
      topic: 'Exam stress & sleep regulation',
      date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      time: '02:00 PM - 02:45 PM',
      location: 'Secure Video Call',
      status: 'scheduled',
    },
  ];
};

module.exports = {
  getCounselorCases,
  addCaseNote,
  getCounselorCalendar,
};
