<script lang="ts">
	let {
		icon,
		size = 'md',
		iconSize,
		hoverColor = 'white',
		rounded = 'xl',
		class: extraClass,
		iconClass: extraIconClass,
		iconProps,
		...restProps
	}: {
		icon: string;
		size?: 'sm' | 'md';
		iconSize?: string;
		hoverColor?: 'white' | 'red';
		rounded?: 'lg' | 'xl';
		class?: string | string[];
		iconClass?: string | string[];
		iconProps?: Record<string, unknown>;
		[key: string]: unknown;
	} = $props();

	const cls = $derived([
		'flex shrink-0 items-center justify-center transition active:scale-90',
		size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
		rounded === 'lg' ? 'rounded-lg' : 'rounded-xl',
		'text-stone-400 hover:bg-stone-700',
		hoverColor === 'red' ? 'hover:text-red-400' : 'hover:text-white',
		extraClass
	]);

	const iconCls = $derived([
		'mdi',
		icon,
		iconSize ?? (size === 'sm' ? 'text-base' : 'text-xl'),
		extraIconClass
	]);
</script>

<button type="button" class={cls} {...restProps}>
	<span class={iconCls} {...iconProps}></span>
</button>
