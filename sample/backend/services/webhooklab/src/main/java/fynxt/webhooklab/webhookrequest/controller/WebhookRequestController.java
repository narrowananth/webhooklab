package fynxt.webhooklab.webhookrequest.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import fynxt.common.enums.ErrorCode;
import fynxt.common.http.ApiResponse;
import fynxt.common.http.ResponseBuilder;
import fynxt.webhooklab.webhookrequest.service.WebhookRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Validated
@Tag(name = "Events")
public class WebhookRequestController {

	private final WebhookRequestService webhookRequestService;
	private final ResponseBuilder responseBuilder;

	@PostMapping("/{eventId}/replay")
	@Operation(summary = "Replay an event to a target URL")
	public ResponseEntity<ApiResponse<Object>> replay(
			@Parameter(required = true) @PathVariable Long eventId,
			@RequestBody(required = false) java.util.Map<String, String> body) {
		String targetUrl = body != null ? body.get("targetUrl") : null;
		if (targetUrl == null || targetUrl.isBlank()) {
			return responseBuilder.error(ErrorCode.MISSING_REQUIRED_PARAMETER, "targetUrl is required", HttpStatus.BAD_REQUEST);
		}
		return webhookRequestService.replay(eventId, targetUrl)
				.map(result -> responseBuilder.updated(result, "Replay completed"))
				.orElseGet(() -> responseBuilder.error(ErrorCode.RESOURCE_NOT_FOUND, "Event not found", HttpStatus.NOT_FOUND));
	}

	@GetMapping("/{inboxId}/stats")
	@Operation(summary = "Get event stats for an inbox")
	public ResponseEntity<ApiResponse<Object>> stats(
			@Parameter(required = true) @PathVariable String inboxId) {
		return webhookRequestService.getStats(inboxId)
				.map(stats -> responseBuilder.get(stats, "Stats retrieved successfully"))
				.orElseGet(() -> responseBuilder.error(ErrorCode.RESOURCE_NOT_FOUND, "Webhook inbox not found", HttpStatus.NOT_FOUND));
	}

	@DeleteMapping("/{inboxId}")
	@Operation(summary = "Clear all events for an inbox")
	public ResponseEntity<ApiResponse<Object>> clear(
			@Parameter(required = true) @PathVariable String inboxId) {
		boolean cleared = webhookRequestService.clearEvents(inboxId);
		if (!cleared) {
			return responseBuilder.error(ErrorCode.RESOURCE_NOT_FOUND, "Webhook inbox not found", HttpStatus.NOT_FOUND);
		}
		return responseBuilder.deleted("Events cleared successfully");
	}

	@GetMapping("/{inboxId}")
	@Operation(summary = "List events for an inbox")
	public ResponseEntity<ApiResponse<Object>> list(
			@Parameter(required = true) @PathVariable String inboxId,
			@Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
			@Parameter(description = "Page size (1-100)") @RequestParam(defaultValue = "20") int limit) {
		return webhookRequestService.listEvents(inboxId, page, limit)
				.map(result -> responseBuilder.get(result, "Events retrieved successfully"))
				.orElseGet(() -> responseBuilder.error(ErrorCode.RESOURCE_NOT_FOUND, "Webhook inbox not found", HttpStatus.NOT_FOUND));
	}

	@GetMapping("/{inboxId}/{eventId}")
	@Operation(summary = "Get a single event by inbox and event ID")
	public ResponseEntity<ApiResponse<Object>> getOne(
			@Parameter(required = true) @PathVariable String inboxId,
			@Parameter(required = true) @PathVariable Long eventId) {
		return webhookRequestService.getEvent(inboxId, eventId)
				.map(dto -> responseBuilder.get(dto, "Event retrieved successfully"))
				.orElseGet(() -> responseBuilder.error(ErrorCode.RESOURCE_NOT_FOUND, "Event not found", HttpStatus.NOT_FOUND));
	}
}
