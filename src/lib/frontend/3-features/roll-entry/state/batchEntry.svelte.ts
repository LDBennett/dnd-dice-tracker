import type { DieType } from '@fe-shared';

import type { BatchEntry } from '../types/log-roll.types';

export class BatchEntryState {
	batchNote = $state('');
	quickFill = $state('');

	getValidation(entries: BatchEntry[]) {
		if (!this.quickFill.trim())
			return [] as Array<{ value: number; dieType: DieType | null; valid: boolean }>;
		return this.quickFill
			.split(/[\s,]+/)
			.map((n) => parseInt(n, 10))
			.filter((n) => !isNaN(n))
			.map((value, i) => {
				const entry = entries[i];
				return entry
					? {
							value,
							dieType: entry.dieType as DieType | null,
							valid: value >= 1 && value <= entry.dieType
						}
					: { value, dieType: null as DieType | null, valid: false };
			});
	}

	isReady(entries: BatchEntry[]): boolean {
		const v = this.getValidation(entries);
		return v.length === entries.length && entries.length > 0 && v.every((item) => item.valid);
	}

	applyQuickFill(entries: BatchEntry[]): BatchEntry[] {
		const nums = this.quickFill
			.split(/[\s,]+/)
			.map((n) => parseInt(n, 10))
			.filter((n) => !isNaN(n) && n > 0);
		if (nums.length === 0) return entries;
		this.quickFill = '';
		return entries.map((e, i) =>
			i < nums.length ? { ...e, value: Math.max(1, Math.min(e.dieType, nums[i])) } : e
		);
	}

	reset() {
		this.batchNote = '';
		this.quickFill = '';
	}
}
