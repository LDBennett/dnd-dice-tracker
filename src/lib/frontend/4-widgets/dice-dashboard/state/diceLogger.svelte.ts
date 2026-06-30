import { fetchSessions } from '@fe-entities/session';
import type { BatchEntry } from '@fe-features/roll-entry';
import type { DieType, RollResult, SessionRecord } from '@fe-shared';
import { isWithinDays, trackEvent } from '@fe-shared';
import type { AppContext } from '@fe-shared/context';

const RESUME_RECENT_DAYS = 14;

export class DiceLoggerState {
	selectedDie = $state<DieType | null>(null);
	pressing = $state<DieType | null>(null);
	quickRollDie = $state<DieType | null>(null);

	batchMode = $state(false);
	batchEntries = $state<BatchEntry[]>([]);

	editingTitle = $state(false);
	titleDraft = $state('');

	quickBatchQueue = $state<DieType[]>([]);
	quickBatchRolling = $state(false);

	pickerOpen = $state(false);
	pickerSessions = $state<SessionRecord[]>([]);
	pickerLoading = $state(false);

	readonly sessionMenuItems = [
		{
			label: 'New Session',
			icon: 'mdi-plus-circle-outline',
			onclick: () => {
				this.app.session.reset();
				this.pickerOpen = false;
			}
		},
		{
			label: 'Resume Recent',
			icon: 'mdi-play-circle-outline',
			onclick: () => this.openPicker()
		}
	];

	get sessionRolls(): RollResult[] {
		return this.selectedDie !== null
			? this.app.session.currentSessionRolls.filter((r) => r.dieType === this.selectedDie)
			: [];
	}

	get pickerItems(): SessionRecord[] {
		return this.pickerSessions
			.filter(
				(s) =>
					s.id !== this.app.session.currentSessionId && isWithinDays(s.rolledAt, RESUME_RECENT_DAYS)
			)
			.slice(0, 8);
	}

	constructor(private app: AppContext) {
		$effect(() => {
			if (!app.rollMode || !this.batchMode) {
				this.quickBatchQueue = [];
				this.quickBatchRolling = false;
			}
		});
	}

	startEditTitle() {
		this.titleDraft = this.app.session.currentSessionName;
		this.editingTitle = true;
	}

	async commitTitle() {
		this.editingTitle = false;
		await this.app.session.patch({ name: this.titleDraft.trim() });
	}

	onTitleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') (e.target as HTMLElement).blur();
		if (e.key === 'Escape') this.editingTitle = false;
	}

	setMode(batch: boolean) {
		this.batchMode = batch;
		if (batch) this.selectedDie = null;
		else this.batchEntries = [];
	}

	handleDieClick(die: DieType) {
		this.pressing = die;
		setTimeout(() => {
			this.pressing = null;
			if (this.batchMode) {
				if (this.app.rollMode) this.addToQuickBatch(die);
				else this.addBatchDie(die);
			} else {
				if (this.app.rollMode) this.quickRollDie = die;
				else this.selectedDie = die;
			}
		}, 120);
	}

	addBatchDie(die: DieType) {
		if (this.batchEntries.length >= 20) return;
		this.batchEntries = [
			...this.batchEntries,
			{ id: Date.now(), dieType: die, value: Math.ceil(die / 2) }
		];
	}

	addToQuickBatch(die: DieType) {
		if (this.quickBatchQueue.length >= 20) return;
		this.quickBatchQueue = [...this.quickBatchQueue, die];
	}

	onQuickRollDone(value: number) {
		if (this.quickRollDie === null) return;
		const die = this.quickRollDie;
		this.quickRollDie = null;
		trackEvent('roll_dice', { source: 'quick' });
		this.app.session.autoSave([{ dieType: die, value, note: '' }]);
	}

	onQuickBatchAllDone(results: { dieType: DieType; value: number }[]) {
		this.quickBatchQueue = [];
		this.quickBatchRolling = false;
		trackEvent('roll_dice', { source: 'quick' });
		this.app.session.autoSave(results.map((r) => ({ ...r, note: '' })));
	}

	addToSession(roll: RollResult) {
		this.selectedDie = null;
		trackEvent('roll_dice', { source: 'logger' });
		this.app.session.autoSave([roll]);
	}

	addBatchToSession(rolls: RollResult[]) {
		trackEvent('roll_dice', { source: 'logger' });
		this.app.session.autoSave(rolls);
	}

	async openPicker() {
		this.pickerOpen = true;
		this.pickerLoading = true;
		this.pickerSessions = await fetchSessions();
		this.pickerLoading = false;
	}

	continueSession(record: SessionRecord) {
		this.app.session.load(record);
		this.selectedDie = null;
		this.batchEntries = [];
		this.pickerOpen = false;
	}
}
