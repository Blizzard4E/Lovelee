// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-11-01",
	devtools: { enabled: true },
	modules: [
		"@nuxt/fonts",
		"@nuxt/icon",
		"@nuxtjs/tailwindcss",
		"@nuxtjs/supabase",
		"@vueuse/nuxt",
	],
	css: ["~/assets/css/main.css"],
	supabase: {
		redirect: false,
	},
	ssr: false,
	runtimeConfig: {
		public: {
			openaiApiKey: "",
		},
	},
});
