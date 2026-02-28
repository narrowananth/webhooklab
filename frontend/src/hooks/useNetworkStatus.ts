/**
 * Hook for browser network status.
 * Uses navigator.onLine for online/offline.
 * Uses navigator.connection (Network Information API) when available for
 * effectiveType, downlink, rtt. Limited browser support (Chrome, Edge).
 */
import { useEffect, useState } from "react";

interface NetworkInformation {
	effectiveType?: string;
	downlink?: number;
	rtt?: number;
	type?: string;
}

export function useNetworkStatus() {
	const [online, setOnline] = useState(
		typeof navigator !== "undefined" ? navigator.onLine : true,
	);
	const [effectiveType, setEffectiveType] = useState<string | undefined>();
	const [downlink, setDownlink] = useState<number | undefined>();
	const [rtt, setRtt] = useState<number | undefined>();

	useEffect(() => {
		const handleOnline = () => setOnline(true);
		const handleOffline = () => setOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		const conn = (navigator as Navigator & { connection?: NetworkInformation })
			.connection;
		if (conn) {
			setEffectiveType(conn.effectiveType);
			setDownlink(conn.downlink);
			setRtt(conn.rtt);

			const handleChange = () => {
				setEffectiveType(conn.effectiveType);
				setDownlink(conn.downlink);
				setRtt(conn.rtt);
			};
			(conn as EventTarget).addEventListener("change", handleChange);
			return () => {
				window.removeEventListener("online", handleOnline);
				window.removeEventListener("offline", handleOffline);
				(conn as EventTarget).removeEventListener("change", handleChange);
			};
		}

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	return { online, effectiveType, downlink, rtt };
}
