import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter(),
		alias: {
			'@fe-shared': 'src/lib/frontend/1-shared',
			'@fe-entities': 'src/lib/frontend/2-entities',
			'@fe-features': 'src/lib/frontend/3-features',
			'@fe-widgets': 'src/lib/frontend/4-widgets'
		},
		typescript: {
			config: (config) => ({
				...config,
				include: [...config.include, '../drizzle.config.ts']
			})
		}
	}
};

export default config;
