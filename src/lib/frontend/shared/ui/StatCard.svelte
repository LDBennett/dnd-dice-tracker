<script lang="ts">
	let {
		label,
		value,
		subtext = '',
		accent = 'default',
		valueColor = '',
		onclick = undefined
	}: {
		label: string;
		value: string | number;
		subtext?: string;
		accent?: 'amber' | 'red' | 'default';
		valueColor?: string;
		onclick?: () => void;
	} = $props();

	const cardClass  = accent === 'amber' ? 'bg-amber-400/10 ring-1 ring-amber-400/30'
	                 : accent === 'red'   ? 'bg-red-900/20 ring-1 ring-red-800/40'
	                 :                      'bg-slate-800';
	const labelClass = accent === 'amber' ? 'text-amber-500'
	                 : accent === 'red'   ? 'text-red-500'
	                 :                      'text-slate-500';
	const valueClass = valueColor          ? ''
	                 : accent === 'amber'  ? 'text-amber-400'
	                 : accent === 'red'    ? 'text-red-400'
	                 :                       'text-white';
</script>

<div
	class="flex flex-col rounded-2xl p-5 {cardClass} {onclick ? 'cursor-pointer transition hover:brightness-110 active:scale-95' : ''}"
	role={onclick ? 'button' : undefined}
	tabindex={onclick ? 0 : undefined}
	onclick={onclick}
	onkeydown={onclick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onclick(); } : undefined}
>
	<span class="mb-1 text-xs font-semibold tracking-widest uppercase {labelClass}">{label}</span>
	<span
		class="text-4xl font-extrabold {valueClass}"
		style={valueColor ? `color: ${valueColor}` : ''}
	>{value}</span>
	{#if subtext}
		<span class="mt-1 text-xs text-slate-500">{subtext}</span>
	{/if}
</div>
