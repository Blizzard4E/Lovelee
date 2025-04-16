<template>
	<div>
		<div v-if="!isSupported">
			Your browser does not support Speech Synthesis API
		</div>
		<div v-else>
			<!-- Voice Selection -->
			<div class="grid place-items-center gap-4 mt-4">
				<label class="text-primary text-center text-xl font-bold"
					>Voice:
				</label>
				<select
					class="bg-light text-primary p-4 w-full rounded-full"
					v-model="selectedVoice"
				>
					<option disabled>Select Voice</option>
					<option
						v-for="(v, i) in voices"
						:key="i"
						:value="v"
						class="break-words"
					>
						{{ `${v.name} (${v.lang})` }}
					</option>
				</select>
			</div>

			<!-- Speech Controls -->
			<!-- <div class="controls">
				<div>
					<label>Pitch: </label>
					<input
						v-model="pitchValue"
						type="range"
						min="0.5"
						max="2"
						step="0.1"
					/>
					{{ pitchValue }}
				</div>

				<div>
					<label>Rate: </label>
					<input
						v-model="rateValue"
						type="range"
						min="0.5"
						max="2"
						step="0.1"
					/>
					{{ rateValue }}
				</div>
			</div> -->

			<!-- Speech Buttons -->
			<!-- <div class="buttons">
				<button :disabled="isPlaying" @click="speak">
					{{ status === "pause" ? "Resume" : "Speak" }}
				</button>
				<button :disabled="!isPlaying" @click="pause">Pause</button>
				<button :disabled="!isPlaying" @click="stopSpeaking">
					Stop
				</button>
			</div> -->
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useSpeechSynthesis } from "@vueuse/core";
import { ref, shallowRef, onMounted, watch } from "vue";
const emit = defineEmits(["playingStatusChanged"]);
// Define props
const props = defineProps({
	text: {
		type: String,
		required: true,
		default: "",
	},
});

// Internal state for TTS controls
const speechText = shallowRef(props.text);
const selectedVoice = ref();
const pitchValue = shallowRef(1);
const rateValue = shallowRef(1);

// Create speech synthesis hook
const speech = useSpeechSynthesis(speechText, {
	voice: selectedVoice,
	pitch: pitchValue,
	rate: rateValue,
});

// Extract values from the speech object
const { isSupported, isPlaying, status, speak: speakFn, stop: stopFn } = speech;
defineExpose({ isPlaying });
watch(isPlaying, (newIsPlaying) => {
	emit("playingStatusChanged", newIsPlaying);
});
// Load available voices
const voices = shallowRef<SpeechSynthesisVoice[]>([]);

onMounted(() => {
	if (isSupported.value) {
		// Load voices with a slight delay to ensure they're available
		setTimeout(() => {
			const synth = window.speechSynthesis;
			voices.value = synth.getVoices();
			selectedVoice.value = voices.value[58] || voices.value[0];
		}, 100);
	}
});

// Watch for changes to the text prop
watch(
	() => props.text,
	(newText) => {
		if (newText) {
			speechText.value = newText;
			console.log("TExt change", speechText.value);
			speak();
		}
	}
);

// Function wrappers
function speak() {
	if (status.value === "pause") {
		window.speechSynthesis.resume();
	} else {
		speakFn();
	}
}

function pause() {
	window.speechSynthesis.pause();
}

function stopSpeaking() {
	stopFn();
}
</script>
