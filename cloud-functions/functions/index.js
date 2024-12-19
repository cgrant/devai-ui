// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const functions = require("firebase-functions");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { auth } = require('google-auth-library');
const { google } = require('googleapis');
// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const admin = require('firebase-admin');

initializeApp();

const projectId = process.env.PROJECT_ID;
const location = process.env.REGION;
const jobName = process.env.JOB_NAME;

exports.runJobManually = functions.https.onCall(async (data, context) => {
  const migrationId = data.data.migrationId;
  console.log("Data received:", data);
  try {
    const jobPath = `projects/${projectId}/locations/${location}/jobs/${jobName}`;
    const client = await auth.getClient({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const run = await google.run({ version: 'v2', auth: client });
    const documentId = migrationId;

    const request = {
      name: jobPath,
      requestBody: {
        overrides: {
          containerOverrides: [
            {
              env: [
                { name: 'DOCUMENT_ID', value: documentId },
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
  return "Hello from Firebase Function!";
});

exports.updateMigrationStatus = functions.https.onCall(async (payload, context) => {
  try {
    const migrationId = payload.data.migrationId;

    if (!migrationId) {
      throw new functions.https.HttpsError("invalid-argument", "Missing migrationId");
    }

    const migrationRef = admin.firestore().doc(`migrations/${migrationId}`);
    const migrationDoc = await migrationRef.get();

    if (!migrationDoc.exists) {
      return { success: false, message: `Migration with ID ${migrationId} not found.` };
    }

    const migrationData = migrationDoc.data();
    const newStatus = (!migrationData.status || migrationData.status === "incomplete") ? "complete" : "incomplete";

    await migrationRef.update({ status: newStatus });

    return { success: true };
  } catch (error) {
    console.error("Error updating migration status:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    } else {
      throw new functions.https.HttpsError("internal", "Failed to update migration status");
    }
  }
});

exports.triggerJob = onDocumentCreated("/migrations/{documentId}", async (event) => {
  try {
    const jobPath = `projects/${projectId}/locations/${location}/jobs/${jobName}`;
    const client = await auth.getClient({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const run = await google.run({ version: 'v2', auth: client });
    const documentId = event.params.documentId;

    const request = {
      name: jobPath,
      requestBody: {
        overrides: {
          containerOverrides: [
            {
              env: [
                { name: 'DOCUMENT_ID', value: documentId },
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