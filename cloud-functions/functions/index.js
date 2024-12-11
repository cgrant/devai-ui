// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {logger} = require("firebase-functions");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {auth} = require('google-auth-library');
const {google} = require('googleapis'); // Import googleapis
// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");


initializeApp();



exports.triggerJob = onDocumentCreated("/migrations/{documentId}", async (event) => {
  // Access the parameter `{documentId}` with `event.params`
  logger.log("Running job for: ", event.params.documentId);

  
try {
    const projectId = 'crg-lkummel-01'; 
    const location = 'us-east1'; // e.g., 'us-central1'
    const jobName = 'devai-migration-job'; // TODO: convert this to a variable

    const jobPath = `projects/${projectId}/locations/${location}/jobs/${jobName}`;

    // Authorize the client
    const client = await auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const run = await google.run({version: 'v2', auth: client});

     const documentId = event.params.documentId; 

    const request = {
      name: jobPath,
      requestBody: { 
        overrides: {
          containerOverrides: [
            {
              env: [
                { name: 'DOCUMENT_ID', value: documentId }, // Use DOCUMENT_ID as env variable name
              ],
            },
          ],
        },
      },
    };
    const response = await run.projects.locations.jobs.run(request);

    console.log(`Cloud Run job executed: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error('Error executing Cloud Run job:', error);
  }
});