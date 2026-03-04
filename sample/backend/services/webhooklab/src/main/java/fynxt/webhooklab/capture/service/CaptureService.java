package fynxt.webhooklab.capture.service;

import fynxt.webhooklab.capture.dto.CaptureResponseDto;

import jakarta.servlet.http.HttpServletRequest;

public interface CaptureService {

	CaptureResponseDto capture(String webhookId, HttpServletRequest request);
}
