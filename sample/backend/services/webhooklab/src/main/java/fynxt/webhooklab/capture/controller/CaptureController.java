package fynxt.webhooklab.capture.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import fynxt.webhooklab.capture.dto.CaptureResponseDto;
import fynxt.webhooklab.capture.service.CaptureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "Capture")
public class CaptureController {

	private final CaptureService captureService;

	@RequestMapping(
			value = "/webhook/{webhookId}",
			method = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE,
					RequestMethod.PATCH, RequestMethod.HEAD, RequestMethod.OPTIONS })
	@Operation(summary = "Capture an incoming webhook request (any HTTP method)")
	public ResponseEntity<CaptureResponseDto> capture(
			@Parameter(required = true, description = "Webhook ID or slug") @PathVariable String webhookId,
			HttpServletRequest request) {
		CaptureResponseDto result = captureService.capture(webhookId, request);
		if (result.getError() != null) {
			return ResponseEntity.status(404)
					.contentType(MediaType.APPLICATION_JSON)
					.body(result);
		}
		return ResponseEntity.ok()
				.contentType(MediaType.APPLICATION_JSON)
				.body(result);
	}
}
