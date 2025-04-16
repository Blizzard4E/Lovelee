<template>
	<div class="grid place-items-center h-screen">
		<form
			class="grid gap-8 place-items-center h-screen max-h-[800px] w-full px-4"
			@submit.prevent="handleSignUp"
		>
			<div>
				<h1 class="text-primary font-extrabold text-3xl text-center">
					Sign Up
				</h1>
			</div>
			<div class="grid gap-4 w-full">
				<input
					type="text"
					class="rounded-full p-4 border-secondary border-2"
					placeholder="Username"
					v-model="username"
				/>
				<input
					type="email"
					class="rounded-full p-4 border-secondary border-2"
					placeholder="Email"
					v-model="email"
				/>
				<input
					type="password"
					class="rounded-full p-4 border-secondary border-2"
					placeholder="Password"
					v-model="password"
				/>
				<p class="text-red-500" v-if="errorMessage.length > 0">
					{{ errorMessage }}
				</p>
			</div>

			<div class="w-full">
				<div
					class="grid gap-4 place-items-center max-w-[300px] mx-auto"
				>
					<button
						type="submit"
						class="w-full p-4 rounded-full bg-light text-primary font-bold text-center"
					>
						Sign up
					</button>
				</div>
			</div>
		</form>
	</div>
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient<User>();
const username = ref("");
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const { setUser } = useAuth();
interface User {
	username: string;
	email: string;
	password: string;
}
const { user } = useAuth();
if (user.value) {
	// Redirect to home if user is authenticated
	const router = useRouter();
	router.push("/home");
}
const handleSignUp = async () => {
	const { data, error } = await supabase
		.from("user")
		.insert({
			username: username.value,
			email: email.value,
			password: password.value,
		})
		.select("id, username, email")
		.single();
	if (error) {
		errorMessage.value = "Unable to sign up";
	} else {
		setUser(data);
		navigateTo("/home");
	}
};
</script>

<style></style>
