<script lang="ts">
	import { StatsDashboard } from '@fe-widgets/stats-dashboard';

	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	let { totalRolls, nat20s, nat1s } = $derived(data.dashboard);
</script>

<StatsDashboard {totalRolls} {nat20s} {nat1s} />
