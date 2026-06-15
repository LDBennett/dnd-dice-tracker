import type { RollResult } from '@fe-shared';

export type { RollResult };

export interface SubmitResult {
	sessionId: string;
	rolls: RollResult[];
	total: number;
}
