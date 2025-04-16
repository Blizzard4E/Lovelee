<template>
	<div class="flex flex-col gap-4 relative transform h-full">
		<header class="px-4 pt-4 pb-2 border-gray-20000 border-b-2">
			<div class="flex justify-between">
				<h1 class="text-primary font-extrabold text-3xl">LOVELEE</h1>
				<button
					@click="
						() => {
							clearUser();
							navigateTo('/');
						}
					"
				>
					<Icon
						name="mingcute:exit-line"
						size="32"
						class="text-primary"
					/>
				</button>
			</div>
			<div v-if="user" class="flex gap-4 items-center py-2">
				<img
					class="w-12 border-primary border-2 aspect-square rounded-full"
					:src="getProfilePic(user.id)"
					alt=""
				/>
				<p class="text-primary font-extrabold text-lg">
					Good {{ getWelcomeWordByTime() }}, {{ user?.username }}!
				</p>
			</div>
		</header>
		<div class="overflow-auto flex flex-col gap-4">
			<div class="px-4 grid gap-4 mb-32">
				<div
					v-if="isWriting"
					class="p-10 rounded-2xl text-primary bg-light relative"
				>
					<div class="absolute top-2 left-2">
						<Icon
							name="mingcute:quote-left-fill"
							size="32"
							class="text-primary"
						/>
					</div>
					<input
						class="text-primary placeholder:text-primary bg-light"
						placeholder="Write your own quote here..."
						v-model="userQuote"
					/>
					<div class="absolute bottom-2 right-2">
						<Icon
							name="mingcute:quote-right-fill"
							size="32"
							class="text-primary"
						/>
					</div>
				</div>
				<div
					v-else
					class="p-10 rounded-2xl text-primary bg-light relative"
				>
					<div class="absolute top-2 left-2">
						<Icon
							name="mingcute:quote-left-fill"
							size="32"
							class="text-primary"
						/>
					</div>
					<p v-if="quoteData">
						{{ quoteData[0].q }}
					</p>
					<div class="absolute bottom-2 right-2">
						<Icon
							name="mingcute:quote-right-fill"
							size="32"
							class="text-primary"
						/>
					</div>
				</div>
				<button
					type="submit"
					class="w-full p-4 rounded-full bg-light text-primary font-bold text-center"
					@click="
						() => {
							refreshZenQuote();
							isWriting = false;
						}
					"
				>
					Generate
				</button>
				<button
					type="submit"
					class="w-full p-4 rounded-full bg-light text-primary font-bold text-center"
					@click="isWriting = true"
				>
					Write your own quote
				</button>
				<button
					type="submit"
					class="w-full p-4 rounded-full bg-white text-primary font-bold text-center border-primary border"
					@click="handleCreateQuote"
				>
					Save Quote
				</button>

				<h1 class="text-2xl font-extrabold text-primary">
					Saved Quotes
				</h1>
				<div
					v-for="quote in quotes"
					:key="quote.id"
					class="p-10 rounded-2xl text-primary bg-light relative"
				>
					<div class="absolute top-2 left-2">
						<Icon
							name="mingcute:quote-left-fill"
							size="32"
							class="text-primary"
						/>
					</div>
					<p>
						{{ quote.content }}
					</p>
					<div class="absolute bottom-2 right-2">
						<Icon
							name="mingcute:quote-right-fill"
							size="32"
							class="text-primary"
						/>
					</div>
				</div>
			</div>
		</div>
		<footer class="fixed bottom-0 left-0 p-4 w-full flex z-50">
			<div
				class="bg-primary w-full rounded-full p-4 grid grid-cols-4 place-items-center"
			>
				<NuxtLink to="/home">
					<Icon
						name="mingcute:book-6-fill"
						size="32"
						class="text-light"
					/>
				</NuxtLink>

				<NuxtLink to="/quote">
					<Icon
						name="mingcute:quote-right-fill"
						size="32"
						class="text-white"
					/>
				</NuxtLink>
				<NuxtLink to="/chat">
					<Icon
						name="mingcute:android-2-fill"
						size="32"
						class="text-light"
					/>
				</NuxtLink>
				<NuxtLink to="/social">
					<Icon
						name="mingcute:group-3-fill"
						size="32"
						class="text-light"
					/>
				</NuxtLink>
			</div>
		</footer>

		<!-- Notification Component -->
		<div
			v-if="showNotification"
			class="fixed top-4 right-4 bg-primary text-white p-4 rounded-lg shadow-lg z-50 max-w-md"
			style="animation: slideIn 0.3s ease-out"
		>
			<div class="flex items-start">
				<div class="flex-1">
					<p class="font-bold mb-1">Daily Quote</p>
					<p>{{ notificationQuote }}</p>
				</div>
				<button
					@click="showNotification = false"
					class="ml-4 text-white"
				>
					<Icon name="mingcute:close-fill" size="20" />
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient<Quote>();
const { user, clearUser } = useAuth();
const isWriting = ref(false);
const userQuote = ref("");
const showNotification = ref(false);
const notificationQuote = ref("");
const notificationEnabled = ref(true);
let notificationTimer: any = null;

