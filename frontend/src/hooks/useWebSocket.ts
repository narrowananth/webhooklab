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
	const [bytesReceived, setBytesReceived] = useState(0);
	const wsRef = useRef<WebSocket | null>(null);
	const isPaused = useInspectStore((s) => s.isPaused);
	const autoSelectNew = useInspectStore((s) => s.autoSelectNew);
	const setSelectedEvent = useInspectStore((s) => s.setSelectedEvent);

	useEffect(() => {
		if (!webhookId) return;

		setBytesReceived(0);
		const url = getWsUrl(webhookId);
		const ws = new WebSocket(url);
		wsRef.current = ws;

		ws.onopen = () => setConnected(true);
		ws.onclose = () => setConnected(false);
		ws.onmessage = (e) => {
			const size = typeof e.data === "string" ? e.data.length : e.data.size;
			setBytesReceived((prev) => prev + size);
			// Don't add new events when paused
			if (isPaused) return;
			try {
				const data = JSON.parse(e.data);
				if (data.type === "event:new" && data.event) {
					setEvents((prev) => [data.event, ...prev]);
					if (autoSelectNew) {
						setSelectedEvent(data.event);
					}
				}
			} catch {
				// ignore parse errors
			}
		};

		return () => {
			ws.close();
			wsRef.current = null;
		};
	}, [webhookId, isPaused, autoSelectNew, setSelectedEvent]);

	return { events, setEvents, connected, bytesReceived };
}
