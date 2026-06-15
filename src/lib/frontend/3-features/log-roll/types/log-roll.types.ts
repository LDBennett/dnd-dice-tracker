import type { DieType } from '@fe-shared';

export interface BatchEntry {
	id: number;
	dieType: DieType;
	value: number;
}
