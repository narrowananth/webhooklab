/**
 * WebSocket hook for real-time webhook events.
 * Connects to backend WS, receives event:new messages,
 * and merges them into the events list. Respects isPaused from Zustand.
 */
import { useEffect, useRef, useState } from "react";
import type { WebhookEvent } from "../types";
import { useInspectStore } from "../store/useInspectStore";

function getWsUrl(webhookId: string): string {
	const base = window.location.origin.replace(/^http/, "ws");
	return `${base}/ws?webhookId=${webhookId}`;
}

export function useWebSocket(webhookId: string | null) {
	const [events, setEvents] = useState<WebhookEvent[]>([]);
	const [connected, setConnected] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const isPaused = useInspectStore((s) => s.isPaused);

	useEffect(() => {
		if (!webhookId) return;

		const url = getWsUrl(webhookId);
		const ws = new WebSocket(url);
		wsRef.current = ws;

		ws.onopen = () => setConnected(true);
		ws.onclose = () => setConnected(false);
		ws.onmessage = (e) => {
			// Don't add new events when paused
			if (isPaused) return;
			try {
				const data = JSON.parse(e.data);
				if (data.type === "event:new" && data.event) {
					setEvents((prev) => [data.event, ...prev]);
				}
			} catch {
				// ignore parse errors
			}
		};

		return () => {
			ws.close();
			wsRef.current = null;
		};
	}, [webhookId, isPaused]);

	return { events, setEvents, connected };
}
