---
description: "Use when editing Kubernetes service deployment manifests in k8s-manifests to enforce readiness probes, resource requests, and rollout validation."
name: "K8s Service Deploy Guard"
applyTo: "k8s-manifests/*-service.yaml"
---

# Kubernetes Service Deploy Guard

Apply this checklist whenever a file under [k8s-manifests](../../k8s-manifests/README.md) matching `*-service.yaml` is changed.

## Guardrails
- Keep changes incremental and focused to the target service manifest.
- Preserve existing labels/selectors and service names unless explicitly requested.
- Avoid changing unrelated manifests in the same task.

## Deployment Requirements
For each container in the Deployment spec:
- Add or keep a `readinessProbe` suitable for the app protocol (HTTP, TCP, or exec).
- Add `resources.requests` with at least:
  - `cpu`
  - `memory`
- Prefer setting `resources.limits` as well; if omitted, document why.
- Ensure container `ports` and Service `targetPort` stay aligned.

## Probe Guidance
- Prefer `httpGet` probes for HTTP services with a stable endpoint (for example `/health`).
- Set realistic timings to avoid restart loops:
  - `initialDelaySeconds`
  - `periodSeconds`
  - `timeoutSeconds`
  - `failureThreshold`
- If startup is slow, add `startupProbe` to protect liveness/readiness from premature failure.

## Rollout Validation (Required After Manifest Edits)
Run the following checks after applying changed manifests:
1. `kubectl apply -f <manifest>`
2. `kubectl rollout status deployment/<deployment-name>`
3. `kubectl get pods -o wide`
4. `kubectl describe deployment <deployment-name>`

Then verify:
- Pods become `Ready`.
- No probe failures are reported in recent events.
- Requested resources are present in the pod template.

## Failure Handling
If rollout fails:
- Capture key events from `kubectl describe deployment <deployment-name>`.
- Fix probe/resource misconfiguration first.
- Re-apply and re-run rollout checks before finalizing.

## References
- Platform-specific guidance: [k8s-manifests/README.md](../../k8s-manifests/README.md)
- Repository-wide agent guidance: [.github/copilot-instructions.md](../copilot-instructions.md)
