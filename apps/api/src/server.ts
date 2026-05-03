import cors from 'cors';
import express from 'express';
import {
  appendAuditLog,
  clearAuthCookie,
  createAuthCookie,
  createAdmission,
  createInvoice,
  createSession,
  deleteSession,
  deleteAdmission,
  deleteAttendance,
  deleteInvoice,
  deletePayment,
  getAllAnnouncements,
  getAuthenticatedUser,
  getCookieToken,
  getDashboardSnapshot,
  getSessionUser,
  getAdmissionById,
  getAttendanceById,
  getInvoiceById,
  getPaymentById,
  listAuditEntries,
  listAdmissions,
  listAttendance,
  listInvoices,
  listPayments,
  listStudents,
  markAttendance,
  recordPayment
  , updateAdmission,
  updateAttendance,
  updateInvoice
} from './store.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';

app.use(cors({ origin: webOrigin, credentials: true }));
app.use(express.json());

function requireSession(request: express.Request) {
  const token = getCookieToken(request.headers.cookie);
  return token ? getSessionUser(token) : null;
}

function sendJsonError(response: express.Response, status: number, message: string) {
  response.status(status).json({ error: message });
}

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'sms-api' });
});

app.get('/api/dashboard', (_request, response) => {
  response.json(getDashboardSnapshot());
});

app.get('/api/schedule', (_request, response) => {
  response.json(getDashboardSnapshot().schedule);
});

app.get('/api/grades', (_request, response) => {
  response.json(getDashboardSnapshot().grades);
});

app.get('/api/tasks', (_request, response) => {
  response.json(getDashboardSnapshot().tasks);
});

app.get('/api/students', (_request, response) => {
  response.json(listStudents());
});

app.get('/api/announcements', (_request, response) => {
  response.json(getAllAnnouncements());
});

app.get('/api/audit', (_request, response) => {
  response.json(listAuditEntries());
});

app.get('/api/audit/recent', (request, response) => {
  const limit = Number(request.query.limit ?? 10);
  response.json(listAuditEntries(Number.isFinite(limit) ? limit : 10));
});

app.post('/api/auth/login', (request, response) => {
  const { email, password } = request.body as { email?: string; password?: string };

  if (!email || !password) {
    return sendJsonError(response, 400, 'Email and password are required.');
  }

  const user = getAuthenticatedUser(email, password);

  if (!user) {
    return sendJsonError(response, 401, 'Invalid email or password.');
  }

  const session = createSession(user);
  appendAuditLog({
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    eventType: 'auth.login',
    entityType: 'session',
    entityId: user.id,
    summary: `${user.role} signed in`,
    metadata: { email: user.email }
  });
  response.setHeader('Set-Cookie', createAuthCookie(session.token, session.expiresAt));
  response.json({ user, expiresAt: session.expiresAt });
});

app.post('/api/auth/logout', (request, response) => {
  const token = getCookieToken(request.headers.cookie);
  const session = token ? getSessionUser(token) : null;

  if (session && token) {
    appendAuditLog({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      eventType: 'auth.logout',
      entityType: 'session',
      entityId: session.id,
      summary: `${session.role} signed out`,
      metadata: { email: session.email }
    });
    deleteSession(token);
  }

  response.setHeader('Set-Cookie', clearAuthCookie());
  response.json({ ok: true });
});

app.get('/api/auth/me', (request, response) => {
  const user = requireSession(request);

  if (!user) {
    return sendJsonError(response, 401, 'Not authenticated.');
  }

  response.json({ user });
});

app.get('/api/admissions', (_request, response) => {
  response.json(listAdmissions());
});

app.post('/api/admissions', (request, response) => {
  const session = requireSession(request);

  if (!session) {
    return sendJsonError(response, 401, 'Sign in to submit admissions.');
  }

  const { applicantName, guardianEmail, intendedGrade, notes } = request.body as {
    applicantName?: string;
    guardianEmail?: string;
    intendedGrade?: string;
    notes?: string;
  };

  if (!applicantName || !guardianEmail || !intendedGrade || !notes) {
    return sendJsonError(response, 400, 'All admission fields are required.');
  }

  const record = createAdmission({ applicantName, guardianEmail, intendedGrade, notes });
  appendAuditLog({
    actorId: session.id,
    actorName: session.name,
    actorRole: session.role,
    eventType: 'admissions.create',
    entityType: 'admission',
    entityId: record.id,
    summary: `Created admission for ${record.applicantName}`,
    metadata: { guardianEmail: record.guardianEmail, intendedGrade: record.intendedGrade, status: record.status }
  });

  response.status(201).json(record);
});

