import { useNetworkStore } from "@/store/use-network-store";
import { useEffect } from "react";

export function useNetworkStatus() {
	const { online, effectiveType, downlink, rtt, init } = useNetworkStore();

	useEffect(() => {
		init();
	}, [init]);

	return { online, effectiveType, downlink, rtt };
}
