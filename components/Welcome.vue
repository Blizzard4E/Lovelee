<template>
	<div class="grid place-items-center h-screen">
		<div class="grid gap-8 place-items-center h-screen max-h-[800px]">
			<div>
				<h1 class="text-primary font-extrabold text-3xl text-center">
					Lovely day with
				</h1>
				<h1 class="text-primary font-extrabold text-3xl text-center">
					Lovelee
				</h1>
			</div>
			<div class="relative">
				<div
					class="absolute top-0 left-0 rounded-full w-[300px] aspect-square bg-light"
				></div>
				<BearDancing />
			</div>
			<p class="text-primary text-center text-lg">
				Welcome To Lovelee, <br />
				your online companion!
			</p>
			<div class="w-full">
				<div
					class="grid gap-4 place-items-center max-w-[300px] mx-auto"
				>
					<NuxtLink
						to="/login"
						class="w-full p-4 rounded-full bg-light text-primary font-bold text-center"
					>
						Log In
					</NuxtLink>
					<NuxtLink
						to="/sign-up"
						class="w-full p-4 rounded-full bg-light text-primary font-bold text-center"
					>
						Sign up
					</NuxtLink>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup></script>

<style></style>
