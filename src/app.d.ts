import type { Session,User } from 'better-auth/minimal';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface Window {
		gtag?: (...args: unknown[]) => void;
		dataLayer?: unknown[];
		turnstile?: {
			render(
				el: HTMLElement,
				opts: { sitekey: string; callback: (token: string) => void; theme?: string }
			): string;
			remove(widgetId: string): void;
		};
	}

	namespace App {
		interface Locals {
			user?: User;
			session?: Session;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
