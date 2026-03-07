import { normalizeEvent } from "@/api";
import { useInspectStore } from "@/store/use-inspect-store";
import type { WebhookEvent } from "@/types";
import { useEffect, useRef, useState } from "react";

function getWsUrl(webhookId: string): string {
	const base = window.location.origin.replace(/^http/, "ws");
	return `${base}/ws?webhookId=${webhookId}`;
}

const INITIAL_RECONNECT_MS = 1_000;
const MAX_RECONNECT_MS = 30_000;
const BACKOFF_MULTIPLIER = 1.5;

export function useWebSocket(webhookId: string | null, onNewEvent?: () => void) {
	const [events, setEvents] = useState<WebhookEvent[]>([]);
	const [connected, setConnected] = useState(false);
	const [bytesReceived, setBytesReceived] = useState(0);
	const [liveStats, setLiveStats] = useState<{ count: number; totalSize: number } | null>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const cancelledRef = useRef(false);
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const reconnectAttemptRef = useRef(0);
	const onNewEventRef = useRef(onNewEvent);
	onNewEventRef.current = onNewEvent;

	useEffect(() => {
		if (!webhookId) {
			useInspectStore.getState().setWsConnected(false);
			return;
		}

		cancelledRef.current = false;
		reconnectAttemptRef.current = 0;
		setBytesReceived(0);
		setEvents([]);
		setLiveStats(null);
		const url = getWsUrl(webhookId);

		const connect = (wsUrl: string) => {
			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onopen = () => {
				if (cancelledRef.current) {
					ws.close();
					return;
				}
				reconnectAttemptRef.current = 0;
				setConnected(true);
				useInspectStore.getState().setWsConnected(true);
			};

			ws.onclose = () => {
				if (!cancelledRef.current) {
					setConnected(false);
					useInspectStore.getState().setWsConnected(false);
				}
				wsRef.current = null;
				if (cancelledRef.current) return;
				const delay = Math.min(
					INITIAL_RECONNECT_MS * BACKOFF_MULTIPLIER ** reconnectAttemptRef.current,
					MAX_RECONNECT_MS,
				);
				reconnectAttemptRef.current += 1;
				reconnectTimeoutRef.current = setTimeout(() => {
					reconnectTimeoutRef.current = null;
					connect(wsUrl);
				}, delay);
			};

			ws.onerror = () => {};

			ws.onmessage = (e) => {
				const size = typeof e.data === "string" ? e.data.length : (e.data as Blob).size;
				setBytesReceived((prev) => prev + size);
				const { isPaused, autoSelectNew, setSelectedEvent } = useInspectStore.getState();
				try {
					const data = JSON.parse(e.data as string) as {
						type?: string;
						event?: WebhookEvent;
						stats?: { count?: number; totalSize?: number };
						count?: number;
						totalSize?: number;
					};
					if (data.type === "stats:snapshot" && !isPaused) {
						const count = data.count ?? 0;
						const totalSize = data.totalSize ?? 0;
						setLiveStats({ count, totalSize });
						return;
					}
					if (isPaused) return;
					if (data.type === "event:new" && data.event) {
						const event = normalizeEvent(data.event as WebhookEvent);
						setEvents((prev) => {
							if (prev.some((p) => p.id === event.id)) return prev;
							return [event, ...prev];
						});
						if (data.stats != null) {
							const count = data.stats.count ?? 0;
							const totalSize = data.stats.totalSize ?? 0;
							setLiveStats({ count, totalSize });
						}
						onNewEventRef.current?.();
						if (autoSelectNew) {
							setSelectedEvent(event);
						}
					}
				} catch {
					// ignore parse errors
				}
			};
		};

		connect(url);

		return () => {
			cancelledRef.current = true;
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
			const socket = wsRef.current;
			wsRef.current = null;
			queueMicrotask(() => {
				if (socket?.readyState === WebSocket.OPEN) socket.close();
			});
			setConnected(false);
			useInspectStore.getState().setWsConnected(false);
		};
	}, [webhookId]);

	return { events, setEvents, connected, bytesReceived, liveStats, setLiveStats };
}