interface ZenQuote {
	q: string;
	a: string;
}

const { data: quoteData, refresh: refreshZenQuote } = await useFetch<
	ZenQuote[]
>("https://corsproxy.io/?url=https://zenquotes.io/api/random");

const { data: quotes, refresh: refreshQuotes } = useAsyncData(
	"my-data",
	async () => {
		const { data, error } = await supabase
			.from("quote")
			.select("id, content, user_id, created_at")
			.eq("user_id", user.value?.id)
			.order("created_at", { ascending: false });
		return data;
	}
);

// Request notification permission on page load
onMounted(() => {
	requestNotificationPermission();
});

// Function to request notification permission
const requestNotificationPermission = async () => {
	if ("Notification" in window) {
		if (
			Notification.permission !== "granted" &&
			Notification.permission !== "denied"
		) {
			await Notification.requestPermission();
		}
	}
};

// Function to schedule notification
const scheduleNotification = () => {
	// Clear any existing timer
	if (notificationTimer) {
		clearTimeout(notificationTimer);
	}

	// Always schedule in the background
	if (quoteData.value && quoteData.value[0]) {
		notificationQuote.value = quoteData.value[0].q;

		// Schedule notification after 10 seconds (for testing)
		notificationTimer = setTimeout(() => {
			showQuoteNotification();
		}, 10000); // 10 seconds
	}
};

// Function to show notification
const showQuoteNotification = () => {
	// Browser notification if permission is granted
	if ("Notification" in window && Notification.permission === "granted") {
		new Notification("Daily Quote", {
			body: notificationQuote.value,
			icon: "/favicon.ico", // Replace with your app icon
		});
	}

	// In-app notification
	showNotification.value = true;

	// Auto-hide after 5 seconds
	setTimeout(() => {
		showNotification.value = false;
	}, 5000);
};

const handleCreateQuote = async () => {
	if (!user.value) return;

	const contentToSave = isWriting.value
		? userQuote.value
		: quoteData.value?.[0]?.q;

	if (!contentToSave) {
		console.error("No quote to save.");
		return;
	}

	const { data, error } = await supabase
		.from("quote")
		.insert({
			content: contentToSave,
			user_id: user.value.id,
		})
		.select("id, content, user_id")
		.single();

	if (error) {
		console.error("Error creating quote:", error);
	} else {
		userQuote.value = "";
		refreshQuotes();
	}
};

// Auto-schedule notifications when quote data is available
onMounted(() => {
	requestNotificationPermission();
	if (quoteData.value && quoteData.value[0]) {
		scheduleNotification();
	}
});

// Watch for changes to quote data
watch(
	() => quoteData.value,
	() => {
		if (notificationEnabled.value) {
			scheduleNotification();
		}
	},
	{ deep: true }
);
</script>

<style>
@keyframes slideIn {
	from {
		transform: translateX(100%);
		opacity: 0;
	}
	to {
		transform: translateX(0);
		opacity: 1;
	}
}
</style>
