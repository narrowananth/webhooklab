/**
 * Sidebar - 340px width, search, filter dropdown, request list
 */
import { useMemo, useState } from "react";
import type { WebhookEvent } from "../../types";
import { RequestItem } from "../request/RequestItem";

const METHODS = ["All", "GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const PAGE_SIZE_OPTIONS = [25, 50, 75, 100] as const;

interface SidebarProps {
	events: WebhookEvent[];
	selectedEvent: WebhookEvent | null;
	onSelectEvent: (event: WebhookEvent) => void;
	searchFilter: string;
	onSearchFilterChange: (v: string) => void;
	methodFilter: string;
	onMethodFilterChange: (v: string) => void;
	ipFilter?: string;
	onIpFilterChange?: (v: string) => void;
	requestIdFilter?: string;
	onRequestIdFilterChange?: (v: string) => void;
	onClearFilters?: () => void;
	hasActiveFilters?: boolean;
	filterMode?: boolean;
	pagination?: {
		page: number;
		totalPages: number;
		total: number;
		onPrev: () => void;
		onNext: () => void;
	};
	pageSize?: number;
	onPageSizeChange?: (size: number) => void;
	newestEventId?: number | null;
}

export function Sidebar({
	events,
	selectedEvent,
	onSelectEvent,
	searchFilter,
	onSearchFilterChange,
	methodFilter,
	onMethodFilterChange,
	ipFilter = "",
	onIpFilterChange,
	requestIdFilter = "",
	onRequestIdFilterChange,
	onClearFilters,
	hasActiveFilters = false,
	filterMode = false,
	pagination,
	pageSize = 25,
	onPageSizeChange,
	newestEventId = null,
}: SidebarProps) {
	const [filtersExpanded, setFiltersExpanded] = useState(false);
	const [pageSizeDropdownOpen, setPageSizeDropdownOpen] = useState(false);

	const filteredEvents = useMemo(() => {
		if (filterMode) return events;
		return events.filter((e) => {
			if (searchFilter) {
				const q = searchFilter.toLowerCase();
				const bodyStr = e.rawBody ?? JSON.stringify(e.body ?? {});
				const match =
					e.method.toLowerCase().includes(q) ||
					bodyStr.toLowerCase().includes(q) ||
					JSON.stringify(e.headers ?? {}).toLowerCase().includes(q) ||
					JSON.stringify(e.queryParams ?? {}).toLowerCase().includes(q) ||
					(e.ip?.toLowerCase().includes(q) ?? false);
				if (!match) return false;
			}
			if (methodFilter && methodFilter !== "All" && e.method !== methodFilter)
				return false;
			if (ipFilter?.trim() && !e.ip?.toLowerCase().includes(ipFilter.trim().toLowerCase()))
				return false;
			if (requestIdFilter?.trim() && String(e.id) !== requestIdFilter.trim())
				return false;
			return true;
		});
	}, [events, filterMode, searchFilter, methodFilter, ipFilter, requestIdFilter]);

	const isMobileWithSelection = !!selectedEvent;

	return (
		<aside
			className={`
				w-full lg:w-[340px] min-w-[340px] flex-shrink-0 min-h-0
				border-r border-border bg-surface
				flex flex-col overflow-hidden
				${isMobileWithSelection ? "hidden lg:flex" : "flex"}
			`}
		>
			{/* Search + Filters */}
			<div className="p-4 border-b border-border flex-shrink-0">
				<div className="relative mb-3 flex items-center">
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none z-10 material-symbols-outlined text-xl">
						search
					</span>
					<input
						type="text"
						placeholder="Search requests..."
						value={searchFilter}
						onChange={(e) => onSearchFilterChange(e.target.value)}
						className="w-full pl-10 pr-4 py-2 text-sm bg-elevated border border-border rounded-md placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors leading-normal"
					/>
				</div>
				{/* Method filter - small, muted, inline */}
				<div className="flex gap-2 flex-wrap">
					{METHODS.map((m) => {
						const isActive = methodFilter ? m === methodFilter : m === "All";
						return (
							<button
								key={m}
								type="button"
								onClick={() => onMethodFilterChange(m === "All" ? "" : m)}
								className={`
									inline-flex items-center justify-center px-2 py-1 text-[11px] font-semibold rounded-md transition-all active:scale-95 leading-none
									${isActive ? "bg-elevated border border-border text-text-primary" : "border border-transparent text-text-muted hover:bg-elevated hover:text-text-primary"}
								`}
							>
								{m}
							</button>
						);
					})}
				</div>
				{/* More filters (IP, Request ID) - collapsible */}
				{onIpFilterChange && onRequestIdFilterChange && (
					<div className="mt-2">
						<button
							type="button"
							onClick={() => setFiltersExpanded(!filtersExpanded)}
							className="w-full flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-elevated text-xs font-semibold text-text-secondary"
						>
							{hasActiveFilters ? "Filters active" : "More filters"}
							<span
								className="material-symbols-outlined text-base transition-transform"
								style={{ transform: filtersExpanded ? "rotate(180deg)" : undefined }}
							>
								expand_more
							</span>
						</button>
						{filtersExpanded && (
							<div className="flex flex-col gap-2 mt-2">
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary material-symbols-outlined text-lg">
										public
									</span>
									<input
										type="text"
										placeholder="IP address"
										value={ipFilter}
										onChange={(e) => onIpFilterChange(e.target.value)}
										className="w-full pl-10 pr-4 py-2 text-xs bg-bg border border-border rounded-md"
									/>
								</div>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary material-symbols-outlined text-lg">
										tag
									</span>
									<input
										type="text"
										placeholder="Request ID"
										value={requestIdFilter}
										onChange={(e) =>
											onRequestIdFilterChange(e.target.value.replace(/\D/g, ""))
										}
										className="w-full pl-10 pr-4 py-2 text-xs bg-bg border border-border rounded-md"
									/>
								</div>
								{hasActiveFilters && onClearFilters && (
									<button
										type="button"
										onClick={onClearFilters}
										className="text-xs text-error hover:underline"
									>
										Clear all filters
									</button>
								)}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Request list - scrollable */}
			<div className="flex-1 min-h-0 overflow-y-auto p-2 custom-scrollbar">
				{filteredEvents.length === 0 ? (
					<div className="p-8 text-center">
						<p className="text-sm text-text-secondary">No requests yet</p>
					</div>
				) : (
					<div className="flex flex-col gap-1">
						{filteredEvents.map((event) => (
							<RequestItem
								key={event.id}
								event={event}
								isSelected={selectedEvent?.id === event.id}
								onSelect={() => onSelectEvent(event)}
								isNew={newestEventId === event.id}
							/>
						))}
					</div>
				)}
			</div>

			{/* Page size + pagination */}
			{onPageSizeChange && (
				<div className="px-4 py-3 border-t border-border flex items-center justify-between gap-2 flex-shrink-0 flex-wrap bg-elevated/50">
					{filterMode && pagination ? (
						<>
							<button
								type="button"
								onClick={pagination.onPrev}
								disabled={pagination.page <= 1}
								aria-label="Previous page"
								className="px-2 py-1 rounded-md border border-border hover:bg-elevated disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
							>
								<span className="material-symbols-outlined text-base">chevron_left</span>
							</button>
							<div className="flex items-center gap-2">
								<span className="text-xs text-text-secondary">
									Page {pagination.page} / {pagination.totalPages} ({pagination.total} total)
								</span>
								<div className="relative">
									<button
										type="button"
										onClick={() => setPageSizeDropdownOpen(!pageSizeDropdownOpen)}
										className="px-2 py-1 text-xs bg-surface border border-border rounded-md"
									>
										{pageSize}/page
									</button>
									{pageSizeDropdownOpen && (
										<>
											<div
												className="fixed inset-0 z-10"
												onClick={() => setPageSizeDropdownOpen(false)}
												aria-hidden
											/>
											<div className="absolute bottom-full left-0 mb-1 z-20 bg-surface border border-border rounded-lg py-1 shadow-lg">
												{PAGE_SIZE_OPTIONS.map((n) => (
													<button
														key={n}
														type="button"
														onClick={() => {
															onPageSizeChange(n);
															setPageSizeDropdownOpen(false);
														}}
														className="w-full text-left px-3 py-1.5 text-xs hover:bg-elevated"
													>
														{n}
													</button>
												))}
											</div>
										</>
									)}
								</div>
							</div>
							<button
								type="button"
								onClick={pagination.onNext}
								disabled={pagination.page >= pagination.totalPages}
								aria-label="Next page"
								className="px-2 py-1 rounded-md border border-border hover:bg-elevated disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
							>
								<span className="material-symbols-outlined text-base">chevron_right</span>
							</button>
						</>
					) : (
						<div className="flex-1 flex justify-center">
							<div className="relative">
								<button
									type="button"
									onClick={() => setPageSizeDropdownOpen(!pageSizeDropdownOpen)}
									className="px-2 py-1 text-xs bg-surface border border-border rounded-md text-text-secondary"
								>
									{pageSize} per page
								</button>
								{pageSizeDropdownOpen && (
									<>
										<div
											className="fixed inset-0 z-10"
											onClick={() => setPageSizeDropdownOpen(false)}
											aria-hidden
										/>
										<div className="absolute bottom-full left-0 mb-1 z-20 bg-surface border border-border rounded-lg py-1 shadow-lg">
											{PAGE_SIZE_OPTIONS.map((n) => (
												<button
													key={n}
													type="button"
													onClick={() => {
														onPageSizeChange(n);
														setPageSizeDropdownOpen(false);
													}}
													className="w-full text-left px-3 py-1.5 text-xs hover:bg-elevated"
												>
													{n}
												</button>
											))}
										</div>
									</>
								)}
							</div>
						</div>
					)}
				</div>
			)}
		</aside>
	);
}
