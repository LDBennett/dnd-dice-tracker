<script lang="ts">
	type Tab = 'roll' | 'stats' | 'history';

	let { activeTab = $bindable<Tab>('roll') }: { activeTab: Tab } = $props();

	const tabs: { id: Tab; icon: string; label: string }[] = [
		{ id: 'roll',    icon: '🎲', label: 'Roll' },
		{ id: 'stats',   icon: '📊', label: 'Stats' },
		{ id: 'history', icon: '📜', label: 'History' }
	];
</script>

<header
	class="fixed left-0 right-0 top-0 z-50 border-b border-slate-700/60 bg-slate-900/95 backdrop-blur"
	style="padding-top: env(safe-area-inset-top)"
>
	<!-- Row 1: logo + sign out -->
	<div class="flex h-14 items-center justify-between px-4">
		<div class="flex items-center gap-2">
			<span class="text-2xl leading-none">⚔️</span>
			<span class="font-bold text-amber-400">D&D Dice Tracker</span>
		</div>
		<form method="post" action="/signout">
			<button
				type="submit"
				class="rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
			>
				Sign out
			</button>
		</form>
	</div>

	<!-- Row 2: tab navigation -->
	<div class="flex h-12 items-center justify-center gap-1 border-t border-slate-800 px-4">
		{#each tabs as tab}
			<button
				type="button"
				onclick={() => (activeTab = tab.id)}
				class="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition-colors {activeTab === tab.id ? 'bg-amber-400 text-slate-900' : 'text-slate-400 hover:text-white'}"
			>
				<span>{tab.icon}</span>
				<span>{tab.label}</span>
			</button>
		{/each}
	</div>
</header>
