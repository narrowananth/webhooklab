package liveflares.capture.controller;

import liveflares.capture.service.CaptureService;
import liveflares.common.http.ApiResponse;
import liveflares.common.http.ResponseBuilder;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/webhook")
@RequiredArgsConstructor
@Validated
@Tag(name = "Capture")
public class CaptureController {

	private final CaptureService captureService;
	private final ResponseBuilder responseBuilder;

	@RequestMapping(
			value = "/{webhookId}",
			method = {
				RequestMethod.GET,
				RequestMethod.POST,
				RequestMethod.PUT,
				RequestMethod.DELETE,
				RequestMethod.PATCH,
				RequestMethod.HEAD,
				RequestMethod.OPTIONS
			})
	@Operation(summary = "Capture an incoming webhook request (any HTTP method)")
	public ResponseEntity<ApiResponse<Object>> capture(
			@Parameter(required = true, description = "Webhook ID or slug") @PathVariable String webhookId,
			HttpServletRequest request) {
		return responseBuilder.get(captureService.capture(webhookId, request), "Captured");
	}
}
