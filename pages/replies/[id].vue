<template>
	<div class="flex flex-col gap-4 relative transform h-full">
		<header
			class="px-4 pt-4 pb-2 border-gray-20000 border-b-2 flex gap-4 items-center justify-between"
		>
			<div class="flex gap-4 items-center">
				<NuxtLink to="/social"
					><Icon
						name="mingcute:arrow-left-fill"
						size="32"
						class="text-primary"
				/></NuxtLink>
				<h1 class="text-primary font-extrabold text-3xl">LOVELEE</h1>
			</div>
		</header>
		<div class="overflow-auto flex flex-col gap-4">
			<div class="px-4">
				<!-- Display original post -->
				<div v-if="originalPost" class="mb-4">
					<h2 class="text-lg font-bold text-primary mb-2">
						Original Post
					</h2>
					<Post :post="originalPost" />
				</div>

				<!-- Reply form -->
				<form
					@submit.prevent="createReply"
					class="w-full flex gap-2 mb-6"
				>
					<input
						type="text"
						class="rounded-2xl p-4 border-secondary border-2 w-full bg-background text-primary placeholder:text-primary/80 font-bold"
						placeholder="Add your reply..."
						v-model="replyContent"
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

				<!-- Replies section -->
				<div v-if="replies && replies.length > 0">
					<h2 class="text-lg font-bold text-primary mb-2">
						Replies ({{ replies.length }})
					</h2>
					<div class="grid gap-4">
						<div
							v-for="reply in replies"
							:key="reply.id"
							class="grid gap-4 p-4 rounded-2xl relative bg-light"
						>
							<div class="flex items-center gap-4">
								<img
									:src="getProfilePic(reply.user.id)"
									class="w-12 h-12 rounded-full"
									alt=""
								/>
								<h1 class="text-lg font-bold text-primary">
									{{ reply.user.username }}
								</h1>
							</div>
							<p class="text-black">{{ reply.content }}</p>
						</div>
					</div>
				</div>
				<div v-else class="text-center text-gray-500 py-4">
					No replies yet. Be the first to reply!
				</div>
			</div>
		</div>
	</div>
</template>
<script lang="ts" setup>
const supabase = useSupabaseClient<Reply>();
const { user, clearUser } = useAuth();
const route = useRoute();
const postId = route.params.id;
const replyContent = ref("");

// Redirect to login if user is not authenticated
if (!user.value) {
	navigateTo("/");
}

// Fetch the original post
const { data: originalPost } = await useAsyncData(
	`original-post-${postId}`,
	async () => {
		const { data, error } = await supabase
			.from("post")
			.select(
				"id, content, user_id, created_at, user:user_id(id, username)"
			)
			.eq("id", postId)
			.single();

		if (error) {
			console.error("Error fetching original post:", error);
			return null;
		}

		// Transform user data if needed
		return {
			...data,
			user: Array.isArray(data.user) ? data.user[0] : data.user,
		};
	},
	{
		server: false,
	}
);

// Fetch replies for this post
const { data: replies, refresh: refreshReplies } = await useAsyncData(
	`replies-${postId}`,
	async () => {
		const { data, error } = await supabase
			.from("reply")
			.select(
				"id, content, user_id, created_at, user:user_id(id, username)"
			)
			.eq("post_id", postId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching replies:", error);
			return [];
		}

		// Transform the data to convert user arrays to single objects
		return data.map((reply) => ({
			...reply,
			user: Array.isArray(reply.user) ? reply.user[0] : reply.user,
		}));
	},
	{
		server: false,
	}
);

// Function to create a new reply
const createReply = async () => {
	if (!user.value || !replyContent.value.trim()) return;

	const { data, error } = await supabase
		.from("reply")
		.insert({
			content: replyContent.value,
			post_id: postId,
			user_id: user.value.id,
		})
		.select();

	if (error) {
		console.error("Error creating reply:", error);
	} else {
		replyContent.value = "";
		await refreshReplies();
	}
};
</script>
<style></style>
