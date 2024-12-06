#!/bin/bash

# Set Project ID & region
export PROJECT_ID=$(gcloud config get project)
export REGION=us-east1

# Enable APIs
gcloud services enable \
    cloudfunctions.googleapis.com \
    eventarc.googleapis.com \
    firestore.googleapis.com \
    run.googleapis.com \
    storage.googleapis.com


# Build & Deploy Front End React App
gcloud builds submit ./frontend --tag gcr.io/$PROJECT_ID/devai-ui --project $PROJECT_ID

gcloud run deploy devai-ui --image gcr.io/$PROJECT_ID/devai-ui --project $PROJECT_ID --platform managed --allow-unauthenticated


# Deploy Backend Cloud Run Job
gcloud run jobs deploy devai-migration-job \
    --source ./backend-job \
    --tasks 50 \
    --set-env-vars SLEEP_MS=10000 \
    --set-env-vars FAIL_RATE=0.1 \
    --max-retries 5 \
    --region $REGION \
    --project=$PROJECT_ID \
    --quiet

#Create Firestore DB
gcloud firestore databases create --location=$REGION

# Deploy Cloud Function
gcloud functions deploy triggerCloudRunJob \
--gen2 \
--runtime=nodejs22 \
--region=$REGION \
--trigger-location=$REGION \
--source=./cloud-functions \
--entry-point=triggerCloudRunJob \
--trigger-event-filters=type=google.cloud.firestore.document.v1.written \
--trigger-event-filters=database='(default)' \
--trigger-event-filters-path-pattern=document='migrations/{entry}'

