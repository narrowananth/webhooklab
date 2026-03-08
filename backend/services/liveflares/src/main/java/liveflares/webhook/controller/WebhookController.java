package liveflares.webhook.controller;

import liveflares.common.http.ApiResponse;
import liveflares.common.http.ResponseBuilder;
import liveflares.webhook.dto.WebhookCreateDto;
import liveflares.webhook.service.WebhookService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
@Validated
@Tag(name = "Webhooks")
public class WebhookController {

	private final WebhookService webhookService;
	private final ResponseBuilder responseBuilder;

	@PostMapping("/create")
	@Operation(summary = "Create a new webhook")
	public ResponseEntity<ApiResponse<Object>> create(
			@Parameter(required = true) @RequestBody(required = false) @Validated WebhookCreateDto body,
			HttpServletRequest request) {
		String slug = body != null ? body.getSlug() : null;
		String origin = request.getHeader("Origin");
		if (origin == null) {
			origin = request.getHeader("Referer");
		}
		return responseBuilder.created(
				webhookService.createWithUrl(slug, origin), "Webhook created successfully");
	}

	@GetMapping("/by-slug/{slug}")
	@Operation(summary = "Get webhook by slug")
	public ResponseEntity<ApiResponse<Object>> getBySlug(
			@Parameter(required = true, description = "Webhook slug") @PathVariable String slug,
			HttpServletRequest request) {
		String origin =
				request.getHeader("Origin") != null ? request.getHeader("Origin") : request.getHeader("Referer");
		return responseBuilder.get(webhookService.getBySlug(slug, origin), "Webhook retrieved successfully");
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get webhook by ID or slug")
	public ResponseEntity<ApiResponse<Object>> getById(
			@Parameter(required = true, description = "Webhook ID or slug") @PathVariable String id,
			HttpServletRequest request) {
		String origin =
				request.getHeader("Origin") != null ? request.getHeader("Origin") : request.getHeader("Referer");
		return responseBuilder.get(webhookService.getByIdOrSlug(id, origin), "Webhook retrieved successfully");
	}
}
