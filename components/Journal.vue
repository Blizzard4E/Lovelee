<template>
	<div class="bg-secondary gap-4 p-6 rounded-2xl relative">
		<div class="grid grid-cols-4 gap-2">
			<div
				class="grid gap-4 place-items-center"
				v-if="journal.mood === 'angry'"
			>
				<div class="relative">
					<div
						class="bg-white rounded-full w-16 h-16 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
					></div>
					<img
						class="w-14 z-10 relative transition-all"
						src="/images/angry.png"
						alt="Angry"
					/>
				</div>
				<h1 class="text-center font-bold text-white">Angry</h1>
			</div>
			<div
				class="grid gap-4 place-items-center"
				v-if="journal.mood === 'sad'"
			>
				<div class="relative">
					<div
						class="bg-white rounded-full w-16 h-16 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
					></div>
					<img
						class="w-14 z-10 relative transition-all"
						src="/images/sad.png"
						alt="Sad"
					/>
				</div>
				<h1 class="text-center font-bold text-white">Sad</h1>
			</div>
			<div
				class="grid gap-4 place-items-center"
				v-if="journal.mood === 'okay'"
			>
				<div class="relative">
					<div
						class="bg-white rounded-full w-16 h-16 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
					></div>
					<img
						class="w-14 z-10 relative transition-all"
						src="/images/okay.png"
						alt="Okay"
					/>
				</div>
				<h1 class="text-center font-bold text-white">Okay</h1>
			</div>
			<div
				class="grid gap-4 place-items-center"
				v-if="journal.mood === 'happy'"
			>
				<div class="relative">
					<div
						class="bg-white rounded-full w-16 h-16 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
					></div>
					<img
						class="w-14 z-10 relative transition-all"
						src="/images/happy.png"
						alt="Happy"
					/>
				</div>
				<h1 class="text-center font-bold text-white">Happy</h1>
			</div>
			<div
				class="grid gap-4 place-items-center"
				v-if="journal.mood === 'very_happy'"
			>
				<div class="relative">
					<div
						class="bg-white rounded-full w-16 h-16 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
					></div>
					<img
						class="w-14 z-10 relative transition-all"
						src="/images/very_happy.png"
						alt="Very Happy"
					/>
				</div>
				<h1 class="text-center font-bold text-white">Very Happy</h1>
			</div>
			<div class="col-span-3 flex flex-col justify-between">
				<div>
					<h1 class="text-white font-bold text-xl">
						{{ journal.title }}
					</h1>
					<p class="text-white/90 text-sm">
						{{ journal.content }}
					</p>
				</div>
				<div class="flex justify-end">
					<p class="text-white/90 text-sm font-bold">
						{{ formatDate(journal.created_at) }}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
defineProps({
	journal: {
		type: Object,
		required: true,
	},
});
</script>

<style></style>
