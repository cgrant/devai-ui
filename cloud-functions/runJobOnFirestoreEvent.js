const {auth} = require('google-auth-library');
const {google} = require('googleapis'); // Import googleapis
exports.triggerCloudRunJob = async (data, context) => {
  try {
    const projectId = `${projectId}`; 
    const location = 'us-east1'; // e.g., 'us-central1'
    const jobName = 'devai-migration-job'; // TODO: convert this to a variable

    const jobPath = `projects/${projectId}/locations/${location}/jobs/${jobName}`;

    // Authorize the client
    const client = await auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const run = await google.run({version: 'v2', auth: client});

    // Execute the Cloud Run job
    const request = {
      name: jobPath,
    };
    const response = await run.projects.locations.jobs.run(request);

    console.log(`Cloud Run job executed: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error('Error executing Cloud Run job:', error);
  }
};
