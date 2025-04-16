<template>
	<div class="p-4">
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

		<div v-if="result" class="text-primary">
			<p>"{{ result }}"</p>
		</div>
		<!-- <div v-if="apiResponse" class="api-response">
			<h3>Response:</h3>
			<p>{{ apiResponse }}</p>    
		</div> -->
		<TTSModule :text="apiResponse" />
	</div>
</template>

<script lang="ts" setup>
import { useSpeechRecognition } from "@vueuse/core";
import { watch, ref } from "vue";

const { isSupported, isListening, isFinal, result, start, stop } =
	useSpeechRecognition({
		continuous: true,
		interimResults: true,
	});

// Track silence to auto-detect when user stops speaking
const silenceTimer = ref<ReturnType<typeof setInterval> | null>(null);
const silenceThreshold = 2000; // 2 seconds of silence to trigger auto-stop
const lastTranscriptLength = ref(0);
const isLoading = ref(false);
const apiResponse = ref("");
const config = useRuntimeConfig();

// Add this to your script section
const conversationHistory = ref<Array<{ role: string; content: string }>>([
	// You can add a system message to set behavior
	{
		role: "system",
		content: "You are a helpful assistant having a voice conversation.",
	},
]);

// Modify your sendToAPI function
const sendToAPI = async () => {
	if (!result.value) return;
	isLoading.value = true;

	// Add the user's message to history
	conversationHistory.value.push({
		role: "user",
		content: result.value,
	});
	console.log(conversationHistory.value);
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
					messages: conversationHistory.value, // Send entire history
				}),
			}
		);
		const data = await response.json();
		if (data.choices && data.choices.length > 0) {
			const assistantResponse = data.choices[0].message.content;
			apiResponse.value = assistantResponse;

			// Add the assistant's response to history
			conversationHistory.value.push({
				role: "assistant",
				content: assistantResponse,
			});

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
const startRecording = () => {
	if (isListening.value) {
		stop();
		return;
	}
	if (isSupported.value) {
		// Clear previous result and state
		result.value = "";
		lastTranscriptLength.value = 0;

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
		sendToAPI();
	}
});
</script>

<style></style>
