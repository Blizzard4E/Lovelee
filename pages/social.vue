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
			<div class="px-4 mb-32">
				<form @submit.prevent="createPost" class="w-full flex gap-2">
					<input
						type="text"
						class="rounded-2xl p-4 border-secondary border-2 w-full bg-background text-primary placeholder:text-primary/80 font-bold"
						placeholder="Whats on your mind today?"
						v-model="postContent"
					/>
					<button
						class="hover:scale-110 transition-all active:scale-125"
						type="submit"
					>
						<Icon
							name="mingcute:send-plane-fill"
							size="32"
							class="text-primary"
						/>
					</button>
				</form>
				<div class="grid gap-6 mt-4">
					<Post v-for="post in posts" :key="post.id" :post="post" />
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
						class="text-white"
					/>
				</NuxtLink>
			</div>
		</footer>
	</div>
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient<Post>();
const { user, clearUser } = useAuth();
const postContent = ref("");
if (!user.value) {
	// Redirect to login if user is not authenticated
	navigateTo("/");
}
const { data: posts, refresh } = useAsyncData("my-data", async () => {
	const { data, error } = await supabase
		.from("post")
		.select("id, content, user_id, created_at, user:user_id(id, username)")
		.order("created_at", { ascending: false });

	// Transform the data to convert user arrays to single objects
	if (data) {
		return data.map((post) => ({
			...post,
			user: Array.isArray(post.user) ? post.user[0] : post.user,
		}));
	}

	return [];
});

const createPost = async () => {
	if (!user.value) return;
	const { data, error } = await supabase
		.from("post")
		.insert({
			content: postContent.value,
			user_id: user.value.id,
		})
		.select("id, content, user_id")
		.single();

	if (error) {
		console.error("Error creating quote:", error);
	} else {
		postContent.value = "";
		refresh();
	}
};
</script>

<style></style>
