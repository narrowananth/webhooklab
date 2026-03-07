package webhooklab.websocket;

import org.springframework.web.socket.WebSocketSession;

public interface WebhookStatsSnapshotSender {

	void sendToSession(WebSocketSession session, String webhookId);
}
