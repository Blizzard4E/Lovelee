export type UserState = {
	id: number;
	email: string;
	username: string;
} | null;
export interface WeekDayInfo {
	dayName: string; // Short day name (Mon, Tue, etc.)
	dateNum: number; // Date number (1-31)
	fullDate: Date; // Full Date object for additional operations
}
export type Journal = {
	id: number;
	title: string;
	content: string;
	mood: string;
	user_id: string;
	created_at: Date;
};
export type Quote = {
	id: number;
	content: string;
	user_id: string;
	created_at: Date;
};
export type Chat = {
	id: number;
	conversation: Conversation;
	user_id: string;
	created_at: Date;
};
export type Conversation = {
	role: string;
	content: string;
};
export type Post = {
	id: number;
	content: string;
	user: {
		id: number;
		username: string;
	};
	created_at: Date;
};
export type Reply = {
	id: number;
	content: string;
	user_id: number;
	post_id: number;
	created_at: Date;
};
export type Like = {
	id: number;
	user_id: number;
	post_id: number;
	created_at: Date;
};
