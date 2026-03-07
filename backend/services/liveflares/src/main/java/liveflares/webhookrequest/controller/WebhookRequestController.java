package liveflares.webhookrequest.controller;

import liveflares.common.enums.ErrorCode;
import liveflares.common.http.ApiResponse;
import liveflares.common.http.PaginationUtils;
import liveflares.common.http.ResponseBuilder;
import liveflares.webhookrequest.dto.ReplayRequestDto;
import liveflares.webhookrequest.service.WebhookRequestService;

import java.util.Set;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/events")
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
			@Parameter(required = true) @RequestBody @Validated ReplayRequestDto body) {
		return responseBuilder.updated(webhookRequestService.replay(eventId, body.getTargetUrl()), "Replay completed");
	}

	@GetMapping("/{inboxId}/stats")
	@Operation(summary = "Get event stats for an inbox")
	public ResponseEntity<ApiResponse<Object>> stats(@Parameter(required = true) @PathVariable String inboxId) {
		return responseBuilder.get(webhookRequestService.getStats(inboxId), "Stats retrieved successfully");
	}

	@DeleteMapping("/{inboxId}")
	@Operation(summary = "Clear all events for an inbox")
	public ResponseEntity<ApiResponse<Object>> clear(@Parameter(required = true) @PathVariable String inboxId) {
		webhookRequestService.clearEvents(inboxId);
		return responseBuilder.deleted("Events cleared successfully");
	}

	@GetMapping("/{inboxId}")
	@Operation(summary = "List events for an inbox")
	public ResponseEntity<ApiResponse<Object>> list(
			@Parameter(required = true) @PathVariable String inboxId,
			@Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
			@Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
			@Parameter(description = "Filter by HTTP method") @RequestParam(required = false) String method,
			@Parameter(description = "Filter by status band: 2xx, 4xx, 5xx") @RequestParam(required = false)
					String status,
			@Parameter(description = "Filter by IP (substring)") @RequestParam(required = false) String ip,
			@Parameter(description = "Filter by request/event ID") @RequestParam(required = false) Long requestId) {
		if (status != null && !status.isBlank() && !Set.of("2xx", "4xx", "5xx").contains(status)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST.getCode());
		}
		return responseBuilder.paginated(
				webhookRequestService.listEvents(
						inboxId, PaginationUtils.toPageable(page, size), method, status, ip, requestId),
				"Events retrieved successfully");
	}

	@GetMapping("/{inboxId}/{eventId}")
	@Operation(summary = "Get a single event by inbox and event ID")
	public ResponseEntity<ApiResponse<Object>> getOne(
			@Parameter(required = true) @PathVariable String inboxId,
			@Parameter(required = true) @PathVariable Long eventId) {
		return responseBuilder.get(webhookRequestService.getEvent(inboxId, eventId), "Event retrieved successfully");
	}
}
