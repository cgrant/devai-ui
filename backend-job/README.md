# README

## Quickstart

```
gcloud run jobs deploy devai-migration-job \
    --source . \
    --tasks 50 \
    --set-env-vars SLEEP_MS=10000 \
    --set-env-vars FAIL_RATE=0.1 \
    --max-retries 5 \
    --region us-east1 \
    --project=$PROJECT_ID



gcloud run jobs execute devai-migration-job \
    --region us-east1
```