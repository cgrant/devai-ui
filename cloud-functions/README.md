export PROJECT_ID=crg-lkummel-01



gcloud functions deploy triggerCloudRunJob \
--gen2 \
--runtime=nodejs22 \
--region=us-east1 \
--trigger-location=us-east1 \
--source=. \
--entry-point=triggerCloudRunJob \
--trigger-event-filters=type=google.cloud.firestore.document.v1.written \
--trigger-event-filters=database='(default)' \
--trigger-event-filters-path-pattern=document='users/{username}'