#!/bin/bash

# Set Project ID & region
export PROJECT_ID=$(gcloud config get project)
export REGION=us-east1
export JOB_NAME=devai-migration-job

# Enable APIs
gcloud services enable \
    run.googleapis.com \
    secretmanager.googleapis.com

# Set env vars - replace values with GitHub app/installation details
export GITHUB_APP_ID=1111111111
export GITHUB_APP_INSTALLATION_ID=222222222

# Create secrets
echo -n $GITHUB_APP_ID | \
 gcloud secrets create GITHUB_APP_ID \
 --data-file=-

echo -n $GITHUB_APP_INSTALLATION_ID | \
 gcloud secrets create GITHUB_APP_INSTALLATION_ID \
 --data-file=-

gcloud secrets create GITHUB_APP_PRIVATE_KEY --data-file="/path/to/github.app.private-key.pem"

# Create service account
gcloud iam service-accounts create $JOB_NAME --project $PROJECT_ID --display-name $JOB_NAME

# Grant Secret Manager role
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$JOB_NAME@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --condition='None'

# Deploy job
gcloud run jobs deploy $JOB_NAME \
    --source . \
    --tasks 1 \
    --max-retries 2 \
    --region $REGION \
    --project=$PROJECT_ID \
    --set-secrets="GITHUB_APP_PRIVATE_KEY=GITHUB_APP_PRIVATE_KEY:latest" \
    --set-secrets="GITHUB_APP_ID=GITHUB_APP_ID:latest" \
    --set-secrets="GITHUB_APP_INSTALLATION_ID=GITHUB_APP_INSTALLATION_ID:latest" \
    --service-account $JOB_NAME@$PROJECT_ID.iam.gserviceaccount.com
