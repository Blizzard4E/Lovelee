<template>
	<div class="flex flex-col gap-4 relative transform h-full">
		<header
			class="px-4 pt-4 pb-2 border-gray-20000 border-b-2 flex gap-4 items-center justify-between"
		>
			<div class="flex gap-4 items-center">
				<NuxtLink to="/chat"
					><Icon
						name="mingcute:arrow-left-fill"
						size="32"
						class="text-primary"
				/></NuxtLink>
				<h1 class="text-primary font-extrabold text-3xl">LOVELEE</h1>
			</div>
			<div>
				<NuxtLink :to="'/bot/' + id">
					<div class="relative grid place-items-center scale-up-down">
						<Icon
							name="mingcute:voice-line"
							size="32"
							class="text-white relative z-10"
						/>
						<div
							class="w-10 h-10 z-0 bg-secondary rounded-full absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
						></div>
					</div>
				</NuxtLink>
			</div>
		</header>
		<div class="overflow-auto flex flex-col gap-4">
			<div class="flex flex-col gap-8 px-4 mb-32">
				<div
					v-for="(message, i) in chat?.conversation"
					:key="i"
					class="flex"
					:class="message.role == 'user' ? 'self-end ml-20' : 'mr-20'"
				>
					<p
						class="p-4 rounded-2xl"
						:class="
							message.role == 'user'
								? 'bg-light text-primary'
								: 'bg-background text-primary border-primary border'
						"
					>
						{{ message.content }}
					</p>
				</div>
			</div>
		</div>
		<footer class="fixed bottom-0 left-0 p-4 w-full flex z-50">
			<form @submit.prevent="createUserMessage" class="w-full flex gap-2">
				<input
					type="text"
					class="rounded-2xl p-4 border-secondary border-2 w-full bg-background text-primary placeholder:text-primary/80 font-bold"
					placeholder="Your Message"
					v-model="userText"
					:disabled="isLoading"
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
		</footer>
	</div>
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient<Chat>();
const { user } = useAuth();
const { id } = useRoute().params;
const userText = ref("");
const isLoading = ref(false);
const config = useRuntimeConfig();

const { data: chat, refresh: refreshChat } = await useAsyncData(
	"my-data",
	async () => {
		const { data, error } = await supabase
			.from("chat")
			.select("id, conversation")
			.eq("id", id)
			.single();
		return data;
	}
);

const createUserMessage = async () => {
	if (!user.value) return;
	if (!userText.value) return;
	if (!chat.value) return;
	isLoading.value = true;
	const newMessage = {
		role: "user",
		content: userText.value,
	};

	const { data, error } = await supabase
		.from("chat")
		.update({
			conversation: [...chat.value.conversation, newMessage],
		})
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error("Error updating chat:", error);
	} else {
		userText.value = ""; // Clear the input field

		refreshChat();
		sendToBot(newMessage);
	}
};

const createBotMessage = async (botResponse: string) => {
	if (!user.value) return;
	if (!chat.value) return;

	const newMessage = {
		role: "assistant",
		content: botResponse,
	};

	const { data, error } = await supabase
		.from("chat")
		.update({
			conversation: [...chat.value.conversation, newMessage],
		})
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error("Error updating chat:", error);
	} else {
		refreshChat();
	}
};

const sendToBot = async (newMessage: Conversation) => {
	if (!user.value) return;
	if (!chat.value) return;
	console.log("Sending to bot");
	try {
		const response = await fetch(
			"https://api.openai.com/v1/chat/completions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${config.public.openaiApiKey}`,
				},
				body: JSON.stringify({
					model: "gpt-4o-mini",
					messages: [...chat.value.conversation, newMessage], // Send entire history
				}),
			}
		);
		const data = await response.json();
		if (data.choices && data.choices.length > 0) {
			const assistantResponse = data.choices[0].message.content;
			createBotMessage(assistantResponse);

			console.log("Response from GPT:", assistantResponse);

			// Save to database (implementation below)
			//saveConversationToSupabase();
		} else {
			console.error("Unexpected API response format:", data);
		}
	} catch (error) {
		console.error("Error calling OpenAI API:", error);
	} finally {
		isLoading.value = false;
	}
};
</script>

<style></style>
