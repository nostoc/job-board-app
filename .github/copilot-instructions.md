# Copilot Instructions for Job Board App

## Project At A Glance
- This repository is a microservices-based job board platform.
- Core flow: `application-service` orchestrates a Saga across `jobs-service` and `payment-service`.
- Services and stack:
  - `services/jobs-service`: Node.js + Express + PostgreSQL (`jobs_db`)
  - `services/application-service`: Node.js + Express + PostgreSQL (`applications_db`), Saga orchestrator
  - `services/payment-service`: Node.js + Express + PostgreSQL (`payments_db`), simulated charge outcomes
  - `services/notification-service`: NestJS + RabbitMQ + PostgreSQL (notification log)
  - `services/user-service`: Go + gRPC + Zitadel (multi-tenant auth)
- Kubernetes manifests are in `k8s-manifests/`.

## Architecture And Boundaries
- Keep database-per-service isolation intact; do not couple one service directly to another service database.
- Preserve Saga semantics in `application-service`:
  - create draft job
  - process payment
  - publish job on success
  - compensate (delete draft) on payment failure
- Preserve API compatibility of existing internal routes used by orchestration:
  - Jobs: `POST /api/v1/jobs`, `PUT /api/v1/jobs/:id/publish`, `DELETE /api/v1/jobs/:id`
  - Payments: `POST /api/v1/payments/charge`
  - Application orchestrator: `POST /api/v1/application/post-job`
- Notification service consumes RabbitMQ events; keep event-driven decoupling and avoid direct sync calls to other services.

## How To Work In This Repo
- There is no single root build script. Work per service directory.
- Node services (`jobs-service`, `application-service`, `payment-service`):
  - install deps: `npm install`
  - run: `node index.js`
- Notification service:
  - install deps: `npm install`
  - run dev: `npm run start:dev`
  - test: `npm test`
  - lint: `npm run lint`
- User service (Go):
  - run: `go run ./cmd/main.go -domain <zitadel-domain> -key <path-to-key.json> -port 8089`
- Kubernetes:
  - apply manifests from `k8s-manifests/`
  - prefer incremental changes to one manifest at a time and validate with `kubectl get pods`/`kubectl describe`.

## Editing Guidelines For Agents
- Make minimal, focused changes within the target service.
- Prefer preserving existing endpoint contracts and payload shapes unless explicitly asked to version/change APIs.
- When changing cross-service behavior, update both:
  - orchestrator logic in `services/application-service/index.js`
  - impacted downstream service handlers and related docs
- For notification/event changes, update producer and consumer assumptions together.
- Avoid broad refactors across all services in one change.

## Validation Expectations
- For Node services, at minimum run startup locally after change (`node index.js` or service script) and check health endpoint where available.
- For `notification-service`, run focused tests/lint for touched files when possible.
- For `user-service`, ensure `go run` still compiles with required flags and interceptor chain remains tenant-first then auth.
- If editing manifests, validate YAML and check resource readiness in cluster.

## Key References
- Service docs:
  - [services/jobs-service/README.md](../services/jobs-service/README.md)
  - [services/application-service/README.md](../services/application-service/README.md)
  - [services/payment-service/README.md](../services/payment-service/README.md)
  - [services/notification-service/README.md](../services/notification-service/README.md)
  - [services/user-service/README.md](../services/user-service/README.md)
- Kubernetes docs:
  - [k8s-manifests/README.md](../k8s-manifests/README.md)
- CI pipeline:
  - [.github/workflows/ci.yml](./workflows/ci.yml)
