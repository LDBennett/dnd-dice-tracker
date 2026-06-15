<script lang="ts">
	import { getAppContext } from '@fe-shared/context';
	import { backOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';

	const app = getAppContext();

	let open = $state(false);
	const optionLabel = $derived(`Change to ${app.rightHanded ? 'left' : 'right'} hand`);
	const anchorStyle = $derived(
		`bottom: max(6rem, calc(env(safe-area-inset-bottom) + 5.5rem)); left: ${app.rightHanded ? '1.5rem' : 'calc(100dvw - 4.75rem)'}`
	);

	function toggle() {
		open = !open;
	}
	function confirm() {
		app.rightHanded = !app.rightHanded;
		open = false;
	}
</script>

{#if open}
	<button
		type="button"
		class="fixed inset-0 z-38 cursor-default"
		onclick={() => (open = false)}
		aria-label="Dismiss handedness menu"
		in:fade={{ duration: 100 }}
		out:fade={{ duration: 100 }}
	></button>
{/if}

<div
	class="fixed z-40"
	style="{anchorStyle}; transition: left 350ms cubic-bezier(0.34, 1.15, 0.64, 1)"
>
	{#if open}
		<button
			type="button"
			onclick={confirm}
			class={[
				'bg-accent ring-accent-sm absolute bottom-16 flex min-h-12 items-center rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap text-stone-900 shadow-lg transition hover:brightness-110 active:scale-95',
				app.rightHanded ? 'left-0' : 'right-0'
			]}
			transition:scale={{ start: 0.5, duration: 250, easing: backOut }}>{optionLabel}</button
		>
	{/if}

	<button
		type="button"
		onclick={toggle}
		title="Switch handedness"
		aria-expanded={open}
		class={[
			'ring-accent-sm flex h-13 w-13 items-center justify-center rounded-full bg-stone-800 text-xl shadow-lg transition hover:bg-stone-700 active:scale-90',
			open ? 'shadow-accent-glow' : ''
		]}
	>
		{#if app.rightHanded}
			<span class="mdi mdi-hand-front-right-outline text-accent"></span>
		{:else}
			<span class="mdi mdi-hand-front-left-outline text-accent"></span>
		{/if}
	</button>
</div>
