<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<!--
  Compound path with fill-rule="evenodd" — same technique MDI uses for its dice icons.
  Outer diamond: verbatim from mdi-dice-d10.
  Digits "1" and two "0"s are scaled-down transforms of the d10 digit paths, forming
  cutout holes in the filled diamond. Each "0" uses an outer+inner pair so the center
  stays filled (donut hole effect), matching MDI's rendering style exactly.
-->
<svg
	viewBox="0 0 24 24"
	width="1em"
	height="1em"
	fill="currentColor"
	aria-hidden="true"
	class={className}
>
	<path
		fill-rule="evenodd"
		d="M12 2C11.5 2 11 2.19 10.59 2.59L2.59 10.59C1.8 11.37 1.8 12.63 2.59 13.41L10.59 21.41C11.37 22.2 12.63 22.2 13.41 21.41L21.41 13.41C22.2 12.63 22.2 11.37 21.41 10.59L13.41 2.59C13 2.19 12.5 2 12 2Z M9.42 8.5H9.5V15.5H8.6V10.2L7.5 10.67V9.5L9.42 8.5Z M11.5 8.5C12.33 8.5 13 9.53 13 10.81V13.2C13 14.46 12.33 15.5 11.5 15.5C10.66 15.5 10 14.46 10 13.2V10.81C10 9.53 10.67 8.5 11.5 8.5Z M11.5 9.8C11.15 9.8 10.87 10.23 10.87 10.75V13.3C10.87 13.8 11.15 14.2 11.5 14.2C11.83 14.2 12.12 13.8 12.12 13.3V10.75C12.12 10.2 11.83 9.8 11.5 9.8Z M15 8.5C15.83 8.5 16.5 9.53 16.5 10.81V13.2C16.5 14.46 15.83 15.5 15 15.5C14.16 15.5 13.5 14.46 13.5 13.2V10.81C13.5 9.53 14.17 8.5 15 8.5Z M15 9.8C14.65 9.8 14.37 10.23 14.37 10.75V13.3C14.37 13.8 14.65 14.2 15 14.2C15.33 14.2 15.62 13.8 15.62 13.3V10.75C15.62 10.2 15.33 9.8 15 9.8Z"
	/>
</svg>
