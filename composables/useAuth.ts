export const useAuth = () => {
	// Use useState with a function that checks localStorage first
	const userState = useState<UserState>("userState", () => {
		// Run only on client-side

		if (import.meta.client) {
			console.log("Checking localstorage");
			const storedUser = localStorage.getItem("user");
			return storedUser ? JSON.parse(storedUser) : null;
		}
		return null;
	});

	// Watch for changes and sync with localStorage
	watch(
		userState,
		(newValue) => {
			if (import.meta.client) {
				if (newValue) {
					localStorage.setItem("user", JSON.stringify(newValue));
				} else {
					localStorage.setItem("user", "");
				}
			}
		},
		{ deep: true }
	);

	// Helper to update user state
	const setUser = (user: UserState) => {
		userState.value = user;
	};

	// Helper to clear user state
	const clearUser = () => {
		userState.value = null;
	};

	return {
		user: userState,
		setUser,
		clearUser,
	};
};
