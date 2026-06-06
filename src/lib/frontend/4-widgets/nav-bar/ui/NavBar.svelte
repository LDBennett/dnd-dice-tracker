<script lang="ts">
	import Logo from '$lib/assets/logo.png';
	import { getAppContext } from '@fe-shared/context';
	import { IconButton, ConfirmModal } from '@fe-shared/ui';

	const app = getAppContext();

	let dropdownOpen = $state(false);
	let confirmingSignOut = $state(false);
	let signOutForm = $state<HTMLFormElement | null>(null);
	let accountMenu = $state<HTMLElement | null>(null);

	$effect(() => {
		if (!dropdownOpen) return;
		function handleClick(e: MouseEvent) {
			if (accountMenu && !accountMenu.contains(e.target as Node)) {
				dropdownOpen = false;
			}
		}
		window.addEventListener('click', handleClick, { capture: true });
		return () => window.removeEventListener('click', handleClick, { capture: true });
	});

	function submitSignOut() {
		confirmingSignOut = false;
		signOutForm?.requestSubmit();
	}
</script>

<header
	class="fixed top-0 right-0 left-0 z-50 border-b border-stone-700/60 bg-stone-900/95 backdrop-blur"
	style="padding-top: env(safe-area-inset-top)"
>
	<div class="mx-auto max-w-225">
		<div class="flex h-14 items-center justify-between px-4">
			<div class="flex items-center gap-2">
				<img src={Logo} alt="Logo" class="h-6 w-6" />
				<span class="font-bold text-orange-400">D&D Dice Tracker</span>
			</div>

			<div class="flex items-center gap-1">
				<!-- Account button + dropdown -->
				<div class="relative" bind:this={accountMenu}>
					<IconButton
						icon="mdi-account-circle-outline"
						onclick={() => (dropdownOpen = !dropdownOpen)}
						aria-label="Account"
					/>

					{#if dropdownOpen}
						<div class="absolute top-full right-0 z-50 mt-2 w-36 overflow-hidden rounded-xl bg-stone-800 shadow-lg ring-1 ring-white/10">
							{#if app.user}
								<button
									type="button"
									onclick={() => { dropdownOpen = false; confirmingSignOut = true; }}
									class="flex w-full items-center gap-2 px-4 py-3 text-sm text-stone-300 hover:bg-stone-700 hover:text-white"
								>
									<span class="mdi mdi-logout text-base"></span> Sign out
								</button>
							{:else}
								<button
									type="button"
									onclick={() => { dropdownOpen = false; app.openLogin(); }}
									class="flex w-full items-center gap-2 px-4 py-3 text-sm text-stone-300 hover:bg-stone-700 hover:text-white"
								>
									<span class="mdi mdi-login text-base"></span> Sign in
								</button>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</header>

<!-- Hidden sign-out form -->
<form bind:this={signOutForm} method="post" action="/signout" class="hidden"></form>

{#if confirmingSignOut}
	<ConfirmModal
		title="Sign out?"
		message="You'll need to sign in again to save your rolls."
		confirmLabel="Sign out"
		onConfirm={submitSignOut}
		onCancel={() => (confirmingSignOut = false)}
	/>
{/if}
