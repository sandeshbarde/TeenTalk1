# TeenTalk - Comprehensive Project Requirements & Specifications

## 1. Functional Requirements (FR)

### FR-01: Authentication & Account Lifecycle
- **FR-01.1**: The system shall allow users to register with an email address, password (minimum 8 characters), full name, and designated role.
- **FR-01.2**: User passwords shall be salted and hashed using Bcrypt before persistence; plain text passwords must never be stored.
- **FR-01.3**: Authenticated sessions shall issue cryptographically signed JWT tokens carrying user ID, role, and organization ID.
- **FR-01.4**: Blocked or deactivated accounts shall be immediately rejected upon login or token verification with an explicit 403 status code.

### FR-02: Safety Learning & Curriculum Modules
- **FR-02.1**: The platform shall provide structured safety modules across categories: Cyber Safety, Safe Touch Boundaries, Anti-Bullying, Emotional Wellbeing, and POSH Awareness.
- **FR-02.2**: Modules shall track individual user progress with states: `not_started`, `in_progress`, and `completed`.
- **FR-02.3**: Progress tracking shall record completion timestamps and accumulated reading time.

### FR-03: Confidential & Anonymous Incident Reporting
- **FR-03.1**: Users and non-registered visitors shall be capable of submitting confidential incident reports with an optional anonymous flag.
- **FR-03.2**: Every report must generate a unique, cryptographically random bearer tracking token formatted as `TT-CASE-YYYY-<32 hexadecimal characters>`.
- **FR-03.3**: The complainant must explicitly acknowledge statutory consent before filing is processed.
- **FR-03.4**: File attachments (evidence) must be validated for allowed MIME types (PDF, PNG, JPG, WEBP) and constrained to a maximum size of 10MB.
- **FR-03.5**: Evidence files must be stored in private storage and strictly restricted from direct public URL access.

### FR-04: Institutional & POSH Case Management
- **FR-04.1**: Internal Committee (IC) and HR officers shall review reports belonging to their respective organizational scope.
- **FR-04.2**: Case status milestones shall support: `submitted`, `under_review`, `investigation_in_progress`, `hearing_scheduled`, `resolved`, `closed`, and `escalated_to_ngo`.
- **FR-04.3**: Case handlers shall have the ability to record formal resolution summaries and confidential investigation notes.

### FR-05: Mental Wellness, AI Safety & Crisis Escalation
- **FR-05.1**: The AI companion must detect self-harm, suicidal ideation, or severe physical abuse keywords and immediately trigger emergency escalation.
- **FR-05.2**: The escalation payload must include active national 24/7 helplines (Childline 1098, Emergency 112, Tele-MANAS 14416).
- **FR-05.3**: The AI companion must refuse to provide illegal hacking instructions, medical diagnoses, or legal advice.
- **FR-05.4**: The system shall provide an emotional wellness log capturing daily mood ratings (1 to 5), emotion descriptors, and private reflection entries.

### FR-06: Interactive Quizzes & Verified Certification
- **FR-06.1**: Quizzes must evaluate multiple-choice responses against answer keys on the backend, ensuring client inspection cannot reveal answers in advance.
- **FR-06.2**: Certificates shall only be granted to users who have completed the prerequisite module and scored at least 70%.
- **FR-06.3**: Generated certificates must feature a unique certificate code and a SHA-256 verification hash.

---

## 2. Non-Functional Requirements (NFR)

### NFR-01: Security & Confidentiality
- **NFR-01.1**: Adherence to the Principle of Least Privilege (PoLP) across all 10 roles.
- **NFR-01.2**: Multi-tenant isolation ensuring organizational data is scoped by `org_id`.
- **NFR-01.3**: Rate limiting on authentication (50 req/15min) and AI chat (60 req/15min) to prevent brute-force attacks and abuse.
- **NFR-01.4**: Secure HTTP headers enforced via Helmet.

### NFR-02: Usability & Accessibility (a11y)
- **NFR-02.1**: Responsive layout conforming to mobile, tablet, and desktop viewports (minimum 320px width).
- **NFR-02.2**: High-contrast, calm color palettes (teal, slate, blue) promoting an emotionally safe experience.
- **NFR-02.3**: Accessible form controls with explicit labels, semantic HTML tags, and keyboard navigability.

### NFR-03: Performance & Reliability
- **NFR-03.1**: API responses should complete within 300ms under standard loads.
- **NFR-03.2**: Stateless REST API design with dual-mode repository layer guaranteeing uptime during both local preview and cloud database connectivity.
