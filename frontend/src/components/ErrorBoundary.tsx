import { ErrorFallback } from "@/components/ui/organisms/ErrorFallback";
import type { ReactNode } from "react";
import { Component } from "react";

type ErrorBoundaryProps = {
	children: ReactNode;
	title?: string;
};

type ErrorBoundaryState = {
	hasError: boolean;
	message: string;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = { hasError: false, message: "" };

	static getDerivedStateFromError(err: unknown): ErrorBoundaryState {
		const message = err instanceof Error ? err.message : "Unknown error";
		return { hasError: true, message };
	}

	override componentDidCatch(err: unknown) {
		console.error("[ErrorBoundary] Caught error:", err);
	}

	private reset = () => {
		this.setState({ hasError: false, message: "" });
	};

	override render() {
		if (!this.state.hasError) return this.props.children;

		return (
			<ErrorFallback
				title={this.props.title ?? "Something went wrong"}
				message={
					this.state.message ||
					"An unexpected error occurred. Try reloading or try again."
				}
				onRetry={this.reset}
			/>
		);
	}
}
