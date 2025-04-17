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
	if (!user.value || !chat.value) return;
	console.log("Sending to bot");

	try {
		// Analyze message content to determine appropriate response type
		const userMessageContent = newMessage.content;
		const conversationHistory = chat.value.conversation;
		const responseType = determineResponseType(
			userMessageContent,
			conversationHistory
		);

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
					messages: [
						// Include system message to guide the AI's behavior
						{
							role: "system",
							content: `You are a supportive mental wellness companion. Your primary goal is to listen and understand. 
                            Focus on empathetic responses that validate the user's feelings. 
                            Wait for clear indicators that the user is seeking advice before offering solutions.
                            Response type for this message: ${responseType}`,
						},
						...chat.value.conversation,
						newMessage,
					],
				}),
			}
		);

		const data = await response.json();
		if (data.choices && data.choices.length > 0) {
			assistantResponse.value = data.choices[0].message.content;
			createBotMessage(assistantResponse.value);
			console.log("Response from GPT:", assistantResponse.value);
			// saveConversationToSupabase();
		} else {
			console.error("Unexpected API response format:", data);
		}
	} catch (error) {
		console.error("Error calling OpenAI API:", error);
	} finally {
		isLoading.value = false;
	}
};

/**
 * Determines what type of response the bot should provide based on
 * user message content and conversation context
 */
const determineResponseType = (
	messageContent: string,
	conversationHistory: Array<{ role: string; content: string }>
) => {
	// Default to "listening mode" for new conversations or when we're unsure
	if (!conversationHistory || conversationHistory.length < 3) {
		return "LISTENING_MODE";
	}

	// Check if the user is explicitly asking for help or advice
	const helpPhrases = [
		"help me",
		"what should i do",
		"any advice",
		"can you suggest",
		"how can i",
		"what do you think",
		"solve this",
	];

	const isAskingForHelp = helpPhrases.some((phrase) =>
		messageContent.toLowerCase().includes(phrase)
	);

	if (isAskingForHelp) {
		return "ADVICE_MODE";
	}

	// Check if this is a follow-up to an ongoing support conversation
	const recentMessages = conversationHistory.slice(-4);
	const botWasAdvisingPreviously = recentMessages.some(
		(msg) =>
			msg.role === "assistant" &&
			(msg.content.includes("suggestion") ||
				msg.content.includes("recommend") ||
				msg.content.includes("try to"))
	);

	if (botWasAdvisingPreviously && messageContent.length > 15) {
		// User is responding to previous advice with substance
		return "FOLLOW_UP_MODE";
	}

	// Analysis of emotional content
	const emotionalWords = [
		"sad",
		"happy",
		"angry",
		"frustrated",
		"anxious",
		"depressed",
		"worried",
		"scared",
		"lonely",
		"overwhelmed",
	];

	const hasEmotionalContent = emotionalWords.some((word) =>
		messageContent.toLowerCase().includes(word)
	);

	if (hasEmotionalContent) {
		return "EMOTIONAL_SUPPORT_MODE";
	}

	// Default to listening when unsure
	return "LISTENING_MODE";
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
