/**
 * TeenTalk Comprehensive Test Suite Runner
 * Implements Test Cases: TT-AUTH-01 through TT-RESP-01
 */

process.env.NODE_ENV = 'test';
process.env.PORT = '5001';

const http = require('http');
const path = require('path');
const fs = require('fs');
const app = require('../server');

const PORT = 5001;
let server;

// Helper: Make HTTP request to test server
const request = ({ method, path: reqPath, headers = {}, body = null, isMultipart = false }) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: reqPath,
      method,
      headers: {
        ...headers,
      },
    };

    if (body && !isMultipart && typeof body === 'object') {
      options.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      if (typeof body === 'object' && !isMultipart) {
        req.write(JSON.stringify(body));
      } else if (typeof body === 'string' || Buffer.isBuffer(body)) {
        req.write(body);
      }
    }
    req.end();
  });
};

const results = [];

const runTest = async (testId, testName, fn) => {
  process.stdout.write(`⏳ Running [${testId}] ${testName}... `);
  try {
    await fn();
    console.log(`✅ PASSED`);
    results.push({ id: testId, name: testName, status: 'PASSED' });
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    results.push({ id: testId, name: testName, status: 'FAILED', error: err.message });
  }
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
};

const runAllTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 STARTING TEENTALK SYSTEM & API VERIFICATION TESTS');
  console.log('======================================================\n');

  server = app.listen(PORT);

  // Re-seed data store fresh
  const store = require('../models/store');
  store.reset();

  let teenToken = '';
  let adminToken = '';
  let employeeToken = '';
  let hrToken = '';
  let counselorToken = '';
  let schoolToken = '';

  // TT-AUTH-01: Register with valid details
  await runTest('TT-AUTH-01', 'Register with valid details', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        email: 'testteen@teentalk.org',
        password: 'Password123!',
        full_name: 'Test Student',
        role: 'teen',
      },
    });

    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    assert(res.body.success === true, 'Expected response success true');
    assert(res.body.data.user.email === 'testteen@teentalk.org', 'User email should match');
    assert(res.body.data.user.password_hash === undefined, 'Password hash must never be returned');
    assert(typeof res.body.data.token === 'string', 'Token should be returned');
    teenToken = res.body.data.token;
  });

  // TT-AUTH-02: Login with wrong password
  await runTest('TT-AUTH-02', 'Login with wrong password', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: 'admin@teentalk.org',
        password: 'WrongPassword999!',
      },
    });

    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    assert(res.body.success === false, 'Expected response success false');
    assert(res.body.error.code === 'INVALID_CREDENTIALS', 'Expected INVALID_CREDENTIALS error code');
  });

  // Log in required test users
  const adminLogin = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'admin@teentalk.org', password: 'Password123!' },
  });
  adminToken = adminLogin.body.data.token;

  const schoolLogin = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'school@teentalk.org', password: 'Password123!' },
  });
  schoolToken = schoolLogin.body.data.token;

  const hrLogin = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'hr@teentalk.org', password: 'Password123!' },
  });
  hrToken = hrLogin.body.data.token;

  const counselorLogin = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'counselor@teentalk.org', password: 'Password123!' },
  });
  counselorToken = counselorLogin.body.data.token;

  const empLogin = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'employee@teentalk.org', password: 'Password123!' },
  });
  employeeToken = empLogin.body.data.token;

  // TT-RBAC-01: Teen attempts to open admin API
  await runTest('TT-RBAC-01', 'Teen attempts to open admin API', async () => {
    const res = await request({
      method: 'GET',
      path: '/api/admin/users',
      headers: {
        Authorization: `Bearer ${teenToken}`,
      },
    });

    assert(res.status === 403, `Expected status 403 Forbidden, got ${res.status}`);
    assert(res.body.success === false, 'Expected success false');
    assert(res.body.error.code === 'FORBIDDEN_ROLE', 'Expected FORBIDDEN_ROLE error code');
  });

  // TT-TEEN-01: Teen completes a module
  await runTest('TT-TEEN-01', 'Teen completes a safety module', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/teen/progress/update',
      headers: {
        Authorization: `Bearer ${teenToken}`,
      },
      body: {
        module_id: 'b0000001-0000-0000-0000-000000000001',
        status: 'completed',
        score: 95,
        time_spent_seconds: 350,
      },
    });

    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(res.body.success === true, 'Expected success true');
    assert(res.body.data.status === 'completed', 'Status should be completed');
    assert(res.body.data.score === 95, 'Score should be 95');
  });

  // TT-SCHOOL-01: School Admin views students
  await runTest('TT-SCHOOL-01', 'School Admin views students', async () => {
    const res = await request({
      method: 'GET',
      path: '/api/school/students',
      headers: {
        Authorization: `Bearer ${schoolToken}`,
      },
    });

    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(res.body.success === true, 'Expected success true');
    assert(Array.isArray(res.body.data), 'Expected array of students');
  });

  // TT-COMP-01: Employee submits complaint
  let filedComplaint = null;
  await runTest('TT-COMP-01', 'Employee submits confidential complaint', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/complaints/file',
      headers: {
        Authorization: `Bearer ${employeeToken}`,
      },
      body: {
        title: 'Verbal harassment during annual review meeting',
        category: 'posh_harassment',
        description: 'During my appraisal meeting, inappropriate personal comments were made regarding my appearance.',
        incident_date: '2026-03-02',
        is_anonymous: false,
        severity: 'high',
        consent_confirmed: true,
      },
    });

    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    assert(res.body.success === true, 'Expected success true');
    assert(typeof res.body.data.tracking_code === 'string', 'Tracking code should be generated');
    filedComplaint = res.body.data;
  });

  // TT-COMP-01B: Public case lookups must use the confidential tracking token, not the UUID
  await runTest('TT-COMP-01B', 'Public case lookup requires the tracking token', async () => {
    const byId = await request({ method: 'GET', path: `/api/complaints/${filedComplaint.id}` });
    assert(byId.status === 403, `Expected ID lookup to be denied, got ${byId.status}`);
    assert(byId.body.error.code === 'TRACKING_CODE_REQUIRED', 'Expected TRACKING_CODE_REQUIRED error');

    const byTrackingCode = await request({ method: 'GET', path: `/api/complaints/${filedComplaint.tracking_code}` });
    assert(byTrackingCode.status === 200, `Expected tracking lookup status 200, got ${byTrackingCode.status}`);
  });

  // TT-COMP-02: Unsupported evidence file is rejected
  await runTest('TT-COMP-02', 'Unsupported evidence file (.exe) is rejected', async () => {
    const boundary = '----WebKitFormBoundaryABC123';
    const fakeExeContent = 'MZ executable test header';
    const postData = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="complaint_id"`,
      '',
      filedComplaint.id,
      `--${boundary}`,
      `Content-Disposition: form-data; name="evidence"; filename="malicious.exe"`,
      'Content-Type: application/x-msdownload',
      '',
      fakeExeContent,
      `--${boundary}--`,
    ].join('\r\n');

    const res = await request({
      method: 'POST',
      path: '/api/complaints/upload-evidence',
      headers: {
        Authorization: `Bearer ${employeeToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(postData),
      },
      body: postData,
      isMultipart: true,
    });

    assert(res.status === 400, `Expected status 400 Bad Request, got ${res.status}`);
    assert(res.body.success === false, 'Expected success false');
    assert(res.body.error.code === 'INVALID_FILE_TYPE', 'Expected INVALID_FILE_TYPE code');
  });

  // TT-COMP-03: A complaint ID alone must not authorize anonymous evidence uploads
  await runTest('TT-COMP-03', 'Evidence upload requires an authorized account or tracking code', async () => {
    const boundary = '----TeenTalkEvidenceBoundaryNoCode';
    const pdf = '%PDF-1.4\nprivate evidence\n%%EOF';
    const postData = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="complaint_id"`,
      '',
      filedComplaint.id,
      `--${boundary}`,
      `Content-Disposition: form-data; name="evidence"; filename="evidence.pdf"`,
      'Content-Type: application/pdf',
      '',
      pdf,
      `--${boundary}--`,
    ].join('\r\n');
    const res = await request({
      method: 'POST',
      path: '/api/complaints/upload-evidence',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(postData),
      },
      body: postData,
      isMultipart: true,
    });
    assert(res.status === 403, `Expected status 403, got ${res.status}`);
    assert(res.body.error.code === 'EVIDENCE_FORBIDDEN', 'Expected EVIDENCE_FORBIDDEN error');
  });

  // TT-COMP-04: Evidence is encrypted at rest and can be downloaded by an authorized handler
  await runTest('TT-COMP-04', 'Evidence encryption and authorized download', async () => {
    const boundary = '----TeenTalkEvidenceBoundaryWithCode';
    const pdf = '%PDF-1.4\nprivate evidence\n%%EOF';
    const postData = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="complaint_id"`,
      '',
      filedComplaint.id,
      `--${boundary}`,
      `Content-Disposition: form-data; name="tracking_code"`,
      '',
      filedComplaint.tracking_code,
      `--${boundary}`,
      `Content-Disposition: form-data; name="evidence"; filename="evidence.pdf"`,
      'Content-Type: application/pdf',
      '',
      pdf,
      `--${boundary}--`,
    ].join('\r\n');
    const uploadRes = await request({
      method: 'POST',
      path: '/api/complaints/upload-evidence',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(postData),
      },
      body: postData,
      isMultipart: true,
    });
    assert(uploadRes.status === 201, `Expected status 201, got ${uploadRes.status}`);

    const store = require('../models/store');
    const evidence = store.evidence.find((item) => item.id === uploadRes.body.data.id);
    assert(evidence && evidence.encryption_iv && evidence.encryption_auth_tag, 'Encryption metadata should be recorded');
    assert(fs.existsSync(evidence.file_path) && evidence.file_path.endsWith('.enc'), 'Only encrypted evidence should remain on disk');
    assert(fs.readFileSync(evidence.file_path).toString() !== pdf, 'Stored file contents must be ciphertext');

    const downloadRes = await request({
      method: 'GET',
      path: `/api/complaints/${filedComplaint.id}/evidence/${evidence.id}/download`,
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    assert(downloadRes.status === 200, `Expected status 200, got ${downloadRes.status}`);
    assert(downloadRes.body === pdf, 'Authorized download should decrypt the original file');
    if (fs.existsSync(evidence.file_path)) fs.unlinkSync(evidence.file_path);
  });

  // TT-HR-01: HR changes case status
  await runTest('TT-HR-01', 'HR changes case status', async () => {
    const res = await request({
      method: 'PATCH',
      path: `/api/hr/cases/${filedComplaint.id}`,
      headers: {
        Authorization: `Bearer ${hrToken}`,
      },
      body: {
        status: 'investigation_in_progress',
        resolution_summary: 'Internal committee convened and evidence under review',
      },
    });

    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(res.body.success === true, 'Expected success true');
    assert(res.body.data.status === 'investigation_in_progress', 'Expected status to be investigation_in_progress');
  });

  // TT-HR-02: HR records an internal case note
  await runTest('TT-HR-02', 'HR records an internal case note', async () => {
    const noteRes = await request({
      method: 'POST',
      path: `/api/hr/cases/${filedComplaint.id}/notes`,
      headers: { Authorization: `Bearer ${hrToken}` },
      body: { note_text: 'Committee evidence review scheduled.' },
    });
    assert(noteRes.status === 201, `Expected status 201, got ${noteRes.status}`);
    assert(noteRes.body.data.is_private === true, 'HR notes must remain private');

    const caseRes = await request({
      method: 'GET',
      path: `/api/complaints/${filedComplaint.id}`,
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    assert(caseRes.status === 200, `Expected status 200, got ${caseRes.status}`);
    assert(caseRes.body.data.case_notes.some((note) => note.note_text === 'Committee evidence review scheduled.'), 'Internal note should be visible to the authorized HR handler');
  });

  // TT-COUNSELOR-01: Counselor can record and read a note in their organization
  await runTest('TT-COUNSELOR-01', 'Counselor records a private note for an authorized case', async () => {
    const complaintRes = await request({
      method: 'POST',
      path: '/api/complaints/file',
      body: {
        title: 'Support request for wellbeing follow-up',
        category: 'mental_distress',
        description: 'The student requested a confidential wellbeing check-in and ongoing support.',
        incident_date: '2026-10-01',
        is_anonymous: true,
        consent_confirmed: true,
        org_id: '33333333-3333-3333-3333-333333333333',
      },
    });
    assert(complaintRes.status === 201, 'Expected counselor support case to be created');

    const noteRes = await request({
      method: 'POST',
      path: '/api/counselor/notes',
      headers: { Authorization: `Bearer ${counselorToken}` },
      body: {
        complaint_id: complaintRes.body.data.id,
        note_text: 'Private support plan agreed with the student.',
        is_private: true,
      },
    });
    assert(noteRes.status === 201, `Expected status 201, got ${noteRes.status}`);

    const caseRes = await request({
      method: 'GET',
      path: `/api/complaints/${complaintRes.body.data.id}`,
      headers: { Authorization: `Bearer ${counselorToken}` },
    });
    assert(caseRes.status === 200, `Expected status 200, got ${caseRes.status}`);
    assert(caseRes.body.data.case_notes.some((note) => note.note_text === 'Private support plan agreed with the student.'), 'Authorized counselor should be able to read the private note');
  });

  // TT-COUNSELOR-02: Counselors cannot write across organizations
  await runTest('TT-COUNSELOR-02', 'Counselor notes respect organization access', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/counselor/notes',
      headers: { Authorization: `Bearer ${counselorToken}` },
      body: {
        complaint_id: filedComplaint.id,
        note_text: 'Unauthorized cross-organization note attempt.',
        is_private: true,
      },
    });
    assert(res.status === 403, `Expected status 403, got ${res.status}`);
    assert(res.body.error.code === 'CASE_FORBIDDEN', 'Expected CASE_FORBIDDEN error');
  });

  // TT-AI-01: User asks an unsafe question
  await runTest('TT-AI-01', 'User asks crisis/unsafe question', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/ai/chat',
      body: {
        message: 'I want to hurt myself and end it all',
      },
    });

    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(res.body.data.is_crisis === true, 'Should detect crisis');
    assert(res.body.data.escalation !== null, 'Should return emergency escalation');
    assert(res.body.data.escalation.hotlines.length > 0, 'Should include emergency hotlines (1098 / 112)');
  });

  // TT-QUIZ-01: User submits quiz
  await runTest('TT-QUIZ-01', 'User submits quiz evaluation', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/quiz/evaluate',
      headers: {
        Authorization: `Bearer ${teenToken}`,
      },
      body: {
        quiz_id: 'c0000001-0000-0000-0000-000000000001',
        answers: {
          'd0000001-0000-0000-0000-000000000001': 'B',
          'd0000002-0000-0000-0000-000000000002': 'C',
          'd0000003-0000-0000-0000-000000000003': 'D',
        },
      },
    });

    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(res.body.data.score === 100, `Expected score 100, got ${res.body.data.score}`);
    assert(res.body.data.passed === true, 'Expected passed to be true');
  });

  // TT-CERT-01: User without passing score requests certificate
  await runTest('TT-CERT-01', 'User without passing score requests certificate', async () => {
    const res = await request({
      method: 'GET',
      path: '/api/certificate/generate/b0000004-0000-0000-0000-000000000004', // uncompleted module
      headers: {
        Authorization: `Bearer ${teenToken}`,
      },
    });

    assert(res.status === 400, `Expected status 400 Ineligible, got ${res.status}`);
    assert(res.body.success === false, 'Expected success false');
    assert(res.body.error.code === 'CERTIFICATE_INELIGIBLE', 'Expected CERTIFICATE_INELIGIBLE error code');
  });

  // TT-RESP-01: Website opens correctly on mobile width (Responsive frontend build and config check)
  await runTest('TT-RESP-01', 'Frontend responsive layout & viewport configuration verification', async () => {
    const indexHtmlPath = path.join(__dirname, '../../frontend/index.html');
    const tailwindConfigPath = path.join(__dirname, '../../frontend/tailwind.config.js');

    assert(fs.existsSync(indexHtmlPath), 'index.html exists');
    assert(fs.existsSync(tailwindConfigPath), 'tailwind.config.js exists');

    const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    assert(htmlContent.includes('viewport') && htmlContent.includes('width=device-width'), 'Viewport meta tag must be configured for mobile width');
  });

  console.log('\n======================================================');
  const passedCount = results.filter(r => r.status === 'PASSED').length;
  console.log(`🏁 TEST EXECUTION SUMMARY: ${passedCount}/${results.length} PASSED`);
  console.log('======================================================\n');

  server.close(() => {
    process.exit(passedCount === results.length ? 0 : 1);
  });
};

runAllTests().catch((err) => {
  console.error('Test runner fatal crash:', err);
  if (server) server.close();
  process.exit(1);
});
