#!/usr/bin/env bash

source ../config-env.sh

# Deploy Backend Cloud Run Job
gcloud run jobs deploy devai-migration-job \
    --source . \
    --tasks 50 \
    --set-env-vars SLEEP_MS=10000 \
    --set-env-vars FAIL_RATE=0.1 \
    --max-retries 5 \
    --region $REGION \
    --project=$PROJECT_ID \
    --quiet
