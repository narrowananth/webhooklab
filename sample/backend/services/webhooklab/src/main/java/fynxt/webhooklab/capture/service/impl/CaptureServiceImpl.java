package fynxt.webhooklab.capture.service.impl;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import fynxt.webhooklab.capture.dto.CaptureResponseDto;
import fynxt.webhooklab.capture.service.CaptureService;
import fynxt.webhooklab.webhook.entity.Webhook;
import fynxt.webhooklab.webhook.service.WebhookService;
import fynxt.webhooklab.webhookrequest.entity.WebhookRequest;
import fynxt.webhooklab.webhookrequest.service.WebhookRequestService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CaptureServiceImpl implements CaptureService {

	private final WebhookService webhookService;
	private final WebhookRequestService webhookRequestService;
	private final ObjectMapper objectMapper;

	@Override
	public CaptureResponseDto capture(String webhookId, HttpServletRequest request) {
		var webhookOpt = webhookService.findEntityByWebhookIdOrSlug(webhookId);
		if (webhookOpt.isEmpty()) {
			return CaptureResponseDto.builder()
					.received(false)
					.error("Webhook inbox not found")
					.build();
		}
		Webhook webhook = webhookOpt.get();

		Map<String, String> headers = extractHeaders(request);
		Map<String, String> queryParams = extractQueryParams(request);
		String rawBody;
		Map<String, Object> body;
		try {
			var parsed = parseBody(request);
			rawBody = parsed.rawBody();
			body = parsed.body();
		} catch (IOException e) {
			return CaptureResponseDto.builder()
					.received(false)
					.error("Failed to read request body")
					.build();
		}

		String url = buildFullUrl(request);
		String ip = resolveClientIp(request);

		WebhookRequest saved = webhookRequestService.capture(
				webhook, request.getMethod(), url, headers, queryParams, body, rawBody, ip);

		return CaptureResponseDto.builder()
				.received(true)
				.id(saved.getId())
				.build();
	}

	private Map<String, String> extractHeaders(HttpServletRequest request) {
		Map<String, String> headers = new HashMap<>();
		Collections.list(request.getHeaderNames())
				.forEach(name -> headers.put(name, request.getHeader(name)));
		return headers;
	}

	private Map<String, String> extractQueryParams(HttpServletRequest request) {
		Map<String, String> queryParams = new HashMap<>();
		String queryString = request.getQueryString();
		if (queryString == null) {
			return queryParams;
		}
		for (String pair : queryString.split("&")) {
			int eq = pair.indexOf('=');
			if (eq >= 0) {
				queryParams.put(
						java.net.URLDecoder.decode(pair.substring(0, eq), StandardCharsets.UTF_8),
						java.net.URLDecoder.decode(pair.substring(eq + 1), StandardCharsets.UTF_8));
			}
		}
		return queryParams;
	}

	private record BodyParseResult(String rawBody, Map<String, Object> body) {}

	private BodyParseResult parseBody(HttpServletRequest request) throws IOException {
		byte[] bodyBytes = request.getInputStream().readAllBytes();
		if (bodyBytes.length == 0) {
			return new BodyParseResult(null, null);
		}
		String rawBody = new String(bodyBytes, StandardCharsets.UTF_8);
		Map<String, Object> body = null;
		try {
			body = objectMapper.readValue(rawBody, new TypeReference<Map<String, Object>>() {});
		} catch (Exception e) {
			// leave body null for non-JSON payloads
		}
		return new BodyParseResult(rawBody, body);
	}

	private String buildFullUrl(HttpServletRequest request) {
		String url = request.getRequestURL().toString();
		if (request.getQueryString() != null) {
			url += "?" + request.getQueryString();
		}
		return url;
	}

	private String resolveClientIp(HttpServletRequest request) {
		String forwarded = request.getHeader("X-Forwarded-For");
		if (forwarded != null && !forwarded.isBlank()) {
			return forwarded.split(",")[0].trim();
		}
		return request.getRemoteAddr();
	}
}
