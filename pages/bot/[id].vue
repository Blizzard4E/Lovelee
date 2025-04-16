<template>
	<div class="p-4">
		<header class="flex justify-between">
			<NuxtLink :to="'/chat/' + id">
				<Icon
					name="mingcute:arrow-left-fill"
					size="32"
					class="text-primary"
			/></NuxtLink>
			<h1 class="text-primary font-extrabold text-3xl">LOVELEE</h1>
			<Icon
				name="mingcute:arrow-left-fill"
				size="32"
				class="text-transparent"
			/>
		</header>
		<div class="relative grid place-items-center h-[500px] hovering">
			<Icon
				name="mingcute:voice-line"
				size="280"
				class="text-white relative z-20"
			/>
			<div class="absolute scale-up-down-slow z-10">
				<div
					class="w-[300px] h-[300px] bg-secondary rounded-full absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
					:class="ttsIsPlaying ? 'animate-pulse' : ''"
				></div>
			</div>
			<div class="absolute scale-up-down z-0">
				<div
					class="w-[360px] h-[360px] bg-light rounded-full absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
				></div>
			</div>
		</div>
		<button
			type="submit"
			class="w-full p-4 rounded-full bg-light text-primary font-bold text-center"
			@click="startRecording"
		>
			{{ isListening ? "Stop" : "Start Conversation" }}
		</button>
		<!-- <button @click="stopRecording" :disabled="!isListening">
			Stop Manually
		</button> -->

		<!-- <div v-if="isListening" class="status">
			Listening... (will auto-stop after silence is detected)
		</div>
		<div v-else-if="result" class="status">
			<span class="stopped">Recording stopped</span>
			<button v-if="readyToSend" @click="sendToAPI" class="send-button">
				Send to API
			</button>
		</div> -->

		<div v-if="result" class="text-primary text-center mt-4 text-lg">
			<p>"{{ result }}"</p>
		</div>
		<!-- <div v-if="apiResponse" class="api-response">
			<h3>Response:</h3>
			<p>{{ apiResponse }}</p>    
		</div> -->
		<TTSModule
			:text="assistantResponse"
			@playing-status-changed="handleTTSPlayingStatus"
		/>
	</div>
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient<Chat>();
const { user } = useAuth();
const { id } = useRoute().params;
const isLoading = ref(false);
const config = useRuntimeConfig();
const assistantResponse = ref("");
import { useSpeechRecognition } from "@vueuse/core";
import { watch, ref } from "vue";
const ttsIsPlaying = ref(false);

const handleTTSPlayingStatus = (isPlaying: boolean) => {
	ttsIsPlaying.value = isPlaying;
	console.log("TTS playing status changed:", isPlaying);
};

const { isSupported, isListening, isFinal, result, start, stop } =
	useSpeechRecognition({
		continuous: true,
		interimResults: true,
	});

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
	if (!result.value) return;
	if (!chat.value) return;
	isLoading.value = true;
	const newMessage = {
		role: "user",
		content: result.value,
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
			assistantResponse.value = data.choices[0].message.content;
			createBotMessage(assistantResponse.value);

			console.log("Response from GPT:", assistantResponse);
		} else {
			console.error("Unexpected API response format:", data);
		}
	} catch (error) {
		console.error("Error calling OpenAI API:", error);
	} finally {
		isLoading.value = false;
	}
};

const startRecording = () => {
	if (isListening.value) {
		stop();
		return;
	}
	if (isSupported.value) {
		// Clear previous result and state
		result.value = "";

		// Start listening
		start();
	} else {
		console.error("Speech recognition is not supported in this browser.");
	}
};

// Watch for when speech recognition detects a final result
watch(isFinal, (newValue) => {
	if (newValue && isListening.value && result.value.length > 0) {
		console.log("Final speech segment detected:", result.value);
		createUserMessage();
	}
});
</script>

<style></style>
