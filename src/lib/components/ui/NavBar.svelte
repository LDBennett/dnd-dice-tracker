<script lang="ts">
	import Logo from '$lib/assets/logo.png';
	type Tab = 'roll' | 'stats' | 'history';

	let {
		activeTab = $bindable<Tab>('roll'),
		user = null,
		onSignInClick = () => {}
	}: {
		activeTab: Tab;
		user: { name: string; email: string } | null;
		onSignInClick: () => void;
	} = $props();

	const tabs: { id: Tab; icon: string; label: string }[] = [
		{ id: 'roll', icon: '🎲', label: 'Roll' },
		{ id: 'stats', icon: '📊', label: 'Stats' },
		{ id: 'history', icon: '📜', label: 'History' }
	];
</script>

<header
	class="fixed top-0 right-0 left-0 z-50 border-b border-slate-700/60 bg-slate-900/95 backdrop-blur"
	style="padding-top: env(safe-area-inset-top)"
>
	<div class="mx-auto max-w-225">
		<!-- Row 1: logo + actions -->
		<div class="flex h-14 items-center justify-between px-4">
			<div class="flex items-center gap-2">
				<img src={Logo} alt="Logo" class="h-6 w-6" />
				<span class="font-bold text-amber-400">D&D Dice Tracker</span>
			</div>

			<div class="flex items-center gap-1">
				{#if user}
					<form method="post" action="/signout">
						<button
							type="submit"
							class="rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
						>Sign out</button>
					</form>
				{:else}
					<button
						type="button"
						onclick={onSignInClick}
						class="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 active:scale-95"
					>Sign In</button>
				{/if}
			</div>
		</div>

		<!-- Row 2: tab navigation -->
		<div class="flex h-12 items-center justify-center gap-1 border-t border-slate-800 px-4">
			{#each tabs as tab (tab.id)}
				<button
					type="button"
					onclick={() => (activeTab = tab.id)}
					class="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition-colors {activeTab === tab.id
						? 'bg-amber-400 text-slate-900'
						: 'text-slate-400 hover:text-white'}"
				>
					<span>{tab.icon}</span>
					<span>{tab.label}</span>
				</button>
			{/each}
		</div>
	</div>
</header>
