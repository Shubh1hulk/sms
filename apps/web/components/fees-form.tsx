'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Student = {
  id: string;
  name: string;
  grade: string;
  section: string;
};

type FeeInvoice = {
  id: string;
  studentName: string;
  term: string;
  amountCents: number;
  balanceCents: number;
  dueDate: string;
  status: string;
};

type FeePayment = {
  id: string;
  invoiceId: string;
  amountCents: number;
  method: string;
  reference: string;
  paidAt: string;
};

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function FeesForm({ students, invoices, payments }: { students: Student[]; invoices: FeeInvoice[]; payments: FeePayment[] }) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(students[0]?.id ?? '');
  const [term, setTerm] = useState('Spring 2026');
  const [amount, setAmount] = useState('1840');
  const [dueDate, setDueDate] = useState('2026-05-30');
  const [notes, setNotes] = useState('Semester tuition and activity coverage.');
  const [invoiceId, setInvoiceId] = useState(invoices[0]?.id ?? '');
  const [paymentAmount, setPaymentAmount] = useState('250');
  const [method, setMethod] = useState('Card');
  const [reference, setReference] = useState('PAY-2026-001');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/api/fees/invoices`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          term,
          amountCents: Math.round(Number(amount) * 100),
          dueDate,
          notes
        })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Unable to create invoice.');
      }

      router.refresh();
    } catch (thrownError) {
      setError(thrownError instanceof Error ? thrownError.message : 'Unable to create invoice.');
    } finally {
      setBusy(false);
    }
  }

  async function recordPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/api/fees/payments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          amountCents: Math.round(Number(paymentAmount) * 100),
          method,
          reference
        })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Unable to record payment.');
      }

      router.refresh();
    } catch (thrownError) {
      setError(thrownError instanceof Error ? thrownError.message : 'Unable to record payment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="workflow-grid workflow-grid-two">
      <form className="workflow-form card" onSubmit={createInvoice}>
        <h2 className="section-title section-title-large">Create invoice</h2>
        <div className="field-grid">
          <label className="field">
            <span>Student</span>
            <select className="select" value={studentId} onChange={(event) => setStudentId(event.target.value)}>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} · Grade {student.grade}{student.section}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Term</span>
            <input className="input" value={term} onChange={(event) => setTerm(event.target.value)} />
          </label>
          <label className="field">
            <span>Amount ($)</span>
            <input className="input" type="number" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>
          <label className="field">
            <span>Due date</span>
            <input className="input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
          <label className="field field-full">
            <span>Notes</span>
            <textarea className="textarea" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
        </div>
        <button className="submit-button" type="submit" disabled={busy}>
          {busy ? 'Saving...' : 'Create invoice'}
        </button>
      </form>

      <form className="workflow-form card" onSubmit={recordPayment}>
        <h2 className="section-title section-title-large">Record payment</h2>
        <div className="field-grid">
          <label className="field">
            <span>Invoice</span>
            <select className="select" value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)}>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.studentName} · {invoice.term} · Balance {formatMoney(invoice.balanceCents)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Amount ($)</span>
            <input className="input" type="number" step="0.01" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} />
          </label>
          <label className="field">
            <span>Method</span>
            <input className="input" value={method} onChange={(event) => setMethod(event.target.value)} />
          </label>
          <label className="field">
            <span>Reference</span>
            <input className="input" value={reference} onChange={(event) => setReference(event.target.value)} />
          </label>
        </div>
        <button className="submit-button" type="submit" disabled={busy}>
          {busy ? 'Saving...' : 'Record payment'}
        </button>
      </form>

      {error ? <div className="notice error workflow-notice">{error}</div> : null}

      <section className="card workflow-table-card">
        <h2 className="section-title section-title-large">Invoices</h2>
        <div className="record-list">
          {invoices.map((invoice) => (
            <article className="record-item" key={invoice.id}>
              <strong>{invoice.studentName}</strong>
              <div className="subtle">{invoice.term} · Due {invoice.dueDate}</div>
              <div className="record-meta">
                <span>{invoice.status}</span>
                <span>Balance {formatMoney(invoice.balanceCents)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card workflow-table-card">
        <h2 className="section-title section-title-large">Payments</h2>
        <div className="record-list">
          {payments.map((payment) => (
            <article className="record-item" key={payment.id}>
              <strong>{payment.reference}</strong>
              <div className="subtle">Invoice {payment.invoiceId} · {payment.method}</div>
              <div className="record-meta">
                <span>{formatMoney(payment.amountCents)}</span>
                <span>{new Date(payment.paidAt).toLocaleDateString()}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