app.patch('/api/admissions/:id', (request, response) => {
  const session = requireSession(request);

  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    return sendJsonError(response, 403, 'You do not have permission to edit admissions.');
  }

  const { id } = request.params;
  const { applicantName, guardianEmail, intendedGrade, notes } = request.body as {
    applicantName?: string;
    guardianEmail?: string;
    intendedGrade?: string;
    notes?: string;
  };

  if (!applicantName || !guardianEmail || !intendedGrade || !notes) {
    return sendJsonError(response, 400, 'All admission fields are required.');
  }

  try {
    const record = updateAdmission(id, { applicantName, guardianEmail, intendedGrade, notes });
    appendAuditLog({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      eventType: 'admissions.update',
      entityType: 'admission',
      entityId: record.id,
      summary: `Updated admission for ${record.applicantName}`,
      metadata: { guardianEmail: record.guardianEmail, intendedGrade: record.intendedGrade, status: record.status }
    });
    response.json(record);
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to update admission.' });
  }
});

app.delete('/api/admissions/:id', (request, response) => {
  const session = requireSession(request);

  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    return sendJsonError(response, 403, 'You do not have permission to delete admissions.');
  }

  const { id } = request.params;

  try {
    const record = deleteAdmission(id);
    appendAuditLog({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      eventType: 'admissions.delete',
      entityType: 'admission',
      entityId: record.id,
      summary: `Deleted admission for ${record.applicantName}`,
      metadata: { guardianEmail: record.guardianEmail, intendedGrade: record.intendedGrade, status: record.status }
    });
    response.json({ ok: true });
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to delete admission.' });
  }
});

app.get('/api/attendance', (_request, response) => {
  response.json(listAttendance());
});

app.post('/api/attendance/mark', (request, response) => {
  const session = requireSession(request);

  if (!session) {
    return sendJsonError(response, 401, 'Sign in to mark attendance.');
  }

  const { studentId, date, status, notes } = request.body as {
    studentId?: string;
    date?: string;
    status?: string;
    notes?: string;
  };

  if (!studentId || !date || !status || !notes) {
    return sendJsonError(response, 400, 'All attendance fields are required.');
  }

  try {
    const record = markAttendance({ studentId, date, status, notes, markedBy: session.id });
    appendAuditLog({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      eventType: 'attendance.mark',
      entityType: 'attendance_record',
      entityId: record.id,
      summary: `Marked ${record.studentName} as ${record.status}`,
      metadata: { className: record.className, attendanceDate: record.attendanceDate, notes: record.notes }
    });
    response.status(201).json(record);
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to save attendance.' });
  }
});

app.patch('/api/attendance/:id', (request, response) => {
  const session = requireSession(request);

  if (!session || (session.role !== 'staff' && session.role !== 'admin')) {
    return sendJsonError(response, 403, 'You do not have permission to edit attendance.');
  }

  const { id } = request.params;
  const { studentId, date, status, notes } = request.body as {
    studentId?: string;
    date?: string;
    status?: string;
    notes?: string;
  };

  if (!studentId || !date || !status || !notes) {
    return sendJsonError(response, 400, 'All attendance fields are required.');
  }

  try {
    const record = updateAttendance(id, { studentId, date, status, notes });
    appendAuditLog({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      eventType: 'attendance.update',
      entityType: 'attendance_record',
      entityId: record.id,
      summary: `Updated attendance for ${record.studentName}`,
      metadata: { className: record.className, attendanceDate: record.attendanceDate, status: record.status }
    });
    response.json(record);
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to update attendance.' });
  }
});

app.delete('/api/attendance/:id', (request, response) => {
  const session = requireSession(request);

  if (!session || (session.role !== 'staff' && session.role !== 'admin')) {
    return sendJsonError(response, 403, 'You do not have permission to delete attendance.');
  }

  const { id } = request.params;

  try {
    const record = deleteAttendance(id);
    appendAuditLog({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      eventType: 'attendance.delete',
      entityType: 'attendance_record',
      entityId: record.id,
      summary: `Deleted attendance for ${record.studentName}`,
      metadata: { className: record.className, attendanceDate: record.attendanceDate, status: record.status }
    });
    response.json({ ok: true });
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to delete attendance.' });
  }
});

app.get('/api/fees/invoices', (_request, response) => {
  response.json(listInvoices());
});

