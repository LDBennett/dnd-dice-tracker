<script lang="ts">
	let {
		checked,
		onchange,
		leftLabel,
		rightLabel,
		leftIcon,
		rightIcon,
		bg = 'bg-stone-800',
		activeClass = 'bg-teal-400 text-stone-900'
	}: {
		checked: boolean;
		onchange: (v: boolean) => void;
		leftLabel: string;
		rightLabel: string;
		leftIcon?: string;
		rightIcon?: string;
		bg?: string;
		activeClass?: string;
	} = $props();

	const knobBgClass = $derived(
		activeClass.split(' ').find((c) => c.startsWith('bg-')) ?? 'bg-teal-400'
	);
	const activeTextClass = $derived(
		activeClass
			.split(' ')
			.filter((c) => !c.startsWith('bg-'))
			.join(' ') || 'text-stone-900'
	);

	let trackEl = $state<HTMLButtonElement | null>(null);
	let knobPx = $state(0);
	let dragging = $state(false);
	let didDrag = $state(false);
	let startX = $state(0);
	let originPx = $state(0);

	const maxPx = $derived.by(() => {
		if (!trackEl) return 0;
		// knob width = (trackWidth - 8px padding) / 2 - 2px gap correction
		return (trackEl.offsetWidth - 8) / 2 - 2;
	});

	// Keep knob snapped when not dragging
	$effect(() => {
		if (!dragging) {
			knobPx = checked ? maxPx : 0;
		}
	});

	function onpointerdown(e: PointerEvent) {
		if (!trackEl) return;
		dragging = true;
		didDrag = false;
		startX = e.clientX;
		originPx = checked ? maxPx : 0;
		trackEl.setPointerCapture(e.pointerId);
	}

	function onpointermove(e: PointerEvent) {
		if (!dragging) return;
		const delta = e.clientX - startX;
		if (Math.abs(delta) > 4) didDrag = true;
		knobPx = Math.max(0, Math.min(originPx + delta, maxPx));
	}

	function onpointerup() {
		if (!dragging) return;
		dragging = false;
		if (!didDrag) {
			onchange(!checked);
		} else {
			onchange(knobPx > maxPx / 2);
		}
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			onchange(!checked);
		}
	}
</script>

<button
	bind:this={trackEl}
	type="button"
	role="switch"
	aria-checked={checked}
	class={['relative flex w-full rounded-xl p-1', bg]}
	style="touch-action: none"
	{onpointerdown}
	{onpointermove}
	{onpointerup}
	{onkeydown}
>
	<!-- sliding knob -->
	<div
		aria-hidden="true"
		class={[
			'absolute top-1 bottom-1 left-1 rounded-lg',
			knobBgClass,
			!dragging && 'transition-transform duration-200 ease-out'
		]}
		style="width: calc((100% - 0.5rem) / 2 - 1px); transform: translateX({knobPx}px)"
	></div>

	<!-- labels overlay -->
	<span
		class={[
			'relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors duration-200',
			!checked ? activeTextClass : 'text-stone-400'
		]}
	>
		{#if leftIcon}
			<span class={['mdi', leftIcon, 'text-base']} aria-hidden="true"></span>
		{/if}
		{leftLabel}
	</span>
	<span
		class={[
			'relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors duration-200',
			checked ? activeTextClass : 'text-stone-400'
		]}
	>
		{#if rightIcon}
			<span class={['mdi', rightIcon, 'text-base']} aria-hidden="true"></span>
		{/if}
		{rightLabel}
	</span>
</button>
