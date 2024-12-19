#!/usr/bin/env bash

source ../config-env.sh


# Create Firestore database
export DB_EXISTS=$(gcloud firestore databases list | grep -o -w $REGION | wc -w)

if [ "$DB_EXISTS" -eq "0" ]; then
    gcloud firestore databases create --location=$REGION
else
    echo "DB exists"
fi

sed "s/PROJECT_ID/$PROJECT_ID/g" firebaserc.tmpl > .firebaserc

# Deploy Firestore database rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
npm install

echo -e "PROJECT_ID=$PROJECT_ID\nREGION=$REGION\nJOB_NAME=$JOB_NAME" > ./functions/.env

firebase deploy --only functions