app.post('/api/fees/invoices', (request, response) => {
  const session = requireSession(request);

  if (!session) {
    return sendJsonError(response, 401, 'Sign in to create fee invoices.');
  }

  const { studentId, term, amountCents, dueDate, notes } = request.body as {
    studentId?: string;
    term?: string;
    amountCents?: number;
    dueDate?: string;
    notes?: string;
  };

  if (!studentId || !term || typeof amountCents !== 'number' || !dueDate || !notes) {
    return sendJsonError(response, 400, 'All invoice fields are required.');
  }

  try {
    const record = createInvoice({ studentId, term, amountCents, dueDate, notes });
    appendAuditLog({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      eventType: 'fees.invoice.create',
      entityType: 'fee_invoice',
      entityId: record.id,
      summary: `Created fee invoice for ${record.studentName}`,
      metadata: { term: record.term, amountCents: record.amountCents, dueDate: record.dueDate, status: record.status }
    });
    response.status(201).json(record);
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to create invoice.' });
  }
});

app.patch('/api/fees/invoices/:id', (request, response) => {
  const session = requireSession(request);

  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    return sendJsonError(response, 403, 'You do not have permission to edit fee invoices.');
  }

  const { id } = request.params;
  const { studentId, term, amountCents, dueDate, notes } = request.body as {
    studentId?: string;
    term?: string;
    amountCents?: number;
    dueDate?: string;
    notes?: string;
  };

  if (!studentId || !term || typeof amountCents !== 'number' || !dueDate || !notes) {
    return sendJsonError(response, 400, 'All invoice fields are required.');
  }

  try {
    const record = updateInvoice(id, { studentId, term, amountCents, dueDate, notes });
    appendAuditLog({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      eventType: 'fees.invoice.update',
      entityType: 'fee_invoice',
      entityId: record.id,
      summary: `Updated fee invoice for ${record.studentName}`,
      metadata: { term: record.term, amountCents: record.amountCents, balanceCents: record.balanceCents, status: record.status }
    });
    response.json(record);
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to update invoice.' });
  }
});

app.delete('/api/fees/invoices/:id', (request, response) => {
  const session = requireSession(request);

  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    return sendJsonError(response, 403, 'You do not have permission to delete fee invoices.');
  }

  const { id } = request.params;

  try {
    const record = deleteInvoice(id);
    appendAuditLog({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      eventType: 'fees.invoice.delete',
      entityType: 'fee_invoice',
      entityId: record.id,
      summary: `Deleted fee invoice for ${record.studentName}`,
      metadata: { term: record.term, amountCents: record.amountCents, balanceCents: record.balanceCents, status: record.status }
    });
    response.json({ ok: true });
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to delete invoice.' });
  }
});

app.get('/api/fees/payments', (_request, response) => {
  response.json(listPayments());
});

app.post('/api/fees/payments', (request, response) => {
  const session = requireSession(request);

  if (!session) {
    return sendJsonError(response, 401, 'Sign in to record payments.');
  }

  const { invoiceId, amountCents, method, reference } = request.body as {
    invoiceId?: string;
    amountCents?: number;
    method?: string;
    reference?: string;
  };

  if (!invoiceId || typeof amountCents !== 'number' || !method || !reference) {
    return sendJsonError(response, 400, 'All payment fields are required.');
  }

  try {
    const record = recordPayment({ invoiceId, amountCents, method, reference });
    appendAuditLog({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      eventType: 'fees.payment.record',
      entityType: 'fee_payment',
      entityId: record.id,
      summary: `Recorded ${record.status} payment on invoice ${invoiceId}`,
      metadata: { amountCents: record.amountCents, method: record.method, reference: record.reference, remainingCents: record.remainingCents }
    });
    response.status(201).json(record);
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to record payment.' });
  }
});

app.delete('/api/fees/payments/:id', (request, response) => {
  const session = requireSession(request);

  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    return sendJsonError(response, 403, 'You do not have permission to void payments.');
  }

  const { id } = request.params;

  try {
    const record = deletePayment(id);
    appendAuditLog({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      eventType: 'fees.payment.delete',
      entityType: 'fee_payment',
      entityId: record.id,
      summary: `Voided payment ${record.reference}`,
      metadata: { invoiceId: record.invoiceId, amountCents: record.amountCents, method: record.method }
    });
    response.json({ ok: true });
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to void payment.' });
  }
});

app.listen(port, () => {
  console.log(`SMS API running on http://localhost:${port}`);
});
