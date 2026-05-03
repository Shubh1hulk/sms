import crypto from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export type Role = 'student' | 'parent' | 'staff' | 'admin';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type DashboardSnapshot = {
  profile: { name: string; cohort: string; track: string; attendance: string; gpa: string };
  stats: Array<{ label: string; value: string; delta: string }>;
  schedule: Array<{ time: string; title: string; room: string; status: string }>;
  grades: Array<{ subject: string; score: string; trend: string }>;
  tasks: Array<{ title: string; due: string; level: string }>;
  announcements: Array<{ title: string; audience: string; time: string }>;
  modules: Array<{ title: string; description: string; status: string }>;
  attendance: Array<{ name: string; className: string; status: string }>;
};

export type StudentRecord = {
  id: string;
  name: string;
  grade: string;
  section: string;
  track: string;
  attendance: number;
  gpa: number;
  guardianName: string;
  guardianEmail: string;
  feeBalanceCents: number;
};

export type AdmissionRecord = {
  id: string;
  applicantName: string;
  guardianEmail: string;
  intendedGrade: string;
  notes: string;
  status: string;
  createdAt: string;
};

export type AttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  attendanceDate: string;
  status: string;
  notes: string;
  markedBy: string | null;
  createdAt: string;
};

export type FeeInvoiceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  term: string;
  amountCents: number;
  balanceCents: number;
  dueDate: string;
  status: string;
  notes: string;
  createdAt: string;
};

export type FeePaymentRecord = {
  id: string;
  invoiceId: string;
  studentId: string;
  amountCents: number;
  method: string;
  reference: string;
  paidAt: string;
};

export type AuditLogEntry = {
  id: string;
  actorId: string | null;
  actorName: string;
  actorRole: string;
  eventType: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  metadata: string;
  createdAt: string;
};

const dataDirectory = join(process.cwd(), 'data');
mkdirSync(dataDirectory, { recursive: true });

const database = new DatabaseSync(join(dataDirectory, 'sms.sqlite'));

