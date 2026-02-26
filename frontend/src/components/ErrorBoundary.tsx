/**
 * Catches React errors and displays a fallback UI instead of a blank screen.
 */
import { Component, type ReactNode } from "react";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	render() {
		if (this.state.hasError && this.state.error) {
			return (
				<div
					style={{
						minHeight: "100vh",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						padding: "2rem",
						fontFamily: "system-ui, sans-serif",
						backgroundColor: "#0f172a",
						color: "#f8fafc",
					}}
				>
					<h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
						Something went wrong
					</h1>
					<pre
						style={{
							padding: "1rem",
							backgroundColor: "#1e293b",
							borderRadius: "0.5rem",
							overflow: "auto",
							maxWidth: "100%",
							fontSize: "0.875rem",
						}}
					>
						{this.state.error.message}
					</pre>
					<button
						onClick={() => window.location.reload()}
						style={{
							marginTop: "1rem",
							padding: "0.5rem 1rem",
							backgroundColor: "#6366f1",
							color: "white",
							border: "none",
							borderRadius: "0.5rem",
							cursor: "pointer",
						}}
					>
						Reload
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}
