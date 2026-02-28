/**
 * RequestItem - Refined list item with left accent bar, hover/active states
 */
import type { WebhookEvent } from "../../types";
import { METHOD_BADGE_STYLES, BADGE_STYLE_GRAY } from "../../constants";
import { formatSize, getRequestSizeBytes } from "../../utils/requestSize";

interface RequestItemProps {
	event: WebhookEvent;
	isSelected: boolean;
	onSelect: () => void;
	isNew?: boolean;
}

export function RequestItem({ event, isSelected, onSelect, isNew }: RequestItemProps) {
	const badgeStyle = METHOD_BADGE_STYLES[event.method] ?? BADGE_STYLE_GRAY;
	const dateTime = new Date(event.timestamp).toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	return (
		<button
			type="button"
			onClick={onSelect}
			className={`
				relative flex flex-col gap-1 px-3 py-2 rounded-md cursor-pointer transition-all duration-150 w-full text-left
				${isSelected ? "bg-elevated border border-border" : "border border-transparent"}
				${!isSelected ? "hover:bg-elevated hover:translate-x-0.5" : ""}
				${isNew ? "ring-1 ring-success/50 animate-[pulse-border_800ms_ease-out]" : ""}
			`}
		>
			{/* Left accent bar - instant startup feel */}
			{isSelected && (
				<span className="absolute left-0 top-0 h-full w-1 bg-accent rounded-l-md" />
			)}
			<div className="flex justify-between items-center gap-2 leading-none">
				<div className="flex items-center gap-2 min-w-0">
					<span
						className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md border"
						style={{
							backgroundColor: badgeStyle.bg,
							color: badgeStyle.fg,
							borderColor: badgeStyle.border,
						}}
					>
						{event.method === "DELETE" ? "DEL" : event.method}
					</span>
					<span className="text-sm font-medium text-text-primary truncate">
						200 OK
					</span>
				</div>
				<span className="text-xs text-text-secondary flex-shrink-0">
					{dateTime}
				</span>
			</div>
			<div className="flex items-center gap-3 text-xs text-text-secondary leading-none">
				<span className="flex items-center gap-1">
					<span className="material-symbols-outlined text-sm">public</span>
					{event.ip ?? "—"}
				</span>
				<span className="flex items-center gap-1">
					<span className="material-symbols-outlined text-sm">data_object</span>
					{formatSize(getRequestSizeBytes(event))}
				</span>
				<span>#{event.id}</span>
			</div>
		</button>
	);
}
