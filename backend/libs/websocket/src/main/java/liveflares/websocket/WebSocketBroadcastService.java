package liveflares.websocket;

import org.springframework.stereotype.Service;

@Service
public class WebSocketBroadcastService {

	private final WebSocketSessionStore sessionStore;

	public WebSocketBroadcastService(WebSocketSessionStore sessionStore) {
		this.sessionStore = sessionStore;
	}

	public void broadcast(String webhookId, String payload) {
		if (webhookId == null || webhookId.isBlank()) return;
		sessionStore.sendToWebhookId(webhookId, payload);
	}
}
