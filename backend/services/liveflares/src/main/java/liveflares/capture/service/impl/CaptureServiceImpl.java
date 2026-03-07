package liveflares.capture.service.impl;

import liveflares.capture.dto.CaptureResponseDto;
import liveflares.capture.service.CaptureService;
import liveflares.common.enums.ErrorCode;
import liveflares.webhook.entity.Webhook;
import liveflares.webhook.service.WebhookService;
import liveflares.webhookrequest.dto.EventStatsDto;
import liveflares.webhookrequest.entity.WebhookRequest;
import liveflares.webhookrequest.service.WebhookRequestService;
import liveflares.webhookrequest.service.mappers.WebhookRequestMapper;
import liveflares.websocket.WebSocketBroadcastService;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CaptureServiceImpl implements CaptureService {

	private final WebhookService webhookService;
	private final WebhookRequestService webhookRequestService;
	private final WebhookRequestMapper webhookRequestMapper;
	private final ObjectMapper objectMapper;
	private final WebSocketBroadcastService webSocketBroadcastService;

	@Override
	public CaptureResponseDto capture(String webhookId, HttpServletRequest request) {
		Webhook webhook = webhookService
				.findEntityByWebhookIdOrSlug(webhookId)
				.orElseThrow(() ->
						new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND.getCode()));

		Map<String, String> headers = extractHeaders(request);
		Map<String, String> queryParams = extractQueryParams(request);
		String rawBody;
		Map<String, Object> body;
		try {
			var parsed = parseBody(request);
			rawBody = parsed.rawBody();
			body = parsed.body();
		} catch (IOException e) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ErrorCode.MISSING_REQUIRED_PARAMETER.getCode());
		}

		String url = buildFullUrl(request);
		String ip = resolveClientIp(request);

		WebhookRequest saved = webhookRequestService.capture(
				webhook, request.getMethod(), url, headers, queryParams, body, rawBody, ip);

		String payload = buildEventNewPayload(saved, webhook);
		if (payload != null) {
			webSocketBroadcastService.broadcast(webhook.getWebhookId().toString(), payload);
			if (webhook.getSlug() != null && !webhook.getSlug().isBlank()) {
				webSocketBroadcastService.broadcast(webhook.getSlug(), payload);
			}
		}

		return CaptureResponseDto.builder().received(true).build();
	}

	private Map<String, String> extractHeaders(HttpServletRequest request) {
		Map<String, String> headers = new HashMap<>();
		Collections.list(request.getHeaderNames()).forEach(name -> headers.put(name, request.getHeader(name)));
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
						URLDecoder.decode(pair.substring(0, eq), StandardCharsets.UTF_8),
						URLDecoder.decode(pair.substring(eq + 1), StandardCharsets.UTF_8));
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

	private String buildEventNewPayload(WebhookRequest r, Webhook webhook) {
		EventStatsDto stats = null;
		try {
			stats = webhookRequestService.getStats(webhook.getWebhookId().toString());
		} catch (Exception e) {
			// omit stats on failure; frontend can use API
		}
		var dto = webhookRequestMapper.toEventNewMessageDto(r, stats);
		try {
			return objectMapper.writeValueAsString(dto);
		} catch (JsonProcessingException e) {
			return null;
		}
	}
}
