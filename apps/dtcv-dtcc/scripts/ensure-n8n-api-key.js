const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config({ path: "platform/.env" });

const N8N_PORT = process.env.N8N_PORT || 5678;
const N8N_HOST = process.env.N8N_HOST || "supabase_n8n_digitaltwincityviewer";
const N8N_URL = `http://${N8N_HOST}:${N8N_PORT}`;
const N8N_EMAIL = process.env.N8N_EMAIL;
const N8N_PASSWORD = process.env.N8N_PASSWORD;
const API_KEY_FILE = path.join(__dirname, "../platform/.n8n-api-key.json");

async function makeRequest(options) {
  const protocol = options.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const req = protocol.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          data,
          cookies: res.headers["set-cookie"],
        });
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function getAuthToken() {
  console.log(`Attempting to login with email: ${N8N_EMAIL}`);

  try {
    const options = {
      protocol: "http:",
      hostname: N8N_HOST,
      port: N8N_PORT,
      path: "/rest/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        email: N8N_EMAIL,
        password: N8N_PASSWORD,
      },
    };

    const response = await makeRequest(options);

    if (response.statusCode !== 200) {
      console.log(
        `Login failed with status ${response.statusCode}: ${response.data}`
      );
      return null;
    }

    const authCookie = response.cookies?.find((cookie) =>
      cookie.startsWith("n8n-auth=")
    );
    if (!authCookie) {
      console.log("No auth cookie received in response");
      return null;
    }

    const token = authCookie.split("n8n-auth=")[1].split(";")[0];
    console.log("Successfully obtained auth token");
    return token;
  } catch (error) {
    console.log(`Login request failed: ${error}`);
    return null;
  }
}

async function getOrCreateApiKey(authToken) {
  // Check if API key exists in volume
  if (fs.existsSync(API_KEY_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(API_KEY_FILE, "utf8"));
      console.log("Found existing API key in volume");
      return data.api_key;
    } catch (error) {
      console.log(`Error reading API key from volume: ${error}`);
    }
  }

  // Create new key if none exists
  try {
    const uniqueLabel = `dtcc-core-${uuidv4()}`;
    const options = {
      protocol: "http:",
      hostname: N8N_HOST,
      port: N8N_PORT,
      path: "/rest/api-keys",
      method: "POST",
      headers: {
        Cookie: `n8n-auth=${authToken}`,
        "Content-Type": "application/json",
      },
      body: {
        label: uniqueLabel,
        name: uniqueLabel,
      },
    };

    const response = await makeRequest(options);

    if (response.statusCode !== 200) {
      console.log(
        `API key creation failed with status ${response.statusCode}: ${response.data}`
      );
      return null;
    }

    const { apiKey } = JSON.parse(response.data).data;

    // Save the new key to volume
    fs.mkdirSync(path.dirname(API_KEY_FILE), { recursive: true });
    fs.writeFileSync(
      API_KEY_FILE,
      JSON.stringify({
        api_key: apiKey,
        label: uniqueLabel,
      })
    );

    console.log(`Created and saved new API key with label: ${uniqueLabel}`);
    return apiKey;
  } catch (error) {
    console.log(`Failed to create or save API key: ${error}`);
    return null;
  }
}

async function importWorkflow(apiKey) {
  try {
    const workflowPath = path.join(__dirname, "workflows/process-dtcc.json");
    const workflowData = JSON.parse(fs.readFileSync(workflowPath, "utf8"));

    // Remove activation-related fields
    delete workflowData.active;

    const options = {
      protocol: "http:",
      hostname: N8N_HOST,
      port: N8N_PORT,
      path: "/api/v1/workflows",
      method: "POST",
      headers: {
        "X-N8N-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: workflowData,
    };

    const response = await makeRequest(options);

    if (response.statusCode !== 200 && response.statusCode !== 201) {
      console.log(`Error importing workflow: ${response.data}`);
      return;
    }

    const { id: workflowId } = JSON.parse(response.data);

    // Activate workflow
    const activateOptions = {
      ...options,
      path: `/api/v1/workflows/${workflowId}/activate`,
      body: {},
    };

    const activateResponse = await makeRequest(activateOptions);

    if (activateResponse.statusCode === 200) {
      console.log(`Workflow imported and activated with ID: ${workflowId}`);
    } else {
      console.log(`Error activating workflow: ${activateResponse.data}`);
    }
  } catch (error) {
    console.log(`Error importing workflow: ${error}`);
  }
}

async function main() {
  if (!N8N_EMAIL || !N8N_PASSWORD) {
    console.error(
      "N8N_EMAIL and N8N_PASSWORD environment variables must be set"
    );
    process.exit(1);
  }

  // Check for existing API key before doing anything else
  if (fs.existsSync(API_KEY_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(API_KEY_FILE, "utf8"));
      if (data.api_key) {
        console.log("Setup already completed (API key exists)");
        return;
      }
    } catch (error) {
      console.log(`Error reading API key file: ${error}`);
    }
  }

  try {
    // Get auth token first
    const authToken = await getAuthToken();
    if (!authToken) {
      console.log("Failed to obtain auth token");
      return;
    }

    // Create new API key with unique name
    const apiKey = await getOrCreateApiKey(authToken);
    if (!apiKey) {
      console.log("Failed to get or create API key");
      return;
    }

    console.log("Successfully created API key");

    // Import and activate workflow
    await importWorkflow(apiKey);
  } catch (error) {
    console.log(`Error during setup: ${error}`);
    process.exit(1);
  }
}

main();
