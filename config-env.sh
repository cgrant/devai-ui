#!/usr/bin/env bash

export PROJECT_ID=$(gcloud config get-value project)
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
export PROJECT_NAME=$(gcloud projects describe $PROJECT_ID --format='value(name)')

export REGION=us-east1
export WEBAPP_NAME=devai-ui
export JOB_NAME=devai-migration-job

gcloud config set project $PROJECT_ID

gcloud auth application-default set-quota-project $PROJECT_ID
gcloud config set billing/quota_project $PROJECT_ID


# Enable APIs
gcloud services enable \
    cloudfunctions.googleapis.com \
    eventarc.googleapis.com \
    firestore.googleapis.com \
    run.googleapis.com \
    storage.googleapis.com \
    secretmanager.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    firebase.googleapis.com \
    firebaseextensions.googleapis.com \
    pubsub.googleapis.com \
    cloudbilling.googleapis.com
