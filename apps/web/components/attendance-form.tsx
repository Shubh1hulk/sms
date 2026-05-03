'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type Student = {
  id: string;
  name: string;
  grade: string;
  section: string;
  track: string;
};

type AttendanceRecord = {
  id: string;
  studentName: string;
  className: string;
  attendanceDate: string;
  status: string;
  notes: string;
};

export default function AttendanceForm({ students, attendance }: { students: Student[]; attendance: AttendanceRecord[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState(students[0]?.id ?? '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState('Present');
  const [notes, setNotes] = useState('Checked in at the front desk.');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const activeRecord = useMemo(
    () => attendance.find((record) => record.id === selectedId) ?? null,
    [attendance, selectedId]
  );

  function resetForm() {
    setSelectedId(null);
    setStudentId(students[0]?.id ?? '');
    setDate(new Date().toISOString().slice(0, 10));
    setStatus('Present');
    setNotes('Checked in at the front desk.');
  }

  function startEdit(record: AttendanceRecord) {
    setSelectedId(record.id);
    const student = students.find((item) => record.className.includes(`Grade ${item.grade}${item.section}`)) ?? students[0];
    if (student) {
      setStudentId(student.id);
    }
    setDate(record.attendanceDate);
    setStatus(record.status);
    setNotes(record.notes);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/api/attendance${selectedId ? `/${selectedId}` : '/mark'}`,
        {
        method: selectedId ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, date, status, notes })
        }
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Unable to save attendance.');
      }

      resetForm();
      router.refresh();
    } catch (thrownError) {
      setError(thrownError instanceof Error ? thrownError.message : 'Unable to save attendance.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="workflow-grid">
      <form className="workflow-form card" onSubmit={submit}>
        <h2 className="section-title section-title-large">Mark attendance</h2>
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
            <span>Date</span>
            <input className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="field">
            <span>Status</span>
            <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
              {['Present', 'Late', 'Absent'].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="field field-full">
            <span>Notes</span>
            <textarea className="textarea" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
        </div>

        {error ? <div className="notice error">{error}</div> : null}

        <button className="submit-button" type="submit" disabled={busy}>
          {busy ? 'Saving...' : selectedId ? 'Update attendance' : 'Save attendance'}
        </button>
        {selectedId ? (
          <button className="submit-button secondary-button" type="button" onClick={resetForm} disabled={busy}>
            Cancel edit
          </button>
        ) : null}
      </form>

      <aside className="workflow-feed card">
        <h2 className="section-title section-title-large">Recent records</h2>
        <div className="record-list">
          {attendance.map((record) => (
            <article className="record-item" key={record.id}>
              <strong>{record.studentName}</strong>
              <div className="subtle">{record.className} · {record.attendanceDate}</div>
              <div className="record-meta">
                <span>{record.status}</span>
                <span>{record.notes}</span>
              </div>
              <div className="record-actions">
                <button className="record-button" type="button" onClick={() => startEdit(record)}>
                  Edit
                </button>
                <button
                  className="record-button danger"
                  type="button"
                  onClick={async () => {
                    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/api/attendance/${record.id}`, {
                      method: 'DELETE',
                      credentials: 'include'
                    });
                    if (selectedId === record.id) {
                      resetForm();
                    }
                    router.refresh();
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}
