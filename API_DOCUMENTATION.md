# TeenTalk - REST API Specification & Endpoint Documentation

Base URL: `http://localhost:5000/api`

Standard Response Envelope:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

Standard Error Envelope:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": null
  }
}
```

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new user profile.
- **Access**: Public (Rate-limited: 50 req/15min)
- **Body**:
  ```json
  {
    "email": "teen@teentalk.org",
    "password": "Password123!",
    "full_name": "Payal Sharma",
    "role": "teen",
    "org_id": "optional-uuid"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "User registration successful",
    "data": {
      "user": { "id": "uuid", "email": "teen@teentalk.org", "full_name": "Payal Sharma", "role": "teen" },
      "token": "jwt-token-string"
    }
  }
  ```

### `POST /auth/login`
Authenticates a user and issues a JWT token.
- **Access**: Public
- **Body**: `{ "email": "admin@teentalk.org", "password": "Password123!" }`
- **Response** (200 OK): Returns user data and JWT token.

### `GET /auth/me`
Retrieves the profile and organization details of the authenticated caller.
- **Access**: Authenticated (Bearer token)
- **Response** (200 OK): User details with linked organization object.

### `PATCH /auth/profile`
Updates display name, avatar, or contact telephone.
- **Access**: Authenticated

---

## 2. Teen Safety & Curriculum Endpoints

### `GET /teen/modules`
Returns all published educational safety modules with personal progress states if authenticated.
- **Access**: Public / Authenticated

### `GET /teen/modules/:id`
Retrieves detailed educational text, reading duration, and linked quiz metadata.
- **Access**: Public / Authenticated

### `GET /teen/progress`
Returns total enrolled modules, completions, and completion percentage for the caller.
- **Access**: Authenticated (`teen`, `adult`, `school_admin`, `super_admin`)

### `POST /teen/progress/update`
Updates status (`not_started`, `in_progress`, `completed`), attained score, and accumulated time spent.
- **Access**: Authenticated (`teen`)

---

## 3. School Governance Endpoints

### `GET /school/students`
Lists students enrolled within the school administrator's organization with completion metrics.
- **Access**: Authenticated (`school_admin`, `super_admin`)

### `GET /school/analytics`
Generates aggregate participation analytics, completion rates, and module adoption graphs.
- **Access**: Authenticated (`school_admin`, `super_admin`)

### `GET /school/modules`
Returns curriculum modules active for the institution.

### `POST /school/modules`
Adds a custom institutional safety module to the curriculum.

### `PATCH /school/modules/:id`
Updates content or publishing state of an existing curriculum module.

---

## 4. Administration Endpoints

### `GET /admin/users`
Lists all users with optional query filtering (`role`, `org_id`, `search`).
- **Access**: Authenticated (`super_admin`)

### `PATCH /admin/users/:id`
Updates user role, organization link, or toggles account blocking (`is_blocked`).
- **Access**: Authenticated (`super_admin`)

### `DELETE /admin/users/:id`
Permanently deletes a user profile from the database.
- **Access**: Authenticated (`super_admin`)

### `GET /admin/orgs`
Lists all registered schools, NGOs, and corporate partners.
- **Access**: Authenticated (`super_admin`, `auditor`)

### `POST /admin/orgs`
Creates and issues an enrollment code for a new partner organization.
- **Access**: Authenticated (`super_admin`)

### `GET /admin/audit-logs`
Queries the chronological audit trail of administrative and security events.
- **Access**: Authenticated (`super_admin`, `auditor`)

---

## 5. Confidential Complaints & POSH Endpoints

### `POST /complaints/file`
Submits a confidential report.
- **Access**: Public / Optional Authenticated
- **Body**:
  ```json
  {
    "title": "Unwelcome remarks in appraisal meeting",
    "category": "posh_harassment",
    "description": "Detailed factual account...",
    "incident_date": "2026-03-01",
    "is_anonymous": false,
    "severity": "high",
    "consent_confirmed": true
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": { "id": "uuid", "tracking_code": "TT-CASE-2026-<32 hex characters>", "status": "submitted" }
  }
  ```

### `POST /complaints/upload-evidence`
Attaches PDF or image evidence to a case record.
- **Access**: Public / Optional Authenticated
- **Content-Type**: `multipart/form-data`
- **Fields**: `complaint_id`, `tracking_code` (required for anonymous uploads), `evidence` (file)
- Evidence file signatures are validated and files are encrypted at rest with AES-256-GCM. Production deployments must configure `EVIDENCE_ENCRYPTION_KEY`.

### `GET /complaints/my`
Retrieves all non-anonymous complaints submitted by the caller.
- **Access**: Authenticated (`employee`, `teen`, `adult`)

### `GET /complaints/:id`
Retrieves public status timeline and committee resolution using tracking code or case ID.
- **Access**: Public (token-authorized) / Authenticated

### `GET /complaints/:id/evidence/:evidenceId/download`
Streams the private evidence attachment. Direct public URLs are blocked.
- **Access**: Authenticated (Complainant, HR, Counselor, or Super Admin only)

---

## 6. HR & POSH Redressal Endpoints

### `GET /hr/cases`
Lists all active inquiries within the HR user's organization scope.
- **Access**: Authenticated (`hr`, `super_admin`)

### `GET /hr/cases/:id`
Retrieves comprehensive investigation history, evidence items, and case notes.
- **Access**: Authenticated (`hr`, `super_admin`)

### `PATCH /hr/cases/:id`
Updates investigation milestone (`investigation_in_progress`, `hearing_scheduled`, `resolved`), severity, or resolution summary.
- **Access**: Authenticated (`hr`, `super_admin`)

### `POST /hr/cases/:id/notes`
Adds a private committee note to a case in the HR user's organization.
- **Access**: Authenticated (`hr`, `super_admin`)
- **Body**: `{ "note_text": "Internal committee note" }`

---

## 7. Counselor & NGO Support Endpoints

### `GET /counselor/cases`
Retrieves support referrals requiring psycho-social counseling or victim advocacy.
- **Access**: Authenticated (`counselor`, `ngo`, `super_admin`)

### `POST /counselor/notes`
Appends a confidential clinical or guidance observation to a case file.
- **Access**: Authenticated (`counselor`, `ngo`, `super_admin`)

### `GET /counselor/calendar`
Lists confirmed and upcoming student wellness sessions.
- **Access**: Authenticated (`counselor`, `super_admin`)

---

## 8. AI Safety & Mental Health Endpoints

### `POST /ai/chat`
Educational peer guidance chat. Automatically detects crisis or self-harm keywords and escalates with emergency helpline hotlines (`1098`, `112`).
- **Access**: Public / Optional Authenticated (Rate-limited: 60 req/15min)
- **Body**: `{ "message": "How do I secure my account?" }`

### `POST /mentalhealth/mood-log`
Records daily mood score (1-5), emotion tags, and private reflections.
- **Access**: Authenticated (`teen`, `adult`, `employee`)

### `GET /mentalhealth/mood-history`
Returns historical mood logs and average wellness trends.
- **Access**: Authenticated

---

## 9. Quiz & Certification Endpoints

### `GET /quiz`
Lists active quizzes and question counts.

### `GET /quiz/:id`
Retrieves quiz questions without exposing correct answer keys to the client.

### `POST /quiz/evaluate`
Grades submitted answers, stores results, and updates module progress.
- **Access**: Authenticated

### `GET /certificate/generate/:courseId`
Issues a verifiable safety certificate if passing requirements (≥70%) are met; returns 400 Ineligible otherwise.
- **Access**: Authenticated

### `GET /certificate/verify/:code`
Public verification endpoint validating certificate authenticity and SHA-256 digest.
