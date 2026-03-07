# LiveFlares

Webhook testing and inspection platform.

## Purpose

LiveFlares helps developers receive, inspect, and debug webhook payloads from external services (Stripe, GitHub, etc.). Create endpoints, capture incoming requests, and view headers, body, and metadata in real time without wiring up your own infra.

## Goal

Make webhook endpoints trivial to create, capture, and inspect—without exposing backend infrastructure. You get instant, shareable URLs for testing integrations and debugging delivery issues.

## How It Works

All webhook URLs live on the frontend domain (e.g. `https://yourapp.com/webhook/xyz`). The frontend proxies incoming requests to the backend; the backend is never exposed directly. Create a webhook, share its URL, and inspect every captured request in the UI.
