package webhooklab.auth.filter;

import java.io.IOException;
import java.util.UUID;

import jakarta.annotation.Nonnull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

public class CorrelationIdWebFilter extends OncePerRequestFilter {

	private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

	@Override
	protected void doFilterInternal(
			@Nonnull HttpServletRequest request,
			@Nonnull HttpServletResponse response,
			@Nonnull FilterChain filterChain)
			throws ServletException, IOException {

		String correlationId = request.getHeader(CORRELATION_ID_HEADER);

		if (correlationId == null || correlationId.isEmpty()) {
			correlationId = UUID.randomUUID().toString();
		}

		response.setHeader(CORRELATION_ID_HEADER, correlationId);

		request.setAttribute(CORRELATION_ID_HEADER, correlationId);

		filterChain.doFilter(request, response);
	}
}
