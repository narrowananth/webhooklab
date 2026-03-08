-- LiveFlares: webhooks and requests tables (matches Node backend schema)

CREATE TABLE webhooks (
    id BIGSERIAL PRIMARY KEY,
    webhook_id UUID NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_webhooks_slug ON webhooks (slug);

CREATE TABLE requests (
    id BIGSERIAL PRIMARY KEY,
    webhook_id UUID NOT NULL REFERENCES webhooks(webhook_id) ON DELETE CASCADE,
    method VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    headers JSONB NOT NULL DEFAULT '{}',
    query_params JSONB NOT NULL DEFAULT '{}',
    body JSONB,
    raw_body TEXT,
    ip VARCHAR(100),
    status INTEGER DEFAULT 200,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_requests_webhook_id ON requests (webhook_id);
CREATE INDEX idx_requests_created_at ON requests (created_at);
