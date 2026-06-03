<script lang="ts">
	import type { PageServerData } from './$types';
	import { StatsDashboard } from '@fe-widgets/stats-dashboard';

	let { data }: { data: PageServerData } = $props();

	let { totalRolls, nat20s, nat1s } = $derived(data.dashboard);
</script>

<StatsDashboard {totalRolls} {nat20s} {nat1s} />
