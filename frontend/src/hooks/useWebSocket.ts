/**
 * WebSocket hook for real-time webhook events.
 * Connects to backend WS, receives event:new messages,
 * and merges them into the events list. Respects isPaused from Zustand.
 * Uses deferred close to avoid "closed before connection" in React Strict Mode.
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
	const cancelledRef = useRef(false);

	useEffect(() => {
		if (!webhookId) return;

		cancelledRef.current = false;
		setBytesReceived(0);
		const url = getWsUrl(webhookId);
		const ws = new WebSocket(url);
		wsRef.current = ws;

		ws.onopen = () => {
			if (!cancelledRef.current) setConnected(true);
		};
		ws.onclose = () => {
			if (!cancelledRef.current) setConnected(false);
		};
		ws.onerror = () => {
			// Suppress "closed before connection" noise in React Strict Mode
			// (cleanup closes the socket before onopen fires)
		};
		ws.onmessage = (e) => {
			const size = typeof e.data === "string" ? e.data.length : e.data.size;
			setBytesReceived((prev) => prev + size);
			// Don't add new events when paused - read from store to avoid recreating WS on pause/play
			const { isPaused, autoSelectNew, setSelectedEvent } = useInspectStore.getState();
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
			cancelledRef.current = true;
			wsRef.current = null;
			// Defer close so React Strict Mode's unmount→remount doesn't close
			// the socket synchronously before it connects (avoids console error)
			const socket = ws;
			queueMicrotask(() => socket.close());
		};
	}, [webhookId]);

	return { events, setEvents, connected, bytesReceived };
}
