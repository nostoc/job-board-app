---
name: saga-change-checklist
description: "Use when changing Saga orchestration in application-service: validates downstream jobs/payment endpoint contracts, compensation behavior, and required cross-service updates."
argument-hint: "What orchestrator or Saga step changed?"
user-invocable: true
---

# Saga Change Checklist

Use this skill when any change touches the job-posting Saga flow, especially [services/application-service/index.js](../../../services/application-service/index.js).

## Outcome
- Prevent broken distributed transactions by enforcing contract compatibility and rollback safety.
- Ensure orchestrator changes are validated against downstream Jobs and Payment behaviors.
- Ensure docs and verification steps are updated together with code.

## Trigger Conditions
Run this checklist if any of the following changes occur:
- `services/application-service/index.js` orchestration logic or error handling changed.
- Saga states, status values, or response shapes changed.
- Jobs or Payment internal endpoints used by the orchestrator changed.
- Event publication/notification behavior around Saga success/failure changed.

## Contracts That Must Stay Compatible
- Jobs Service:
  - `POST /api/v1/jobs`
  - `PUT /api/v1/jobs/:id/publish`
  - `DELETE /api/v1/jobs/:id`
- Payment Service:
  - `POST /api/v1/payments/charge`
- Orchestrator public entry:
  - `POST /api/v1/application/post-job`

## Procedure
1. Identify impacted Saga step(s).
- Map each edit to a Saga phase: initialize, draft creation, payment, publish, compensation, terminal failure.
- Confirm whether the change affects request payloads, response handling, or state transitions.

2. Validate downstream endpoint alignment.
- Cross-check orchestrator calls against downstream handlers:
  - [services/jobs-service/index.js](../../../services/jobs-service/index.js)
  - [services/payment-service/index.js](../../../services/payment-service/index.js)
- Verify method, path, payload fields, and expected status codes still align.
- If alignment changed, update both producer and consumer code in the same change.

3. Validate compensation behavior.
- Confirm payment-failure path still triggers draft deletion (`DELETE /api/v1/jobs/:id`).
- Confirm rollback success updates Saga state to a rollback terminal state.
- Confirm rollback failure is surfaced as a critical system error path.

4. Validate Saga state model consistency.
- Confirm inserted and updated state values remain coherent and reachable.
- Ensure no branch leaves Saga state unset or contradictory to HTTP response semantics.
- Ensure successful flow marks final publish/completed state.

5. Validate response and error semantics.
- Success branch should return publish success and include consistent status metadata.
- Payment failure branch should return payment-failure semantics (currently `402`) and rollback result.
- Unexpected failure branch should return system-level failure semantics and preserve diagnostics.

6. Validate cross-service side effects.
- If a new event is emitted on success/failure, verify consumer assumptions in notification service.
- Keep event-driven decoupling; do not add direct synchronous coupling from notification service.

7. Update docs and references in the same PR.
- Update service README(s) where contract/behavior changed:
  - [services/application-service/README.md](../../../services/application-service/README.md)
  - [services/jobs-service/README.md](../../../services/jobs-service/README.md)
  - [services/payment-service/README.md](../../../services/payment-service/README.md)
  - [services/notification-service/README.md](../../../services/notification-service/README.md)

8. Run minimum verification.
- Node services touched: install dependencies and start service (`npm install`, `node index.js`).
- Notification service touched: run focused checks (`npm run lint`, `npm test`).
- If manifests changed: validate apply/readiness from [k8s-manifests/README.md](../../../k8s-manifests/README.md).

## Decision Branches
- If only orchestrator changed and downstream contracts did not:
  - Verify all existing downstream status-code and payload assumptions still hold.
- If downstream endpoint/payload changed:
  - Update orchestrator call sites and service README examples in the same change.
- If compensation logic changed:
  - Treat as high risk; explicitly verify rollback trigger, rollback success state, and rollback failure path.
- If new Saga state(s) introduced:
  - Ensure all branches can transition to terminal states and documentation reflects new state graph.

## Completion Criteria
- All touched Saga paths have validated endpoint and status-code compatibility.
- Compensation behavior is preserved or intentionally changed with matching downstream support.
- No orphaned or contradictory Saga states remain.
- Relevant service docs are updated where behavior/contracts changed.
- Minimum local verification commands have been run for touched services.

## Common Failure Patterns To Catch
- Orchestrator expects `402` payment failure but payment service returns a different status.
- Rollback API path or HTTP method drift between orchestrator and jobs service.
- Success response sent before publish step completes.
- New state added in one branch but not reflected in failure/success transitions.
- Notification assumptions changed without event payload alignment.
