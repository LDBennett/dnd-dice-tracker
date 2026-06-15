import type { AppContext } from '@fe-shared/context';
import type { BreakdownEntry, SessionLuck, SessionRecord } from '@fe-shared';
import { computeExtended, fmtDate } from '@fe-shared';
import { untrack } from 'svelte';
import { cubicOut } from 'svelte/easing';
import { Tween } from 'svelte/motion';
import { SvelteDate } from 'svelte/reactivity';

import { fetchDashboard, fetchRollSessions } from '../api/statsDashboard.api';

export class StatsDashboardState {
	sessionCount = $state(0);
	topDice = $state<number[]>([]);
	breakdown = $state<BreakdownEntry[]>([]);
	sessionLucks = $state<SessionLuck[]>([]);
	avgLuckPerSession = $state(0);

	totalRolls = $state(0);
	nat20s = $state(0);
	nat1s = $state(0);

	luckExpanded = $state(false);
	expandedSessionId = $state<string | null>(null);

	activeTab = $state<'overall' | 'session'>('overall');
	selectedSessionId = $state<string | null>(null);
	viewMode = $state('server');

	allSessions = $state<SessionRecord[]>([]);

	readonly animTotalRolls = new Tween(0, { duration: 500, easing: cubicOut });
	readonly animNat20s = new Tween(0, { duration: 500, easing: cubicOut });
	readonly animNat1s = new Tween(0, { duration: 500, easing: cubicOut });
	readonly animSessions = new Tween(0, { duration: 500, easing: cubicOut });

	readonly VIEW_OPTIONS = [
		{ value: 'server', label: "Lee's Stats" },
		{ value: 'local', label: 'Local Rolls' }
	];

	readonly TAB_ITEMS = [
		{ value: 'overall', label: 'Overall', icon: 'mdi-clipboard-list-outline' },
		{ value: 'session', label: 'Session', icon: 'mdi-thought-bubble-outline' }
	];

	get localRolls() {
		return this.app.session.currentSessionRolls;
	}
	get localTotalRolls() {
		return this.localRolls.length;
	}
	get localNat20s() {
		return this.localRolls.filter((r) => r.dieType === 20 && r.value === 20).length;
	}
	get localNat1s() {
		return this.localRolls.filter((r) => r.dieType === 20 && r.value === 1).length;
	}
	get localSessionRecord(): SessionRecord | null {
		return this.app.session.currentSessionId
			? {
					id: this.app.session.currentSessionId,
					rolls: this.app.session.currentSessionRolls,
					modifier: 0,
					rolledAt: this.app.session.rolledAt ?? new SvelteDate().toISOString(),
					name: this.app.session.currentSessionName
				}
			: null;
	}

	get effectiveTotalRolls() {
		return this.viewMode === 'local' ? this.localTotalRolls : this.totalRolls;
	}
	get effectiveNat20s() {
		return this.viewMode === 'local' ? this.localNat20s : this.nat20s;
	}
	get effectiveNat1s() {
		return this.viewMode === 'local' ? this.localNat1s : this.nat1s;
	}

	get sessionOptions() {
		return this.allSessions.map((s) => ({
			value: s.id,
			label: s.name || 'Unnamed session',
			subtext: fmtDate(s.rolledAt)
		}));
	}

	get selectedSession(): SessionRecord | null {
		return this.selectedSessionId !== null
			? (this.allSessions.find((s) => s.id === this.selectedSessionId) ?? null)
			: null;
	}

	get isGuest() {
		return this.app.isGuest;
	}

	constructor(
		private app: AppContext,
		totalRolls: number,
		nat20s: number,
		nat1s: number
	) {
		this.totalRolls = totalRolls;
		this.nat20s = nat20s;
		this.nat1s = nat1s;

		$effect(() => {
			this.animTotalRolls.set(this.effectiveTotalRolls);
		});
		$effect(() => {
			this.animNat20s.set(this.effectiveNat20s);
		});
		$effect(() => {
			this.animNat1s.set(this.effectiveNat1s);
		});
		$effect(() => {
			this.animSessions.set(this.sessionCount);
		});

		$effect(() => {
			if (this.viewMode === 'server') untrack(() => this.loadExtended());
		});
		$effect(() => {
			if (this.viewMode === 'local')
				this.applyExtended(
					this.localSessionRecord ? [this.localSessionRecord as SessionRecord] : []
				);
		});
	}

	applyExtended(sessions: SessionRecord[]) {
		const ext = computeExtended(sessions);
		this.sessionCount = ext.sessionCount;
		this.topDice = ext.topDice;
		this.breakdown = ext.breakdown;
		this.sessionLucks = ext.sessionLucks;
		this.avgLuckPerSession = ext.avgLuckPerSession;
		this.allSessions = sessions;
	}

	async loadExtended() {
		const sessions = await fetchRollSessions();
		this.applyExtended(sessions);
	}

	async refresh() {
		const [dash, sessions] = await Promise.all([fetchDashboard(), fetchRollSessions()]);
		this.totalRolls = dash.totalRolls;
		this.nat20s = dash.nat20s;
		this.nat1s = dash.nat1s;
		this.applyExtended(sessions);
	}
}
