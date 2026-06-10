export class LoginModalState {
	mode = $state<'login' | 'register'>('login');
	email = $state('');
	password = $state('');
	name = $state('');
	error = $state('');
	loading = $state(false);

	readonly authTabs = [
		{ value: 'login', label: 'Sign In' },
		{ value: 'register', label: 'Register' }
	];

	resetForm() {
		this.error = '';
		this.email = '';
		this.password = '';
		this.name = '';
		this.mode = 'login';
	}

	async submit(onSuccess: () => void) {
		this.error = '';
		this.loading = true;
		try {
			const endpoint =
				this.mode === 'login' ? '/api/auth/sign-in/email' : '/api/auth/sign-up/email';
			const body =
				this.mode === 'login'
					? { email: this.email, password: this.password }
					: { email: this.email, password: this.password, name: this.name };

			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (res.ok) {
				onSuccess();
			} else {
				const data = await res.json().catch(() => ({}));
				this.error =
					data.message ?? (this.mode === 'login' ? 'Sign in failed' : 'Registration failed');
			}
		} catch {
			this.error = 'Network error. Please try again.';
		} finally {
			this.loading = false;
		}
	}
}
