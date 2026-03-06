/**
 * WebSocket hook for real-time webhook events.
 * Connects to backend WS, receives event:new messages,
 * and merges them into the events list. Respects isPaused from Zustand.
 * Uses deferred close to avoid "closed before connection" in React Strict Mode.
 * Auto-reconnects with exponential backoff on drop (backend restart, proxy, network).
 */
import { useEffect, useRef, useState } from "react";
import { normalizeEvent } from "../api";
import { useInspectStore } from "../store/useInspectStore";
import type { WebhookEvent } from "../types";

function getWsUrl(webhookId: string): string {
	const base = window.location.origin.replace(/^http/, "ws");
	return `${base}/ws?webhookId=${webhookId}`;
}

const INITIAL_RECONNECT_MS = 1_000;
const MAX_RECONNECT_MS = 30_000;
const BACKOFF_MULTIPLIER = 1.5;

export function useWebSocket(webhookId: string | null) {
	const [events, setEvents] = useState<WebhookEvent[]>([]);
	const [connected, setConnected] = useState(false);
	const [bytesReceived, setBytesReceived] = useState(0);
	const wsRef = useRef<WebSocket | null>(null);
	const cancelledRef = useRef(false);
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const reconnectAttemptRef = useRef(0);

	const connect = (url: string) => {
		const ws = new WebSocket(url);
		wsRef.current = ws;

		ws.onopen = () => {
			if (cancelledRef.current) {
				ws.close();
				return;
			}
			reconnectAttemptRef.current = 0;
			setConnected(true);
		};

		ws.onclose = () => {
			if (!cancelledRef.current) setConnected(false);
			wsRef.current = null;
			if (cancelledRef.current) return;
			const delay = Math.min(
				INITIAL_RECONNECT_MS * BACKOFF_MULTIPLIER ** reconnectAttemptRef.current,
				MAX_RECONNECT_MS,
			);
			reconnectAttemptRef.current += 1;
			reconnectTimeoutRef.current = setTimeout(() => {
				reconnectTimeoutRef.current = null;
				connect(url);
			}, delay);
		};

		ws.onerror = () => {
			// Suppress "closed before connection" noise in React Strict Mode
		};

		ws.onmessage = (e) => {
			const size = typeof e.data === "string" ? e.data.length : e.data.size;
			setBytesReceived((prev) => prev + size);
			const { isPaused, autoSelectNew, setSelectedEvent } = useInspectStore.getState();
			if (isPaused) return;
			try {
				const data = JSON.parse(e.data);
				if (data.type === "event:new" && data.event) {
					const event = normalizeEvent(data.event as WebhookEvent);
					setEvents((prev) => [event, ...prev]);
					if (autoSelectNew) {
						setSelectedEvent(event);
					}
				}
			} catch {
				// ignore parse errors
			}
		};
	};

	useEffect(() => {
		if (!webhookId) return;

		cancelledRef.current = false;
		reconnectAttemptRef.current = 0;
		setBytesReceived(0);
		const url = getWsUrl(webhookId);
		connect(url);

		return () => {
			cancelledRef.current = true;
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
			const socket = wsRef.current;
			wsRef.current = null;
			// Only close if already open. If still CONNECTING, don't call close() — the browser
			// would log "WebSocket is closed before the connection is established". When it
			// opens, onopen will see cancelledRef and close it; if it fails, onclose runs and we don't reconnect.
			queueMicrotask(() => {
				if (socket?.readyState === WebSocket.OPEN) socket.close();
			});
		};
	}, [webhookId]);

	return { events, setEvents, connected, bytesReceived };
}
