package webhooklab.auth.filter;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

public class FaviconFilter extends OncePerRequestFilter {

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		if ("/favicon.ico".equals(request.getRequestURI())) {
			response.setStatus(HttpServletResponse.SC_NO_CONTENT);
			return;
		}
		filterChain.doFilter(request, response);
	}
}
