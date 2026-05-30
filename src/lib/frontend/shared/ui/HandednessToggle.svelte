<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import cx from 'classnames';

	let { rightHanded, onToggle }: { rightHanded: boolean; onToggle: () => void } = $props();

	let open = $state(false);
	const optionLabel = $derived(`Change to ${rightHanded ? 'left' : 'right'} hand`);
	const anchorStyle = $derived(
		`bottom: max(1.5rem, env(safe-area-inset-bottom)); left: ${rightHanded ? '1.5rem' : 'calc(100dvw - 4.75rem)'}`
	);

	function toggle() {
		open = !open;
	}
	function confirm() {
		onToggle();
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
		out:fade={{ duration: 100 }}>TEST</button
	>
{/if}

<div class="fixed z-40" style="{anchorStyle}; transition: left 350ms cubic-bezier(0.34, 1.15, 0.64, 1)">
	{#if open}
		<button
			type="button"
			onclick={confirm}
			class={cx(
				'absolute bottom-16 flex min-h-12 items-center rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-lg ring-1 ring-slate-600 transition hover:bg-slate-600  active:scale-95',
				rightHanded ? 'left-0' : 'right-0'
			)}
			transition:scale={{ start: 0.5, duration: 250, easing: backOut }}>{optionLabel}</button
		>
	{/if}

	<button
		type="button"
		onclick={toggle}
		title="Switch handedness"
		aria-expanded={open}
		class={cx(
			'flex h-13 w-13 items-center justify-center rounded-full bg-slate-800 text-xl shadow-lg ring-1 ring-slate-700 transition hover:bg-slate-700 active:scale-90',
			open ? 'ring-amber-500' : ''
		)}>{rightHanded ? '🤚' : '✋'}</button
	>
</div>
