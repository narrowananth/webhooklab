/**
 * Format size and get event size. Re-exports from requestSize for compatibility
 * with imports expecting getEventSize/formatSize from this module.
 */
import { formatSize as formatSizeFn, getRequestSizeBytes } from "./requestSize";

export const getEventSize = getRequestSizeBytes;
export const formatSize = formatSizeFn;
