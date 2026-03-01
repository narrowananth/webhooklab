/**
 * TopNav - Premium SaaS style navigation bar (56px)
 * Logo, Connected badge, Webhook URL box, Pause/Clear/Settings
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface TopNavProps {
	webhookUrl: string;
	connected: boolean;
	onCopy: () => void;
	onClear: () => void;
	isPaused: boolean;
	onTogglePause: () => void;
	theme: "light" | "dark";
	onToggleTheme: () => void;
	autoSelectNew: boolean;
	onToggleAutoSelectNew: () => void;
}

export function TopNav({
	webhookUrl,
	connected,
	onCopy,
	onClear,
	isPaused,
	onTogglePause,
	theme,
	onToggleTheme,
	autoSelectNew,
	onToggleAutoSelectNew,
}: TopNavProps) {
	const [urlCopied, setUrlCopied] = useState(false);
	const [optionsOpen, setOptionsOpen] = useState(false);
	const optionsRef = useRef<HTMLDivElement>(null);

	const handleCopy = () => {
		onCopy();
		setUrlCopied(true);
		setTimeout(() => setUrlCopied(false), 1500);
	};

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
				setOptionsOpen(false);
			}
		};
		document.addEventListener("click", handler);
		return () => document.removeEventListener("click", handler);
	}, []);

	return (
		<header
			className="h-14 min-h-14 flex-shrink-0 border-b border-border bg-surface px-6 flex flex-wrap items-center justify-between gap-4 transition-colors"
			style={{ height: "56px", minHeight: "56px" }}
		>
			{/* Left: Logo + WebhookLab + Connected badge */}
			<div className="flex items-center gap-4 flex-shrink-0">
				<Link
					to="/"
					className="font-semibold text-lg text-text-primary no-underline flex items-center gap-2 transition-opacity hover:opacity-90 leading-none"
				>
					<img
						src="/asset/logo/favicon.svg"
						alt="WebhookLab"
						className="rounded-md object-contain flex-shrink-0 align-middle"
						style={{ width: "var(--wl-logo-size)", height: "var(--wl-logo-size)" }}
					/>
					<span className="hidden sm:inline leading-none self-center">WebhookLab</span>
				</Link>
				<div
					className="flex items-center justify-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium transition-colors leading-none"
					style={{
						backgroundColor: connected ? "var(--wl-connected-bg)" : "var(--wl-disconnected-bg)",
						color: connected ? "var(--wl-connected-fg)" : "var(--wl-disconnected-fg)",
					}}
				>
					<span
						className={`w-1.5 h-1.5 rounded-full ${connected ? "animate-pulse" : ""}`}
						style={{
							backgroundColor: connected ? "var(--wl-connected-fg)" : "var(--wl-disconnected-fg)",
						}}
					/>
					<span className="uppercase tracking-wide">
						{connected ? "Connected" : "Disconnected"}
					</span>
				</div>
			</div>

			{/* Center: Webhook URL box */}
			<div className="flex-1 max-w-2xl px-4 md:px-6 min-w-0 flex items-center">
				<div className="flex items-center justify-center flex-1 bg-elevated border border-border rounded-md overflow-hidden min-h-9 transition-all hover:border-border/80 hover:shadow-sm hover:shadow-accent/5">
					<span className="px-4 py-2 text-sm font-mono text-text-muted flex-1 overflow-x-auto whitespace-nowrap scrollbar-thin text-center">
						{webhookUrl || "—"}
					</span>
					<button
						type="button"
						onClick={handleCopy}
						aria-label="Copy URL"
						className="p-2 flex items-center justify-center border-l border-border hover:bg-elevated/80 transition-colors active:scale-95"
					>
						<span
							className="material-symbols-outlined text-base transition-colors"
							style={{
								color: urlCopied ? "var(--wl-success)" : undefined,
							}}
						>
							{urlCopied ? "check" : "content_copy"}
						</span>
					</button>
				</div>
			</div>

			{/* Right: Pause, Clear, Settings */}
			<div className="flex items-center gap-2 flex-shrink-0">
				<button
					type="button"
					onClick={onTogglePause}
					aria-label={isPaused ? "Resume" : "Pause"}
					className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-elevated active:scale-95 ${
						isPaused ? "text-text-muted" : "text-text-primary"
					}`}
				>
					<span className="material-symbols-outlined text-lg">pause</span>
					<span className="hidden md:inline">Pause</span>
				</button>
				<button
					type="button"
					onClick={onClear}
					aria-label="Clear"
					className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-text-secondary hover:bg-elevated hover:text-text-primary transition-colors active:scale-95"
				>
					<span className="material-symbols-outlined text-lg">delete_sweep</span>
					<span className="hidden md:inline">Clear</span>
				</button>
				<button
					type="button"
					onClick={onToggleTheme}
					aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
					className="p-2 rounded-md flex items-center justify-center text-text-muted hover:bg-elevated transition-colors active:scale-95"
				>
					<span className="material-symbols-outlined text-xl">
						{theme === "dark" ? "light_mode" : "dark_mode"}
					</span>
				</button>
				{/* Settings / Options */}
				<div className="relative" ref={optionsRef}>
					<button
						type="button"
						onClick={() => setOptionsOpen((v) => !v)}
						aria-label="Settings"
						aria-expanded={optionsOpen}
						className="w-9 h-9 rounded-md flex items-center justify-center text-text-muted hover:bg-elevated transition-colors active:scale-95"
					>
						<span className="material-symbols-outlined text-xl">settings</span>
					</button>
					{optionsOpen && (
						<div className="absolute right-0 top-full mt-1 min-w-[220px] py-1 bg-surface border border-border rounded-lg shadow-xl shadow-black/30 z-50">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onToggleAutoSelectNew();
								}}
								className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-text-primary hover:bg-elevated"
							>
								<span>Auto-select new requests</span>
								<div
									className={`w-10 h-6 rounded-full relative transition-colors border flex-shrink-0 ${
										autoSelectNew ? "bg-accent border-accent" : "bg-elevated border-border"
									}`}
								>
									<span
										className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-left ${
											autoSelectNew ? "left-5" : "left-1"
										}`}
									/>
								</div>
							</button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
