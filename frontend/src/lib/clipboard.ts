export async function copyToClipboard(text: string): Promise<void> {
	if (typeof text !== "string") throw new Error("Nothing to copy");
	const trimmed = text.trim();
	if (!trimmed) throw new Error("Nothing to copy");

	if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(trimmed);
			return;
		} catch {
			// fallback
		}
	}

	const textarea = document.createElement("textarea");
	textarea.value = trimmed;
	textarea.setAttribute("readonly", "");
	textarea.style.position = "fixed";
	textarea.style.top = "-9999px";
	textarea.style.left = "-9999px";
	document.body.appendChild(textarea);
	textarea.focus();
	textarea.select();
	try {
		const ok = document.execCommand("copy");
		if (!ok) throw new Error("Copy failed");
	} finally {
		document.body.removeChild(textarea);
	}
}
