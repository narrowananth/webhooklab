package liveflares.common.http;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

public final class PaginationUtils {

	public static final int DEFAULT_PAGE = 1;
	public static final int DEFAULT_SIZE = 20;
	public static final int MAX_SIZE = 100;

	private PaginationUtils() {}

	public static Pageable toPageable(int pageOneBased, int size) {
		int safePage = Math.max(1, pageOneBased);
		int safeSize = Math.min(MAX_SIZE, Math.max(1, size));
		return PageRequest.of(safePage - 1, safeSize);
	}
}
