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
			<div class="px-4">
				<div class="p-6 rounded-2xl bg-white">
					<div class="text-primary">
						<h1 class="text-primary font-extrabold">March</h1>
						<div class="w-[10%] h-[2px] bg-primary"></div>
					</div>
					<div
						class="grid grid-cols-7 gap-4 text-center mt-2 text-primary"
					>
						<div
							class="grid gap-2"
							v-for="day in getCurrentWeekDates()"
						>
							<span>{{ day.dayName }}</span>
							<div class="relative">
								<span class="relative z-10">{{
									day.dateNum
								}}</span>
								<div
									v-if="isCurrentDay(day.dateNum)"
									class="bg-light w-8 h-8 rounded-full absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
								></div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="px-4">
				<div class="p-6 rounded-2xl bg-secondary">
					<h1 class="text-white font-extrabold text-xl mb-4">
						How are you feeling today?
					</h1>
					<div class="grid grid-cols-5 p-1 font-bold text-xs mb-4">
						<button
							@click="selectedMood = 'angry'"
							class="grid place-items-center gap-4 text-white group cursor-pointer"
						>
							<div class="relative">
								<div
									class="rounded-full w-16 h-16 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
									:class="
										selectedMood == 'angry'
											? 'bg-light'
											: 'bg-white'
									"
								></div>
								<img
									class="w-14 z-1 relative transition-all"
									src="/images/angry.png"
									alt=""
									:class="
										selectedMood == 'angry'
											? 'scale-125'
											: 'group-hover:scale-110'
									"
								/>
							</div>
							<h2>Angry</h2>
						</button>
						<button
							@click="selectedMood = 'sad'"
							class="grid place-items-center gap-4 text-white group cursor-pointer"
						>
							<div class="relative">
								<div
									class="rounded-full w-16 h-16 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
									:class="
										selectedMood == 'sad'
											? 'bg-light'
											: 'bg-white'
									"
								></div>
								<img
									class="w-14 z-10 relative transition-all"
									src="/images/sad.png"
									alt=""
									:class="
										selectedMood == 'sad'
											? 'scale-125'
											: 'group-hover:scale-110'
									"
								/>
							</div>
							<h2>Sad</h2>
						</button>
						<button
							@click="selectedMood = 'okay'"
							class="grid place-items-center gap-4 text-white group cursor-pointer"
						>
							<div class="relative">
								<div
									class="rounded-full w-16 h-16 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
									:class="
										selectedMood == 'okay'
											? 'bg-light'
											: 'bg-white'
									"
								></div>
								<img
									class="w-14 z-10 relative transition-all"
									src="/images/okay.png"
									alt=""
									:class="
										selectedMood == 'okay'
											? 'scale-125'
											: 'group-hover:scale-110'
									"
								/>
							</div>
							<h2>Okay</h2>
						</button>
						<button
							@click="selectedMood = 'happy'"
							class="grid place-items-center gap-4 text-white group cursor-pointer"
						>
							<div class="relative">
								<div
									class="rounded-full w-16 h-16 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
									:class="
										selectedMood == 'happy'
											? 'bg-light'
											: 'bg-white'
									"
								></div>
								<img
									class="w-14 z-10 relative transition-all"
									src="/images/happy.png"
									alt=""
									:class="
										selectedMood == 'happy'
											? 'scale-125'
											: 'group-hover:scale-110'
									"
								/>
							</div>
							<h2>Happy</h2>
						</button>
						<button
							@click="selectedMood = 'very_happy'"
							class="grid place-items-center gap-4 text-white group cursor-pointer"
						>
							<div class="relative">
								<div
									class="rounded-full w-16 h-16 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
									:class="
										selectedMood == 'very_happy'
											? 'bg-light'
											: 'bg-white'
									"
								></div>
								<img
									class="w-14 z-10 relative transition-all"
									src="/images/very_happy.png"
									alt=""
									:class="
										selectedMood == 'very_happy'
											? 'scale-125'
											: 'group-hover:scale-110'
									"
								/>
							</div>
							<h2 class="text-center">Very Happy</h2>
						</button>
					</div>
					<div class="bg-background rounded-2xl m-1 p-4 grid gap-10">
						<div class="text-primary">
							<input
								class="text-primary placeholder:text-primary font-extrabold text-xl"
								placeholder="Your Journal"
								v-model="journalTitle"
							/>
							<div class="w-[20%] h-[2px] bg-primary"></div>
						</div>
						<textarea
							v-model="journalContent"
							class="text-primary font-bold h-[100px] bg-background placeholder:text-primary"
							placeholder="Let’s take a moment to reflect on how your day went. Shall We?"
						></textarea>
						<div class="flex justify-center">
							<button
								@click="handleCreateJournal"
								class="px-8 py-2 bg-background border-primary border-2 relative rounded-full"
							>
								<div class="absolute -top-6 -left-8">
									<Vue3Lottie
										animationLink="animations/bear_dance.json"
										:height="70"
										:width="70"
									/>
								</div>
								<span class="text-primary text-sm font-bold"
									>Save Journal</span
								>
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class="px-4 mb-32 grid gap-4">
				<h1 class="text-2xl font-extrabold text-primary">
					My Journals
				</h1>
				<div class="relative w-full">
					<div class="absolute top-[50%] translate-y-[-40%] left-4">
						<Icon
							name="mingcute:search-2-line"
							size="32"
							class="text-primary"
						/>
					</div>
					<input
						type="text"
						class="rounded-2xl p-4 pl-12 border-secondary border-2 w-full bg-light text-primary placeholder:text-primary/80 font-bold"
						placeholder="Search Journals"
						v-model="searchWord"
					/>
				</div>
				<Journal
					v-for="journal in filteredJournals"
					:journal="journal"
					:key="journal.id"
				/>
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
						class="text-white"
					/>
				</NuxtLink>

				<NuxtLink to="/quote">
					<Icon
						name="mingcute:quote-right-fill"
						size="32"
						class="text-light"
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
	</div>
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient<Journal>();
const { user, clearUser } = useAuth();
const selectedMood = ref("okay");
const journalTitle = ref("");
const journalContent = ref("");
const searchWord = ref("");
const filteredJournals = computed(() => {
	if (!journals.value || !searchWord.value) return journals.value;

	return journals.value.filter((journal) =>
		journal.title.toLowerCase().includes(searchWord.value.toLowerCase())
	);
});

if (!user.value) {
	// Redirect to login if user is not authenticated
	const router = useRouter();
	router.push("/login");
}
const { data: journals, refresh: refreshJournals } = useAsyncData(
	"my-data",
	async () => {
		const { data, error } = await supabase
			.from("journal")
			.select("id, title, content, mood, user_id, created_at")
			.eq("user_id", user.value?.id)
			.order("created_at", { ascending: false });
		return data;
	}
);

const handleCreateJournal = async () => {
	if (!user.value) return;
	const { data, error } = await supabase
		.from("journal")
		.insert({
			title: journalTitle.value,
			content: journalContent.value,
			mood: selectedMood.value,
			user_id: user.value.id,
		})
		.select("id, title, content, mood, user_id")
		.single();
	if (error) {
		console.error("Error creating journal:", error);
	} else {
		journalTitle.value = "";
		journalContent.value = "";
		selectedMood.value = "okay";
		refreshJournals();
	}
};
</script>

<style></style>
