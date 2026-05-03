'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type Admission = {
  id: string;
  applicantName: string;
  guardianEmail: string;
  intendedGrade: string;
  notes: string;
  status: string;
  createdAt: string;
};

export default function AdmissionsForm({ admissions }: { admissions: Admission[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [intendedGrade, setIntendedGrade] = useState('9');
  const [notes, setNotes] = useState('Interested in a creative + STEM pathway.');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const activeAdmission = useMemo(
    () => admissions.find((admission) => admission.id === selectedId) ?? null,
    [admissions, selectedId]
  );

  function resetForm() {
    setSelectedId(null);
    setApplicantName('');
    setGuardianEmail('');
    setIntendedGrade('9');
    setNotes('Interested in a creative + STEM pathway.');
  }

  function startEdit(admission: Admission) {
    setSelectedId(admission.id);
    setApplicantName(admission.applicantName);
    setGuardianEmail(admission.guardianEmail);
    setIntendedGrade(admission.intendedGrade);
    setNotes(admission.notes);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/api/admissions${selectedId ? `/${selectedId}` : ''}`,
        {
        method: selectedId ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantName, guardianEmail, intendedGrade, notes })
        }
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Unable to create application.');
      }

      resetForm();
      router.refresh();
    } catch (thrownError) {
      setError(thrownError instanceof Error ? thrownError.message : 'Unable to create application.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="workflow-grid">
      <form className="workflow-form card" onSubmit={submit}>
        <h2 className="section-title section-title-large">New application</h2>
        <div className="field-grid">
          <label className="field">
            <span>Applicant name</span>
            <input className="input" value={applicantName} onChange={(event) => setApplicantName(event.target.value)} />
          </label>
          <label className="field">
            <span>Guardian email</span>
            <input className="input" type="email" value={guardianEmail} onChange={(event) => setGuardianEmail(event.target.value)} />
          </label>
          <label className="field">
            <span>Intended grade</span>
            <select className="select" value={intendedGrade} onChange={(event) => setIntendedGrade(event.target.value)}>
              {['6', '7', '8', '9', '10', '11', '12'].map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
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
          {busy ? 'Saving...' : selectedId ? 'Update application' : 'Submit application'}
        </button>
        {selectedId ? (
          <button className="submit-button secondary-button" type="button" onClick={resetForm} disabled={busy}>
            Cancel edit
          </button>
        ) : null}
      </form>

      <aside className="workflow-feed card">
        <h2 className="section-title section-title-large">Recent applications</h2>
        <div className="record-list">
          {admissions.map((admission) => (
            <article className="record-item" key={admission.id}>
              <strong>{admission.applicantName}</strong>
              <div className="subtle">{admission.intendedGrade} · {admission.guardianEmail}</div>
              <div className="record-meta">
                <span>{admission.status}</span>
                <span>{new Date(admission.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="record-actions">
                <button className="record-button" type="button" onClick={() => startEdit(admission)}>
                  Edit
                </button>
                <button
                  className="record-button danger"
                  type="button"
                  onClick={async () => {
                    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/api/admissions/${admission.id}`, {
                      method: 'DELETE',
                      credentials: 'include'
                    });
                    if (selectedId === admission.id) {
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
