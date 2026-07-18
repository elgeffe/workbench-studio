export type GoalType = 'none' | 'bars' | 'time';

export interface PracticeGoal {
	type: GoalType;
	/** target bars, when type === 'bars' */
	bars?: number;
	/** target seconds, when type === 'time' */
	seconds?: number;
}

export interface PracticeSession {
	id: string;
	startedAt: number; // epoch ms
	endedAt: number; // epoch ms
	durationSeconds: number; // actual time the metronome ran
	bars: number; // bars completed
	startBpm: number;
	endBpm: number;
	minBpm: number;
	maxBpm: number;
	timeSignature: string; // e.g. "4/4"
	goal: PracticeGoal;
	goalReached: boolean;
	automation: string; // human-readable label
}
