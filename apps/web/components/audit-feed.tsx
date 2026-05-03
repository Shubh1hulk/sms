 'use client';

import type { AuditLogEntry } from '@/lib/api';
import { useMemo, useState } from 'react';

type AuditEventGroup = {
  label: string;
  tone: string;
};

const eventGroups: Record<string, AuditEventGroup> = {
  'auth.login': { label: 'Auth / login', tone: 'ok' },
  'auth.logout': { label: 'Auth / logout', tone: 'warn' },
  'admissions.create': { label: 'Admissions', tone: 'info' },
  'admissions.update': { label: 'Admissions', tone: 'info' },
  'admissions.delete': { label: 'Admissions', tone: 'warn' },
  'attendance.mark': { label: 'Attendance', tone: 'ok' },
  'attendance.update': { label: 'Attendance', tone: 'info' },
  'attendance.delete': { label: 'Attendance', tone: 'warn' },
  'fees.invoice.create': { label: 'Fees / invoice', tone: 'warn' },
  'fees.invoice.update': { label: 'Fees / invoice', tone: 'info' },
  'fees.invoice.delete': { label: 'Fees / invoice', tone: 'warn' },
  'fees.payment.record': { label: 'Fees / payment', tone: 'ok' },
  'fees.payment.delete': { label: 'Fees / payment', tone: 'warn' },
  'system.seed': { label: 'System', tone: 'info' }
};

function prettyMetadata(metadata: string) {
  try {
    const parsed = JSON.parse(metadata) as Record<string, unknown>;
    return Object.entries(parsed)
      .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
      .join(' · ');
  } catch {
    return metadata;
  }
}

export default function AuditFeed({ entries }: { entries: AuditLogEntry[] }) {
  const [query, setQuery] = useState('');
  const [eventType, setEventType] = useState('all');
  const [actorRole, setActorRole] = useState('all');

  const eventTypes = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.eventType))).sort(),
    [entries]
  );

  const actorRoles = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.actorRole))).sort(),
    [entries]
  );

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesQuery =
        !normalizedQuery ||
        [entry.summary, entry.actorName, entry.actorRole, entry.entityType, entry.entityId ?? '', entry.metadata]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesEvent = eventType === 'all' || entry.eventType === eventType;
      const matchesRole = actorRole === 'all' || entry.actorRole === actorRole;

      return matchesQuery && matchesEvent && matchesRole;
    });
  }, [actorRole, entries, eventType, query]);

  return (
    <section className="card audit-shell">
      <h3 className="section-title section-title-large">Admin audit trail</h3>
      <p className="role-intro">
        Append-only event stream emitted from auth, admissions, attendance, and fee operations.
        This is the operational truth layer behind the campus UI.
      </p>
      <div className="audit-controls">
        <label className="field">
          <span>Search</span>
          <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by actor, entity, or summary" />
        </label>
        <label className="field">
          <span>Event type</span>
          <select className="select" value={eventType} onChange={(event) => setEventType(event.target.value)}>
            <option value="all">All event types</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Actor role</span>
          <select className="select" value={actorRole} onChange={(event) => setActorRole(event.target.value)}>
            <option value="all">All roles</option>
            {actorRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="audit-summary">
        <span>{filteredEntries.length} visible events</span>
        <span>{entries.length} total events</span>
      </div>
      <div className="audit-list">
        {filteredEntries.map((entry) => {
          const group = eventGroups[entry.eventType] ?? { label: entry.eventType, tone: 'info' };

          return (
            <article className="audit-item" key={entry.id}>
              <div className="audit-top">
                <div>
                  <strong>{entry.summary}</strong>
                  <div className="subtle">
                    {entry.actorRole} · {entry.actorName} · {entry.entityType}
                    {entry.entityId ? ` · ${entry.entityId}` : ''}
                  </div>
                </div>
                <span className={`status ${group.tone}`}>{group.label}</span>
              </div>
              <div className="audit-meta">
                <span>{new Date(entry.createdAt).toLocaleString()}</span>
                <span>{prettyMetadata(entry.metadata)}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
