// Persistence for practice sessions. Uses localStorage — simple, synchronous,
// and works offline, which is all a practice log needs. Every access is guarded
// so the module is safe to import in non-browser environments (tests, build).

import type { PracticeSession } from './types';

const KEY = 'workbench.metronome.sessions.v1';
const MAX_SESSIONS = 250;

function storage(): Storage | null {
	try {
		return typeof localStorage !== 'undefined' ? localStorage : null;
	} catch {
		return null;
	}
}

export function loadSessions(): PracticeSession[] {
	const store = storage();
	if (!store) return [];
	try {
		const raw = store.getItem(KEY);
		if (!raw) return [];
		const data = JSON.parse(raw);
		return Array.isArray(data) ? (data as PracticeSession[]) : [];
	} catch {
		return [];
	}
}

export function saveSessions(list: PracticeSession[]): void {
	const store = storage();
	if (!store) return;
	try {
		store.setItem(KEY, JSON.stringify(list));
	} catch {
		// quota / private-mode — ignore, the live session is still usable
	}
}

export function addSession(session: PracticeSession): PracticeSession[] {
	const list = [session, ...loadSessions()].slice(0, MAX_SESSIONS);
	saveSessions(list);
	return list;
}

export function deleteSession(id: string): PracticeSession[] {
	const list = loadSessions().filter((s) => s.id !== id);
	saveSessions(list);
	return list;
}

export function clearSessions(): PracticeSession[] {
	saveSessions([]);
	return [];
}

export interface AggregateStats {
	totalSessions: number;
	totalSeconds: number;
	totalBars: number;
}

export function aggregate(list: PracticeSession[]): AggregateStats {
	return list.reduce<AggregateStats>(
		(acc, s) => ({
			totalSessions: acc.totalSessions + 1,
			totalSeconds: acc.totalSeconds + s.durationSeconds,
			totalBars: acc.totalBars + s.bars
		}),
		{ totalSessions: 0, totalSeconds: 0, totalBars: 0 }
	);
}
