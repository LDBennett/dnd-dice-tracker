<script lang="ts">
	import { Modal } from '@fe-shared/ui';
	import { THEMES } from '@fe-shared/ui';
	import { getAppContext } from '@fe-shared/context';
	import ThemeCard from './ThemeCard.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const app = getAppContext();
</script>

{#if open}
	<Modal onclose={() => (open = false)} label="Choose Theme">
		<div class="p-5">
			<h2 class="mb-4 text-base font-bold text-white">Choose Your Class</h2>
			<div class="grid grid-cols-3 gap-2">
				{#each THEMES as theme (theme.id)}
					<ThemeCard
						{theme}
						active={app.theme === theme.id}
						onselect={() => {
							app.theme = theme.id;
							open = false;
						}}
					/>
				{/each}
			</div>
		</div>
	</Modal>
{/if}
