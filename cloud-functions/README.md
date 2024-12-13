export PROJECT_ID=$(gcloud config get project)
export REGION=us-east1

gcloud functions deploy triggerCloudRunJob \
--gen2 \
--runtime=nodejs22 \
--region=$REGION \
--trigger-location=$REGION \
--source=. \
--entry-point=triggerCloudRunJob \
--trigger-event-filters=type=google.cloud.firestore.document.v1.written \
--trigger-event-filters=database='(default)' \
--trigger-event-filters-path-pattern=document='migrations/{entry}'
