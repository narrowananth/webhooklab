/**
 * Shared constants for WebhookLab UI.
 * Method badge colors use theme-aware CSS variables.
 */
export const METHOD_COLORS: Record<string, string> = {
	GET: "green",
	POST: "blue",
	PUT: "orange",
	PATCH: "yellow",
	DELETE: "red",
};

/** CSS variable names for method badge bg/fg (theme-aware) */
export const METHOD_BADGE_STYLES: Record<string, { bg: string; fg: string }> = {
	GET: { bg: "var(--wl-method-get-bg)", fg: "var(--wl-method-get-fg)" },
	POST: { bg: "var(--wl-method-post-bg)", fg: "var(--wl-method-post-fg)" },
	PUT: { bg: "var(--wl-method-put-bg)", fg: "var(--wl-method-put-fg)" },
	PATCH: { bg: "var(--wl-method-patch-bg)", fg: "var(--wl-method-patch-fg)" },
	DELETE: { bg: "var(--wl-method-delete-bg)", fg: "var(--wl-method-delete-fg)" },
};

export const BADGE_STYLE_GRAY = { bg: "var(--wl-method-gray-bg)", fg: "var(--wl-method-gray-fg)" };
