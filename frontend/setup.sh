#!/usr/bin/env bash

source ../config-env.sh


# Create Firebase Web app and configure .env file

curl -sL https://firebase.tools | upgrade=true bash

firebase login --reauth --no-localhost

export FIREBASE_ENABLED=$(firebase --non-interactive projects:list | grep -o -w $PROJECT_ID | wc -w)
if [ "$FIREBASE_ENABLED" -eq "0" ]; then
  firebase --non-interactive projects:addfirebase $PROJECT_ID
fi

export APP_EXISTS=$(firebase apps:list --project $PROJECT_ID | grep -o -w $WEBAPP_NAME | wc -w)

if [ "$APP_EXISTS" -eq "0" ]; then
  firebase --non-interactive apps:create -P $PROJECT_ID WEB $WEBAPP_NAME
fi

# TODO enable email/pwd provider

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

nvm install 20.18.1

npm install -g envsub
npm install -g node-jq

export API_KEY=$(firebase --non-interactive apps:sdkconfig -P $PROJECT_ID --json | node-jq --raw-output ".result.sdkConfig.apiKey")
export AUTH_DOMAIN=$(firebase --non-interactive apps:sdkconfig -P $PROJECT_ID --json | node-jq --raw-output ".result.sdkConfig.authDomain")
export STORAGE_BUCKET=$(firebase --non-interactive apps:sdkconfig -P $PROJECT_ID --json | node-jq --raw-output ".result.sdkConfig.storageBucket")
export SENDER_ID=$(firebase --non-interactive apps:sdkconfig -P $PROJECT_ID --json | node-jq --raw-output ".result.sdkConfig.messagingSenderId")
export APP_ID=$(firebase --non-interactive apps:sdkconfig -P $PROJECT_ID --json | node-jq --raw-output ".result.sdkConfig.appId")

envsub .env.tmpl .env

rm -rf node_modules

# Build & Deploy Front End React App
gcloud builds submit . \
    --tag gcr.io/$PROJECT_ID/devai-ui \
    --project $PROJECT_ID \
    --region $REGION

gcloud run deploy devai-ui \
    --image gcr.io/$PROJECT_ID/devai-ui \
    --project $PROJECT_ID \
    --platform managed \
    --allow-unauthenticated \
    --region $REGION
