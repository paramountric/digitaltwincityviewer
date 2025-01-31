"use server";

const apiKeyCache = new Map<
  string,
  {
    apiKey: string;
    expiresAt: number;
  }
>();

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export async function getN8nApiKey() {
  return process.env.N8N_API_KEY || (await createN8nApiKey("N8N_ADMIN"));
}

async function createN8nApiKey(userId: string) {
  try {
    // First login to n8n using platform admin credentials
    const loginResponse = await fetch(`${process.env.N8N_URL}/rest/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      console.error("Failed to login to n8n platform");
      throw new Error("Failed to login to n8n platform");
    }

    // Get auth cookie from response
    const cookies = loginResponse.headers.get("set-cookie");
    const authCookie = cookies?.split(";")[0]; // Get n8n-auth cookie

    if (!authCookie) {
      console.error("No auth cookie received");
      throw new Error("No auth cookie received");
    }

    // Create API key with unique name
    const apiKeyResponse = await fetch(`${process.env.N8N_URL}/rest/api-keys`, {
      method: "POST",
      headers: {
        Cookie: authCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `user-${userId}-${new Date().getTime()}`,
      }),
    });

    if (!apiKeyResponse.ok) {
      console.error("Failed to create API key");
      throw new Error("Failed to create API key");
    }

    const {
      data: { apiKey },
    } = await apiKeyResponse.json();

    return apiKey;
  } catch (error) {
    console.error("Error creating n8n API key:", error);
    throw error;
  }
}

export async function getOrCreateN8nApiKey(userId: string = "N8N_ADMIN") {
  // Check cache first
  const cached = apiKeyCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.apiKey;
  }

  // If not in cache or expired, fetch from DB
  // const supabase = await createClient();

  // const { data, error } = await supabase
  //   .from("user_api_keys")
  //   .select("apiKey")
  //   .eq("userId", userId)
  //   .single();

  // // If no API key found, create one
  // if ((!data || !data.token) && !error) {
  const newApiKey = await createN8nApiKey(userId);

  console.log("New API Key:", newApiKey);

  // Update cache
  apiKeyCache.set(userId, {
    apiKey: newApiKey,
    expiresAt: Date.now() + CACHE_DURATION,
  });

  return newApiKey;
  // }

  // if (error) {
  //   console.error("Error fetching n8n API key:", error);
  //   throw new Error("Failed to fetch n8n API key");
  // }

  // Update cache
  // apiKeyCache.set(userId, {
  //   apiKey: data.token,
  //   expiresAt: Date.now() + CACHE_DURATION,
  // });

  // return data.token;
}

// Optional: function to invalidate cache when API key is updated
export async function invalidateApiKeyCache(userId: string) {
  apiKeyCache.delete(userId);
}
