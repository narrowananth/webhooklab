/**
 * Format size and get event size. Re-exports from requestSize for compatibility
 * with imports expecting getEventSize/formatSize from this module.
 */
import { getRequestSizeBytes, formatSize as formatSizeFn } from "./requestSize";

export const getEventSize = getRequestSizeBytes;
export const formatSize = formatSizeFn;