database.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('student', 'parent', 'staff', 'admin')),
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    section TEXT NOT NULL,
    track TEXT NOT NULL,
    attendance_rate INTEGER NOT NULL,
    gpa REAL NOT NULL,
    guardian_name TEXT NOT NULL,
    guardian_email TEXT NOT NULL,
    fee_balance_cents INTEGER NOT NULL DEFAULT 0,
    is_featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS schedule_items (
    id TEXT PRIMARY KEY,
    cohort TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    room TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS grades (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    subject TEXT NOT NULL,
    score INTEGER NOT NULL,
    trend INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    due_label TEXT NOT NULL,
    level TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    audience TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admissions (
    id TEXT PRIMARY KEY,
    applicant_name TEXT NOT NULL,
    guardian_email TEXT NOT NULL,
    intended_grade TEXT NOT NULL,
    notes TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    attendance_date TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    marked_by TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(student_id, attendance_date),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS fee_invoices (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    term TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    balance_cents INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS fee_payments (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    method TEXT NOT NULL,
    reference TEXT NOT NULL,
    paid_at TEXT NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES fee_invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    actor_id TEXT,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    summary TEXT NOT NULL,
    metadata TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

function nowIso() {
  return new Date().toISOString();
}

function uuid() {
  return crypto.randomUUID();
}

function queryAll<T>(sql: string, params: Record<string, unknown> = {}): T[] {
  return database.prepare(sql).all(params as Record<string, any>) as T[];
}

function queryOne<T>(sql: string, params: Record<string, unknown> = {}): T | undefined {
  return database.prepare(sql).get(params as Record<string, any>) as T | undefined;
}

function execute(sql: string, params: Record<string, unknown> = {}) {
  return database.prepare(sql).run(params as Record<string, any>);
}

function logAudit(input: {
  actorId: string | null;
  actorName: string;
  actorRole: string;
  eventType: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  const record = {
    id: uuid(),
    actorId: input.actorId,
    actorName: input.actorName,
    actorRole: input.actorRole,
    eventType: input.eventType,
    entityType: input.entityType,
    entityId: input.entityId,
    summary: input.summary,
    metadata: JSON.stringify(input.metadata ?? {}),
    createdAt: nowIso()
  };

  execute(
    `INSERT INTO audit_log (
      id, actor_id, actor_name, actor_role, event_type, entity_type, entity_id, summary, metadata, created_at
    ) VALUES (
      @id, @actorId, @actorName, @actorRole, @eventType, @entityType, @entityId, @summary, @metadata, @createdAt
    )`,
    record
  );

  return record;
}

function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, expectedHash: string) {
  const actualHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actualHash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

function money(cents: number) {
  const dollars = cents / 100;
  return dollars >= 1000 ? `$${(dollars / 1000).toFixed(1)}K` : `$${dollars.toLocaleString('en-US')}`;
}

function percentage(value: number) {
  return `${Math.round(value)}%`;
}

function seedDatabase() {
  const existingUsers = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users');

  if ((existingUsers?.count ?? 0) > 0) {
    return;
  }

  const timestamp = nowIso();
  const sharedPassword = 'Demo@1234';
  const users = [
    { id: uuid(), name: 'Ava Brooks', email: 'ava@novacampus.dev', role: 'student' as const },
    { id: uuid(), name: 'Olivia Brooks', email: 'olivia@novacampus.dev', role: 'parent' as const },
    { id: uuid(), name: 'Mr. Daniel Hart', email: 'daniel@novacampus.dev', role: 'staff' as const },
    { id: uuid(), name: 'Principal Chen', email: 'admin@novacampus.dev', role: 'admin' as const }
  ];

  database.exec('BEGIN');

  try {
    for (const user of users) {
      const { salt, hash } = hashPassword(sharedPassword);
      execute(
        `INSERT INTO users (id, name, email, role, password_salt, password_hash, created_at)
         VALUES (@id, @name, @email, @role, @passwordSalt, @passwordHash, @createdAt)`,
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          passwordSalt: salt,
          passwordHash: hash,
          createdAt: timestamp
        }
      );
    }

    const ava = users[0];
    const studentRows = [
      {
        id: uuid(),
        userId: ava.id,
        name: 'Ava Brooks',
        grade: '11',
        section: 'A',
        track: 'Science + Design',
        attendanceRate: 97,
        gpa: 3.9,
        guardianName: 'Olivia Brooks',
        guardianEmail: 'olivia@novacampus.dev',
        feeBalanceCents: 184000,
        isFeatured: 1
      },
      {
        id: uuid(),
        userId: null,
        name: 'Noah Patel',
        grade: '11',
        section: 'A',
        track: 'Science + Design',
        attendanceRate: 92,
        gpa: 3.7,
        guardianName: 'Meera Patel',
        guardianEmail: 'meera@example.com',
        feeBalanceCents: 62000,
        isFeatured: 0
      },
      {
        id: uuid(),
        userId: null,
        name: 'Mia Carter',
        grade: '10',
        section: 'C',
        track: 'Media + Arts',
        attendanceRate: 99,
        gpa: 4.0,
        guardianName: 'Jordan Carter',
        guardianEmail: 'jordan@example.com',
        feeBalanceCents: 0,
        isFeatured: 0
      }
    ];

    for (const student of studentRows) {
      execute(
        `INSERT INTO students (
          id, user_id, name, grade, section, track, attendance_rate, gpa,
          guardian_name, guardian_email, fee_balance_cents, is_featured, created_at
        ) VALUES (
          @id, @userId, @name, @grade, @section, @track, @attendanceRate, @gpa,
          @guardianName, @guardianEmail, @feeBalanceCents, @isFeatured, @createdAt
        )`,
        { ...student, createdAt: timestamp }
      );
    }

    const featuredStudent = studentRows[0];

    const schedules = [
      { time: '08:30', title: 'Homeroom check-in', room: 'C-104', status: 'Now' },
      { time: '09:20', title: 'Physics lab', room: 'Lab 2', status: 'Next' },
      { time: '11:00', title: 'Math workshop', room: 'B-201', status: 'Later' }
    ];

    schedules.forEach((item, index) => {
      execute(
        `INSERT INTO schedule_items (id, cohort, display_order, time, title, room, status, created_at)
         VALUES (@id, @cohort, @displayOrder, @time, @title, @room, @status, @createdAt)`,
        {
          id: uuid(),
          cohort: '11A',
          displayOrder: index,
          time: item.time,
          title: item.title,
          room: item.room,
          status: item.status,
          createdAt: timestamp
        }
      );
    });

    [
      { subject: 'Physics', score: 94, trend: 3 },
      { subject: 'Mathematics', score: 91, trend: 1 },
      { subject: 'Literature', score: 88, trend: 0 }
    ].forEach((item, index) => {
      execute(
        `INSERT INTO grades (id, student_id, display_order, subject, score, trend, created_at)
         VALUES (@id, @studentId, @displayOrder, @subject, @score, @trend, @createdAt)`,
        {
          id: uuid(),
          studentId: featuredStudent.id,
          displayOrder: index,
          subject: item.subject,
          score: item.score,
          trend: item.trend,
          createdAt: timestamp
        }
      );
    });

    [
      { title: 'Upload chemistry worksheet', dueLabel: 'Today, 5:00 PM', level: 'High' },
      { title: 'Review project feedback', dueLabel: 'Tomorrow', level: 'Medium' },
      { title: 'Complete fee receipt check', dueLabel: 'Friday', level: 'Low' }
    ].forEach((item, index) => {
      execute(
        `INSERT INTO tasks (id, student_id, display_order, title, due_label, level, created_at)
         VALUES (@id, @studentId, @displayOrder, @title, @dueLabel, @level, @createdAt)`,
        {
          id: uuid(),
          studentId: featuredStudent.id,
          displayOrder: index,
          title: item.title,
          dueLabel: item.dueLabel,
          level: item.level,
          createdAt: timestamp
        }
      );
    });

    [
      { title: 'Orientation week schedule is live', audience: 'Students', body: 'Welcome week is now visible to all incoming classes.' },
      { title: 'Parent portal billing updates added', audience: 'Parents', body: 'Parents can now review balances and receipts quickly.' },
      { title: 'Exam timetable draft ready for review', audience: 'Teachers', body: 'Please verify conflicts before publishing.' }
    ].forEach((item) => {
      execute(
        `INSERT INTO announcements (id, title, audience, body, created_at)
         VALUES (@id, @title, @audience, @body, @createdAt)`,
        {
          id: uuid(),
          title: item.title,
          audience: item.audience,
          body: item.body,
          createdAt: timestamp
        }
      );
    });

    [
      { applicantName: 'Lena Martin', guardianEmail: 'lena.parent@example.com', intendedGrade: '9', notes: 'Prefers design track.', status: 'In review' },
      { applicantName: 'Aiden Ross', guardianEmail: 'aiden.guardian@example.com', intendedGrade: '11', notes: 'Needs scholarship review.', status: 'Awaiting interview' }
    ].forEach((item) => {
      execute(
        `INSERT INTO admissions (id, applicant_name, guardian_email, intended_grade, notes, status, created_at)
         VALUES (@id, @applicantName, @guardianEmail, @intendedGrade, @notes, @status, @createdAt)`,
        { id: uuid(), ...item, createdAt: timestamp }
      );
    });

    [
      { studentId: featuredStudent.id, studentName: featuredStudent.name, className: 'Grade 11A', attendanceDate: '2026-05-02', status: 'Present', notes: 'On time' },
      { studentId: studentRows[1].id, studentName: studentRows[1].name, className: 'Grade 11A', attendanceDate: '2026-05-02', status: 'Late', notes: 'Arrived after homeroom' },
      { studentId: studentRows[2].id, studentName: studentRows[2].name, className: 'Grade 10C', attendanceDate: '2026-05-02', status: 'Present', notes: 'Checked in' }
    ].forEach((item) => {
      execute(
        `INSERT INTO attendance_records (
          id, student_id, student_name, class_name, attendance_date, status, notes, marked_by, created_at
        ) VALUES (
          @id, @studentId, @studentName, @className, @attendanceDate, @status, @notes, NULL, @createdAt
        )`,
        { id: uuid(), ...item, createdAt: timestamp }
      );
    });

    [
      { studentId: featuredStudent.id, studentName: featuredStudent.name, term: 'Spring 2026', amountCents: 184000, balanceCents: 184000, dueDate: '2026-05-14', status: 'pending', notes: 'Main semester fees' },
      { studentId: studentRows[1].id, studentName: studentRows[1].name, term: 'Spring 2026', amountCents: 62000, balanceCents: 22000, dueDate: '2026-05-09', status: 'partial', notes: 'Lab and activity fee' }
    ].forEach((item) => {
      execute(
        `INSERT INTO fee_invoices (
          id, student_id, student_name, term, amount_cents, balance_cents, due_date, status, notes, created_at
        ) VALUES (
          @id, @studentId, @studentName, @term, @amountCents, @balanceCents, @dueDate, @status, @notes, @createdAt
        )`,
        { id: uuid(), ...item, createdAt: timestamp }
      );
    });

    [
      { invoiceId: queryOne<{ id: string }>('SELECT id FROM fee_invoices ORDER BY created_at ASC LIMIT 1')?.id ?? '', studentId: featuredStudent.id, amountCents: 0, method: 'cash', reference: 'INIT-0001' }
    ].filter((payment) => payment.invoiceId).forEach((payment) => {
      execute(
        `INSERT INTO fee_payments (id, invoice_id, student_id, amount_cents, method, reference, paid_at)
         VALUES (@id, @invoiceId, @studentId, @amountCents, @method, @reference, @paidAt)`,
        { id: uuid(), ...payment, paidAt: timestamp }
      );
    });

    [
      {
        actorId: users[3].id,
        actorName: users[3].name,
        actorRole: 'admin',
        eventType: 'system.seed',
        entityType: 'database',
        entityId: null,
        summary: 'Seeded the initial campus dataset',
        metadata: { tables: ['users', 'students', 'schedule_items', 'grades', 'tasks', 'admissions', 'attendance_records', 'fee_invoices', 'fee_payments'] }
      },
      {
        actorId: users[3].id,
        actorName: users[3].name,
        actorRole: 'admin',
        eventType: 'system.seed',
        entityType: 'security',
        entityId: null,
        summary: 'Provisioned demo identity and workflow access',
        metadata: { roles: ['student', 'parent', 'staff', 'admin'] }
      }
    ].forEach((entry) => {
      logAudit(entry);
    });

    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

seedDatabase();

export function getDashboardSnapshot(): DashboardSnapshot {
  const featuredStudent = queryOne<StudentRecord>(`SELECT * FROM students WHERE is_featured = 1 LIMIT 1`) ??
    queryOne<StudentRecord>(`SELECT * FROM students ORDER BY created_at ASC LIMIT 1`);

  if (!featuredStudent) {
    throw new Error('No student records found');
  }

  const studentCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM students')?.count ?? 0;
  const attendanceAverage = queryOne<{ avg: number }>('SELECT COALESCE(AVG(attendance_rate), 0) as avg FROM students')?.avg ?? 0;
  const pendingFeesCents = queryOne<{ total: number }>('SELECT COALESCE(SUM(fee_balance_cents), 0) as total FROM students')?.total ?? 0;
  const openTaskCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM tasks WHERE student_id = @studentId', { studentId: featuredStudent.id })?.count ?? 0;

  const schedule = queryAll<{ time: string; title: string; room: string; status: string }>(
    'SELECT time, title, room, status FROM schedule_items WHERE cohort = @cohort ORDER BY display_order ASC',
    { cohort: `${featuredStudent.grade}${featuredStudent.section}` }
  );

  const grades = queryAll<{ subject: string; score: number; trend: number }>(
    'SELECT subject, score, trend FROM grades WHERE student_id = @studentId ORDER BY display_order ASC',
    { studentId: featuredStudent.id }
  ).map((grade) => ({
    subject: grade.subject,
    score: String(grade.score),
    trend: grade.trend > 0 ? `+${grade.trend}` : String(grade.trend)
  }));

  const tasks = queryAll<{ title: string; dueLabel: string; level: string }>(
    'SELECT title, due_label as dueLabel, level FROM tasks WHERE student_id = @studentId ORDER BY display_order ASC',
    { studentId: featuredStudent.id }
  ).map((task) => ({
    title: task.title,
    due: task.dueLabel,
    level: task.level
  }));

  const announcements = queryAll<{ title: string; audience: string; createdAt: string }>(
    'SELECT title, audience, created_at as createdAt FROM announcements ORDER BY created_at DESC LIMIT 3'
  ).map((announcement) => ({
    title: announcement.title,
    audience: announcement.audience,
    time: relativeTime(announcement.createdAt)
  }));

  const attendance = queryAll<{ studentName: string; className: string; status: string }>(
    'SELECT student_name as studentName, class_name as className, status FROM attendance_records ORDER BY created_at DESC LIMIT 3'
  );

  return {
    profile: {
      name: featuredStudent.name,
      cohort: `Grade ${featuredStudent.grade}${featuredStudent.section}`,
      track: featuredStudent.track,
      attendance: percentage(featuredStudent.attendance),
      gpa: featuredStudent.gpa.toFixed(1)
    },
    stats: [
      { label: 'Active students', value: String(studentCount), delta: '+2.1% this month' },
      { label: 'Attendance rate', value: percentage(attendanceAverage), delta: '+1.1% from last week' },
      { label: 'Pending fees', value: money(pendingFeesCents), delta: '-12% overdue balance' },
      { label: 'Open tasks', value: String(openTaskCount), delta: '3 need urgent attention' }
    ],
    schedule,
    grades,
    tasks,
    announcements,
    modules: [
      { title: 'Admissions', description: 'Streamlined onboarding with smart document capture.', status: 'Ready' },
      { title: 'Attendance', description: 'One-tap live marking with instant parent notifications.', status: 'Live' },
      { title: 'Analytics', description: 'Python-backed reporting for trends, risks, and insights.', status: 'Building' }
    ],
    attendance: attendance.map((record) => ({
      name: record.studentName,
      className: record.className,
      status: record.status
    }))
  };
}

export function listStudents() {
  return queryAll<StudentRecord>('SELECT * FROM students ORDER BY created_at ASC').map((student) => ({
    id: student.id,
    name: student.name,
    grade: student.grade,
    section: student.section,
    track: student.track,
    attendance: student.attendance,
    gpa: student.gpa,
    guardianName: student.guardianName,
    guardianEmail: student.guardianEmail,
    feeBalance: money(student.feeBalanceCents)
  }));
}

export function listAdmissions(): AdmissionRecord[] {
  return queryAll<AdmissionRecord>('SELECT * FROM admissions ORDER BY created_at DESC');
}

export function createAdmission(input: { applicantName: string; guardianEmail: string; intendedGrade: string; notes: string }) {
  const record = {
    id: uuid(),
    applicantName: input.applicantName.trim(),
    guardianEmail: input.guardianEmail.trim(),
    intendedGrade: input.intendedGrade.trim(),
    notes: input.notes.trim(),
    status: 'In review',
    createdAt: nowIso()
  };

  execute(
    `INSERT INTO admissions (id, applicant_name, guardian_email, intended_grade, notes, status, created_at)
     VALUES (@id, @applicantName, @guardianEmail, @intendedGrade, @notes, @status, @createdAt)`,
    record
  );

  return record;
}

export function listAttendance() {
  return queryAll<AttendanceRecord>('SELECT * FROM attendance_records ORDER BY created_at DESC');
}

export function markAttendance(input: { studentId: string; date: string; status: string; notes: string; markedBy: string | null }) {
  const student = queryOne<StudentRecord>('SELECT * FROM students WHERE id = @studentId', { studentId: input.studentId });

  if (!student) {
    throw new Error('Student not found');
  }

  const record = {
    id: uuid(),
    studentId: student.id,
    studentName: student.name,
    className: `Grade ${student.grade}${student.section}`,
    attendanceDate: input.date,
    status: input.status,
    notes: input.notes.trim(),
    markedBy: input.markedBy,
    createdAt: nowIso()
  };

  execute(
    `INSERT INTO attendance_records (
      id, student_id, student_name, class_name, attendance_date, status, notes, marked_by, created_at
    ) VALUES (
      @id, @studentId, @studentName, @className, @attendanceDate, @status, @notes, @markedBy, @createdAt
    )
    ON CONFLICT(student_id, attendance_date) DO UPDATE SET
      student_name = excluded.student_name,
      class_name = excluded.class_name,
      status = excluded.status,
      notes = excluded.notes,
      marked_by = excluded.marked_by,
      created_at = excluded.created_at`,
    record
  );

  return record;
}

export function listInvoices() {
  return queryAll<FeeInvoiceRecord>('SELECT * FROM fee_invoices ORDER BY created_at DESC');
}

export function createInvoice(input: { studentId: string; term: string; amountCents: number; dueDate: string; notes: string }) {
  const student = queryOne<StudentRecord>('SELECT * FROM students WHERE id = @studentId', { studentId: input.studentId });

  if (!student) {
    throw new Error('Student not found');
  }

  const record = {
    id: uuid(),
    studentId: student.id,
    studentName: student.name,
    term: input.term.trim(),
    amountCents: input.amountCents,
    balanceCents: input.amountCents,
    dueDate: input.dueDate,
    status: 'pending',
    notes: input.notes.trim(),
    createdAt: nowIso()
  };

  database.exec('BEGIN');

  try {
    execute(
      `INSERT INTO fee_invoices (
        id, student_id, student_name, term, amount_cents, balance_cents, due_date, status, notes, created_at
      ) VALUES (
        @id, @studentId, @studentName, @term, @amountCents, @balanceCents, @dueDate, @status, @notes, @createdAt
      )`,
      record
    );

    execute(
      `UPDATE students SET fee_balance_cents = fee_balance_cents + @amountCents WHERE id = @studentId`,
      { amountCents: input.amountCents, studentId: student.id }
    );

    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }

  return record;
}

export function listPayments() {
  return queryAll<FeePaymentRecord>('SELECT * FROM fee_payments ORDER BY paid_at DESC');
}

export function recordPayment(input: { invoiceId: string; amountCents: number; method: string; reference: string }) {
  const invoice = queryOne<FeeInvoiceRecord>('SELECT * FROM fee_invoices WHERE id = @invoiceId', { invoiceId: input.invoiceId });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const remaining = Math.max(0, invoice.balanceCents - input.amountCents);
  const newStatus = remaining === 0 ? 'paid' : 'partial';

  const record = {
    id: uuid(),
    invoiceId: invoice.id,
    studentId: invoice.studentId,
    amountCents: input.amountCents,
    method: input.method.trim(),
    reference: input.reference.trim(),
    paidAt: nowIso()
  };

  database.exec('BEGIN');

  try {
    execute(
      `INSERT INTO fee_payments (id, invoice_id, student_id, amount_cents, method, reference, paid_at)
       VALUES (@id, @invoiceId, @studentId, @amountCents, @method, @reference, @paidAt)`,
      record
    );

    execute(
      `UPDATE fee_invoices SET balance_cents = @balanceCents, status = @status WHERE id = @invoiceId`,
      { balanceCents: remaining, status: newStatus, invoiceId: invoice.id }
    );

    execute(
      `UPDATE students SET fee_balance_cents = MAX(fee_balance_cents - @amountCents, 0) WHERE id = @studentId`,
      { amountCents: input.amountCents, studentId: invoice.studentId }
    );

    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }

  return { ...record, remainingCents: remaining, status: newStatus };
}

export function listAuditEntries(limit = 40) {
  return queryAll<AuditLogEntry>(
    'SELECT * FROM audit_log ORDER BY created_at DESC, rowid DESC LIMIT @limit',
    { limit }
  ).map((entry) => ({
    ...entry,
    metadata: entry.metadata
  }));
}

export function appendAuditLog(input: {
  actorId: string | null;
  actorName: string;
  actorRole: string;
  eventType: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  return logAudit(input);
}

export function getAdmissionById(admissionId: string) {
  return queryOne<AdmissionRecord>('SELECT * FROM admissions WHERE id = @admissionId', { admissionId });
}

export function updateAdmission(admissionId: string, input: { applicantName: string; guardianEmail: string; intendedGrade: string; notes: string }) {
  const existing = getAdmissionById(admissionId);

  if (!existing) {
    throw new Error('Admission not found');
  }

  const record = {
    id: existing.id,
    applicantName: input.applicantName.trim(),
    guardianEmail: input.guardianEmail.trim(),
    intendedGrade: input.intendedGrade.trim(),
    notes: input.notes.trim(),
    status: existing.status,
    createdAt: existing.createdAt
  };

  execute(
    `UPDATE admissions
     SET applicant_name = @applicantName,
         guardian_email = @guardianEmail,
         intended_grade = @intendedGrade,
         notes = @notes
     WHERE id = @id`,
    record
  );

  return record;
}

export function deleteAdmission(admissionId: string) {
  const existing = getAdmissionById(admissionId);

  if (!existing) {
    throw new Error('Admission not found');
  }

  execute('DELETE FROM admissions WHERE id = @admissionId', { admissionId });
  return existing;
}

export function getAttendanceById(attendanceId: string) {
  return queryOne<AttendanceRecord>('SELECT * FROM attendance_records WHERE id = @attendanceId', { attendanceId });
}

export function updateAttendance(attendanceId: string, input: { studentId: string; date: string; status: string; notes: string }) {
  const existing = getAttendanceById(attendanceId);

  if (!existing) {
    throw new Error('Attendance record not found');
  }

  const student = queryOne<StudentRecord>('SELECT * FROM students WHERE id = @studentId', { studentId: input.studentId });

  if (!student) {
    throw new Error('Student not found');
  }

  const record = {
    id: existing.id,
    studentId: student.id,
    studentName: student.name,
    className: `Grade ${student.grade}${student.section}`,
    attendanceDate: input.date,
    status: input.status,
    notes: input.notes.trim(),
    markedBy: existing.markedBy,
    createdAt: existing.createdAt
  };

  execute(
    `UPDATE attendance_records
     SET student_id = @studentId,
         student_name = @studentName,
         class_name = @className,
         attendance_date = @attendanceDate,
         status = @status,
         notes = @notes
     WHERE id = @id`,
    record
  );

  return record;
}

export function deleteAttendance(attendanceId: string) {
  const existing = getAttendanceById(attendanceId);

  if (!existing) {
    throw new Error('Attendance record not found');
  }

  execute('DELETE FROM attendance_records WHERE id = @attendanceId', { attendanceId });
  return existing;
}

export function getInvoiceById(invoiceId: string) {
  return queryOne<FeeInvoiceRecord>('SELECT * FROM fee_invoices WHERE id = @invoiceId', { invoiceId });
}

export function updateInvoice(invoiceId: string, input: { studentId: string; term: string; amountCents: number; dueDate: string; notes: string }) {
  const existing = getInvoiceById(invoiceId);

  if (!existing) {
    throw new Error('Invoice not found');
  }

  const student = queryOne<StudentRecord>('SELECT * FROM students WHERE id = @studentId', { studentId: input.studentId });

  if (!student) {
    throw new Error('Student not found');
  }

  const delta = input.amountCents - existing.amountCents;
  const newBalance = Math.max(existing.balanceCents + delta, 0);

  const record = {
    id: existing.id,
    studentId: student.id,
    studentName: student.name,
    term: input.term.trim(),
    amountCents: input.amountCents,
    balanceCents: newBalance,
    dueDate: input.dueDate,
    status: newBalance === 0 ? 'paid' : existing.status,
    notes: input.notes.trim(),
    createdAt: existing.createdAt
  };

  database.exec('BEGIN');

  try {
    execute(
      `UPDATE fee_invoices
       SET student_id = @studentId,
           student_name = @studentName,
           term = @term,
           amount_cents = @amountCents,
           balance_cents = @balanceCents,
           due_date = @dueDate,
           status = @status,
           notes = @notes
       WHERE id = @id`,
      record
    );

    if (delta !== 0) {
      execute(
        `UPDATE students SET fee_balance_cents = MAX(fee_balance_cents + @delta, 0) WHERE id = @studentId`,
        { delta, studentId: student.id }
      );
    }

    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }

  return record;
}

export function deleteInvoice(invoiceId: string) {
  const existing = getInvoiceById(invoiceId);

  if (!existing) {
    throw new Error('Invoice not found');
  }

  database.exec('BEGIN');

  try {
    execute('UPDATE students SET fee_balance_cents = MAX(fee_balance_cents - @balanceCents, 0) WHERE id = @studentId', {
      balanceCents: existing.balanceCents,
      studentId: existing.studentId
    });
    execute('DELETE FROM fee_invoices WHERE id = @invoiceId', { invoiceId });
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }

  return existing;
}

export function getPaymentById(paymentId: string) {
  return queryOne<FeePaymentRecord>('SELECT * FROM fee_payments WHERE id = @paymentId', { paymentId });
}

export function deletePayment(paymentId: string) {
  const existing = getPaymentById(paymentId);

  if (!existing) {
    throw new Error('Payment not found');
  }

  const invoice = getInvoiceById(existing.invoiceId);

  database.exec('BEGIN');

  try {
    execute('DELETE FROM fee_payments WHERE id = @paymentId', { paymentId });

    if (invoice) {
      const restoredBalance = invoice.balanceCents + existing.amountCents;
      execute(
        `UPDATE fee_invoices SET balance_cents = @balanceCents, status = CASE WHEN @balanceCents = 0 THEN 'paid' ELSE 'partial' END WHERE id = @invoiceId`,
        { balanceCents: restoredBalance, invoiceId: invoice.id }
      );

      execute(
        `UPDATE students SET fee_balance_cents = fee_balance_cents + @amountCents WHERE id = @studentId`,
        { amountCents: existing.amountCents, studentId: invoice.studentId }
      );
    }

    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }

  return existing;
}

export function getAllAnnouncements() {
  return queryAll<{ title: string; audience: string; body: string; createdAt: string }>(
    'SELECT title, audience, body, created_at as createdAt FROM announcements ORDER BY created_at DESC'
  );
}

export function getAuthenticatedUser(email: string, password: string) {
  const user = queryOne<{ id: string; name: string; email: string; role: Role; password_salt: string; password_hash: string }>(
    'SELECT * FROM users WHERE email = @email',
    { email: email.trim().toLowerCase() }
  );

  if (!user || !verifyPassword(password, user.password_salt, user.password_hash)) {
    return null;
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role } satisfies SessionUser;
}

export function createSession(user: SessionUser) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  execute(
    `INSERT INTO sessions (id, token, user_id, created_at, expires_at)
     VALUES (@id, @token, @userId, @createdAt, @expiresAt)`,
    {
      id: uuid(),
      token,
      userId: user.id,
      createdAt: now.toISOString(),
      expiresAt
    }
  );

  return { token, expiresAt };
}

export function deleteSession(token: string) {
  execute('DELETE FROM sessions WHERE token = @token', { token });
}

export function getSessionUser(token: string) {
  const row = queryOne<{ token: string; expires_at: string; id: string; name: string; email: string; role: Role }>(
    `SELECT sessions.token, sessions.expires_at, users.id, users.name, users.email, users.role
     FROM sessions
     INNER JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = @token`,
    { token }
  );

  if (!row) {
    return null;
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    deleteSession(token);
    return null;
  }

  return { id: row.id, name: row.name, email: row.email, role: row.role } satisfies SessionUser;
}

export function getCookieToken(cookieHeader: string | undefined) {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith('sms_session='));

  return match ? match.split('=').slice(1).join('=') : null;
}

export function createAuthCookie(token: string, expiresAt: string) {
  return `sms_session=${token}; HttpOnly; Path=/; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}`;
}

export function clearAuthCookie() {
  return 'sms_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0';
}

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
  return `${hours}h ago`;
}
