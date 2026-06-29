<script lang="ts">
	import { getAppContext } from '@fe-shared/context';
	import type { DropdownItem } from '@fe-shared/ui';
	import { DropdownMenu, Logo } from '@fe-shared/ui';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	import TabButton from './BottomNav.TabButton.svelte';

	const app = getAppContext();
	const currentPath = $derived(page.url.pathname);

	let isRollAnimating = $state(false);

	function handleRollClick() {
		isRollAnimating = true;
		setTimeout(() => {
			isRollAnimating = false;
		}, 500);
		goto(resolve('/'));
	}

	const rollModeItems = $derived<DropdownItem[]>([
		{
			label: 'Log Roll',
			icon: 'mdi-script-outline',
			onclick: () => (app.rollMode = false),
			active: !app.rollMode
		},
		{
			label: 'Quick Roll',
			icon: 'mdi-creation-outline',
			onclick: () => (app.rollMode = true),
			active: app.rollMode
		}
	]);
</script>

<nav
	class="fixed right-0 bottom-0 left-0 z-50 flex justify-center"
	style="padding-bottom: env(safe-area-inset-bottom)"
>
	<div class="relative w-full max-w-sm" style="filter: drop-shadow(0 4px 24px rgb(0 0 0 / 0.5))">
		<!-- Bar with circular notch cut at top-center -->
		<div
			class="flex h-16 items-center justify-between rounded-t-2xl bg-stone-800 px-8"
			style="mask-image: radial-gradient(circle 36px at 50% 0%, transparent 35px, black 36px); -webkit-mask-image: radial-gradient(circle 36px at 50% 0%, transparent 35px, black 36px);"
		>
			<!-- History -->
			<TabButton
				path="/history"
				label="History"
				active={currentPath === '/history'}
				animClass="anim-bounce"
			>
				{#snippet icon()}
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
						<rect x="9" y="3" width="6" height="4" rx="2" />
						<path d="M9 12h6M9 16h4" />
					</svg>
				{/snippet}
			</TabButton>

			<!-- Center spacer (layout only — mode button is absolute sibling below) -->
			<div class="w-18 shrink-0"></div>

			<!-- Stats -->
			<TabButton path="/stats" label="Stats" active={currentPath === '/stats'} animClass="anim-pop">
				{#snippet icon()}
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 20V10M12 20V4M6 20v-6" />
					</svg>
				{/snippet}
			</TabButton>
		</div>

		<!-- Mode toggle: sits above the roll button in z-order so its label area is tappable -->
		<div class="absolute bottom-1.5 left-1/2 z-10 -translate-x-1/2">
			<DropdownMenu items={rollModeItems} direction="up" align="center">
				{#snippet trigger(toggle, isOpen)}
					<button
						type="button"
						onclick={toggle}
						aria-label="Change roll mode"
						class={[
							'flex items-center gap-0.5 transition-colors',
							isOpen || currentPath === '/' ? 'text-accent' : 'text-stone-500'
						]}
					>
						<span
							class={['mdi text-sm', app.rollMode ? 'mdi-creation-outline' : 'mdi-script-outline']}
						></span>
						<span class="text-[10px] leading-none font-semibold"
							>{app.rollMode ? 'Quick Roll' : 'Log Roll'}</span
						>
					</button>
				{/snippet}
			</DropdownMenu>
		</div>

		<button
			type="button"
			onclick={handleRollClick}
			aria-label="Roll Dice"
			class={[
				'bg-accent absolute top-0 left-1/2 flex h-17 w-17 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition active:scale-95',
				currentPath === '/' ? 'shadow-accent-glow' : 'opacity-90'
			]}
		>
			<Logo
				class={isRollAnimating ? 'anim-spin360 h-8 w-8' : 'h-8 w-8'}
				style="--logo-fill: white; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4))"
			/>
		</button>
	</div>
</nav>
