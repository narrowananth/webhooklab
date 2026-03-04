package fynxt.webhooklab.webhook.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fynxt.common.enums.ErrorCode;
import fynxt.common.http.ApiResponse;
import fynxt.common.http.ResponseBuilder;
import fynxt.webhooklab.webhook.dto.WebhookDto;
import fynxt.webhooklab.webhook.service.WebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Validated
@Tag(name = "Webhooks")
public class WebhookController {

	private final WebhookService webhookService;
	private final ResponseBuilder responseBuilder;

	@PostMapping("/create")
	@Operation(summary = "Create a new webhook")
	public ResponseEntity<ApiResponse<Object>> create(
			@RequestBody(required = false) java.util.Map<String, String> body,
			HttpServletRequest request) {
		String name = body != null ? body.get("name") : null;
		String slug = body != null ? body.get("slug") : null;
		String origin = request.getHeader("Origin");
		if (origin == null) origin = request.getHeader("Referer");
		WebhookDto dto = webhookService.createWithUrl(name, slug, origin);
		return responseBuilder.created(dto, "Webhook created successfully");
	}

	@GetMapping("/by-slug/{slug}")
	@Operation(summary = "Get webhook by slug")
	public ResponseEntity<ApiResponse<Object>> getBySlug(
			@Parameter(required = true) @PathVariable String slug,
			HttpServletRequest request) {
		String origin = request.getHeader("Origin");
		if (origin == null) origin = request.getHeader("Referer");
		return webhookService.getByIdOrSlug(slug, origin)
				.filter(dto -> slug.equals(dto.getSlug()))
				.map(dto -> responseBuilder.get(dto, "Webhook retrieved successfully"))
				.orElseGet(() -> responseBuilder.error(ErrorCode.RESOURCE_NOT_FOUND, "Webhook not found", HttpStatus.NOT_FOUND));
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get webhook by ID or slug")
	public ResponseEntity<ApiResponse<Object>> getById(
			@Parameter(required = true) @PathVariable String id,
			HttpServletRequest request) {
		String origin = request.getHeader("Origin");
		if (origin == null) origin = request.getHeader("Referer");
		return webhookService.getByIdOrSlug(id, origin)
				.map(dto -> responseBuilder.get(dto, "Webhook retrieved successfully"))
				.orElseGet(() -> responseBuilder.error(ErrorCode.RESOURCE_NOT_FOUND, "Webhook not found", HttpStatus.NOT_FOUND));
	}
}
