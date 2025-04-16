<template>
	<div class="grid gap-4 p-4 rounded-2xl relative">
		<div class="flex items-center gap-4">
			<img
				:src="getProfilePic(post.user.id)"
				class="w-12 h-12 rounded-full"
				alt=""
			/>
			<h1 class="text-lg font-bold text-primary">
				{{ post.user.username }}
			</h1>
		</div>
		<p class="text-black">{{ post.content }}</p>
		<div class="flex gap-8 items-center">
			<button
				class="flex items-center gap-2 hover:scale-105 transition-all active:scale-125"
				@click="toggleLike"
			>
				<Icon
					v-if="hasUserLiked"
					name="mingcute:heart-fill"
					size="32"
					class="text-primary"
				/>
				<Icon
					v-else
					name="mingcute:heart-line"
					size="32"
					class="text-primary"
				/>
				<span class="text-lg text-primary" v-if="likes">{{
					likesCount
				}}</span>
			</button>
			<NuxtLink
				:to="'/replies/' + post.id"
				class="flex items-center gap-2 hover:scale-105 transition-all"
			>
				<Icon
					name="mingcute:message-4-line"
					size="32"
					class="text-primary"
				/>
				<span class="text-lg text-primary">{{ replyCount }}</span>
			</NuxtLink>
		</div>
	</div>
</template>
<script lang="ts" setup>
const supabase = useSupabaseClient<Post>();
const { user } = useAuth();
const props = defineProps<{
	post: Post;
}>();

// Use a computed property for likes count to ensure reactivity
const likesCount = computed(() => likes.value?.length || 0);

// Store the current user's like (if it exists)
const userLike = computed(() => {
	if (!user.value || !likes.value) return null;
	return likes.value.find(
		(like) => user.value && like.user_id === user.value.id
	);
});

// Check if the current user has already liked this post
const hasUserLiked = computed(() => !!userLike.value);

// Track reply count
const replyCount = ref(0);

// Fetch likes
const { data: likes, refresh: refreshLikes } = await useAsyncData(
	`like-data-${props.post.id}`, // Use unique key with post ID
	async () => {
		const { data, error } = await supabase
			.from("like")
			.select("id, user_id, created_at")
			.eq("post_id", props.post.id)
			.order("created_at", { ascending: false });
		if (error) {
			console.error("Error fetching likes:", error);
			return [];
		}
		return data;
	},
	{
		immediate: true, // Make sure it runs immediately
		server: false, // Run on client-side for better reactivity
		watch: [() => props.post.id], // Re-run when post ID changes
	}
);

// Fetch reply count
useAsyncData(
	`reply-count-${props.post.id}`, // Use unique key with post ID
	async () => {
		const { count, error } = await supabase
			.from("reply")
			.select("id", { count: "exact", head: true })
			.eq("post_id", props.post.id);

		if (error) {
			console.error("Error fetching reply count:", error);
			return 0;
		}

		replyCount.value = count || 0;
		return count;
	},
	{
		immediate: true, // Make sure it runs immediately
		server: false, // Run on client-side for better reactivity
		watch: [() => props.post.id], // Re-run when post ID changes
	}
);

// Toggle like function
const toggleLike = async () => {
	if (!user.value) {
		// Redirect to login if user is not authenticated
		navigateTo("/");
		return;
	}
	// If user has already liked, remove the like
	if (hasUserLiked.value && userLike.value) {
		const { error } = await supabase
			.from("like")
			.delete()
			.eq("id", userLike.value.id);
		if (error) {
			console.error("Error unliking post:", error);
		} else {
			await refreshLikes();
		}
	}
	// Otherwise, add a new like
	else {
		const { error } = await supabase.from("like").insert({
			user_id: user.value.id,
			post_id: props.post.id,
		});
		if (error) {
			console.error("Error liking post:", error);
		} else {
			await refreshLikes();
		}
	}
};

// Debug information
watchEffect(() => {
	console.log("likes updated:", likes.value);
	console.log("has user liked:", hasUserLiked.value);
	console.log("reply count:", replyCount.value);
});
</script>
<style></style>
