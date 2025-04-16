export function getProfilePic(userId: number): string {
	// Simple hash function to ensure consistent results for the same userId
	// We use modulo 12 to get a number between 0 and 11 (for 12 profile pictures)
	return `/images/profiles/${Math.abs(userId) % 12}.png`;
}
export function getWelcomeWordByTime(date: Date = new Date()): string {
	const hours = date.getHours();

	if (hours >= 5 && hours < 12) {
		return "Morning";
	} else if (hours >= 12 && hours < 18) {
		return "Afternoon";
	} else {
		return "Evening";
	}
}
export function getCurrentWeekDates(): WeekDayInfo[] {
	const today = new Date();
	const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.

	// Calculate the Monday of current week
	// If today is Sunday (0), we need to go back 6 days
	// If today is any other day, we go back (currentDay - 1) days
	const mondayOffset = currentDay === 0 ? -6 : -(currentDay - 1);
	const monday = new Date(today);
	monday.setDate(today.getDate() + mondayOffset);

	// Short day names
	const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

	// Generate array for the week
	const weekDates: WeekDayInfo[] = [];

	for (let i = 0; i < 7; i++) {
		const currentDate = new Date(monday);
		currentDate.setDate(monday.getDate() + i);

		weekDates.push({
			dayName: dayNames[i],
			dateNum: currentDate.getDate(),
			fullDate: currentDate,
		});
	}

	return weekDates;
}
export function isCurrentDay(dateNum: number): boolean {
	const today = new Date();
	return today.getDate() === dateNum;
}
export function formatDate(isoDateString: string): string {
	// Convert the ISO string to a Date object
	const date = new Date(isoDateString);

	// Check if the date is valid
	if (isNaN(date.getTime())) {
		throw new Error("Invalid date string provided");
	}

	// Array of month abbreviations
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	// Get month abbreviation
	const month = months[date.getMonth()];

	// Get day and pad with leading zero if needed
	const day = date.getDate().toString().padStart(2, "0");

	// Get full year
	const year = date.getFullYear();

	// Return formatted date string
	return `${month} ${day} ${year}`;
}
