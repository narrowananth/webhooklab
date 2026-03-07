const METHOD_BADGE_STYLES: Record<string, { bg: string; fg: string }> = {
	GET: { bg: "var(--wl-method-get-bg)", fg: "var(--wl-method-get-fg)" },
	HEAD: { bg: "var(--wl-method-head-bg)", fg: "var(--wl-method-head-fg)" },
	POST: { bg: "var(--wl-method-post-bg)", fg: "var(--wl-method-post-fg)" },
	PUT: { bg: "var(--wl-method-put-bg)", fg: "var(--wl-method-put-fg)" },
	PATCH: { bg: "var(--wl-method-patch-bg)", fg: "var(--wl-method-patch-fg)" },
	DELETE: { bg: "var(--wl-method-delete-bg)", fg: "var(--wl-method-delete-fg)" },
	OPTIONS: { bg: "var(--wl-method-options-bg)", fg: "var(--wl-method-options-fg)" },
};

export const BADGE_STYLE_GRAY = {
	bg: "var(--wl-method-gray-bg)",
	fg: "var(--wl-method-gray-fg)",
};

export function getMethodBadgeStyle(method: string): { bg: string; fg: string } {
	return METHOD_BADGE_STYLES[method.toUpperCase()] ?? BADGE_STYLE_GRAY;
}
