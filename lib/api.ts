import axios from "axios";

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

const api = axios.create({ baseURL: API_BASE });

export async function postJson(path: string, body: unknown) {
	const url = `${API_BASE}${path}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body ?? {}),
	});

	let data: any = {};
	try {
		data = await res.json();
	} catch {
		data = {};
	}

	if (!res.ok) {
		const message = data?.message || `Request failed (${res.status})`;
		throw new Error(message);
	}

	return data;
}

export default api;
