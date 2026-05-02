import cors from 'cors';
import express from 'express';
import {
  clearAuthCookie,
  createAuthCookie,
  createAdmission,
  createInvoice,
  createSession,
  deleteSession,
  getAllAnnouncements,
  getAuthenticatedUser,
  getCookieToken,
  getDashboardSnapshot,
  getSessionUser,
  listAdmissions,
  listAttendance,
  listInvoices,
  listPayments,
  listStudents,
  markAttendance,
  recordPayment
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
  response.setHeader('Set-Cookie', createAuthCookie(session.token, session.expiresAt));
  response.json({ user, expiresAt: session.expiresAt });
});

app.post('/api/auth/logout', (request, response) => {
  const token = getCookieToken(request.headers.cookie);

  if (token) {
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

  response.status(201).json(createAdmission({ applicantName, guardianEmail, intendedGrade, notes }));
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
    response.status(201).json(record);
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to save attendance.' });
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
    response.status(201).json(createInvoice({ studentId, term, amountCents, dueDate, notes }));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to create invoice.' });
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
    response.status(201).json(recordPayment({ invoiceId, amountCents, method, reference }));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to record payment.' });
  }
});

app.listen(port, () => {
  console.log(`SMS API running on http://localhost:${port}`);
});
