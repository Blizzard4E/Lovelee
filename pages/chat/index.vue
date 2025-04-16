<template>
	<div class="flex flex-col gap-4 relative transform h-full">
		<header class="px-4 pt-4 pb-2 border-gray-20000 border-b-2">
			<div class="flex justify-between">
				<h1 class="text-primary font-extrabold text-3xl">LOVELEE</h1>
				<button
					@click="
						() => {
							clearUser();
							navigateTo('/login');
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
					Good {{ getWelcomeWordByTime() }}, {{ user?.username }} !
				</p>
			</div>
		</header>
		<div class="overflow-auto flex flex-col gap-4">
			<div class="px-4 grid gap-4 mb-32">
				<div class="flex justify-between">
					<h1 class="text-2xl font-extrabold text-primary">Chats</h1>
					<button
						class="text-primary text-3xl font-bold"
						@click="createNewChat"
					>
						+
					</button>
				</div>
				<div class="grid gap-4 w-full">
					<NuxtLink
						v-for="chat in chatHistory"
						:key="chat.id"
						:to="`/chat/${chat.id}`"
						class="p-4 rounded-2xl bg-light text-primary font-bold"
					>
						{{ chat.conversation[0]?.content || "Untitled Chat" }}
					</NuxtLink>
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
						class="text-white"
					/>
				</NuxtLink>
				<NuxtLink>
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
const supabase = useSupabaseClient<Chat>();
const { user, clearUser } = useAuth();

const createNewChat = async () => {
	if (!user.value) return;
	const { data, error } = await supabase
		.from("chat")
		.insert({ user_id: user.value.id, conversation: [] })
		.select()
		.single();

	if (error) {
		console.error("Error creating new chat:", error);
	} else {
		console.log("New chat created:", data);
		navigateTo(`/chat/${data.id}`);
	}
};

const { data: chatHistory, error } = await supabase
	.from("chat")
	.select("id, conversation")
	.eq("user_id", user.value?.id)
	.order("created_at", { ascending: false });
</script>
<style></style>
