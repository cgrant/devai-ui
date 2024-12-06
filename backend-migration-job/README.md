# Migration job


#### Create new GitHub application
Create and register a Github app using these [steps](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app).

Grant following repository permissions to the new application:

- Commit statuses (read only)
- Contents (read and write)
- Issues (read and write)
- Metadata (read only)
- Pull requests (read and write)

#### Grant access to the repository
Use the [GitHub  App settings](https://github.com/settings/installations) to grant access to the repository.

#### Generate new private key for the application

Open [GitHub Apps](https://github.com/settings/apps) and generate a private key for your application.



Set env vars - replace values with GitHub app/installation details
```
export GITHUB_APP_ID=1111111111
export GITHUB_APP_INSTALLATION_ID=222222222
```

Create secrets
```
echo -n $GITHUB_APP_ID | \
 gcloud secrets create GITHUB_APP_ID \
 --data-file=-

echo -n $GITHUB_APP_INSTALLATION_ID | \
 gcloud secrets create GITHUB_APP_INSTALLATION_ID \
 --data-file=-

gcloud secrets create GITHUB_APP_PRIVATE_KEY --data-file="/path/to/github.app.private-key.pem"
```

Set GCP env vars
```
export PROJECT_ID=YOUR_GCP_PROJECT
export REGION=us-east1
export JOB_NAME=devai-migration-job
```

Create service account
```
gcloud iam service-accounts create $JOB_NAME --project $PROJECT_ID --display-name $JOB_NAME
```

Grant Secret Manager role
```
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$JOB_NAME@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --condition='None'
```

Deploy job
```
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
```

Sample arguments:
- WORKFLOW_STEP - workflow step
- GITHUB_ACCOUNT - GitHub org or userid
- REPO_NAME - GitHub repository name

Execute job using curl
```
curl -H "Content-Type: application/json" \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -X POST \
    --data-raw '{"overrides": {"containerOverrides": [{ "env": [{"name": "WORKFLOW_STEP", "value": "parse_dependencies"}, {"name": "GITHUB_ACCOUNT", "value": "gitrey"},{"name": "REPO_NAME", "value": "mig-test"}], "clearArgs": "FALSE"}]}}' \
    https://$REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/$PROJECT_ID/jobs/$JOB_NAME:run
```
