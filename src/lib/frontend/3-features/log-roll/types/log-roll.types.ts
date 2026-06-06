import type { DieType } from '@fe-shared/lib';

export interface BatchEntry {
	id: number;
	dieType: DieType;
	value: number;
}
