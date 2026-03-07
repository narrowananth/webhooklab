import { z } from "zod";
import { create } from "zustand";

const networkInformationSchema = z.object({
	effectiveType: z.string().optional(),
	downlink: z.number().optional(),
	rtt: z.number().optional(),
	type: z.string().optional(),
});

type NetworkInformation = z.infer<typeof networkInformationSchema>;

type NetworkState = {
	online: boolean;
	effectiveType: string | undefined;
	downlink: number | undefined;
	rtt: number | undefined;
	init: () => void;
};

let initialized = false;

function getConnection() {
	return (typeof navigator !== "undefined" &&
		(navigator as Navigator & { connection?: NetworkInformation }).connection) as
		| (NetworkInformation & EventTarget)
		| undefined;
}

export const useNetworkStore = create<NetworkState>((set) => ({
	online: typeof navigator !== "undefined" ? navigator.onLine : true,
	effectiveType: undefined,
	downlink: undefined,
	rtt: undefined,

	init() {
		if (initialized || typeof window === "undefined") return;
		initialized = true;

		const handleOnline = () => set({ online: true });
		const handleOffline = () => set({ online: false });

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		const conn = getConnection();
		if (conn) {
			set({
				effectiveType: conn.effectiveType,
				downlink: conn.downlink,
				rtt: conn.rtt,
			});
			const handleChange = () =>
				set({
					effectiveType: conn.effectiveType,
					downlink: conn.downlink,
					rtt: conn.rtt,
				});
			conn.addEventListener("change", handleChange);
			// Note: we never removeEventListener for connection change / online/offline
			// because this is a singleton for the app lifetime
		}
	},
}));
