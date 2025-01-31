"use server";

import { getN8nApiKey } from "./n8n";

// http://0.0.0.0:5678/webhook-test/trigger-dtcc
export async function triggerDtccWorkflow() {
  const n8nApiKey = process.env.N8N_API_KEY || (await getN8nApiKey());
  try {
    const response = await fetch(
      `${process.env.N8N_URL}/webhook-test/trigger-dtcc`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-N8N-API-KEY": n8nApiKey,
        },
        body: JSON.stringify({
          data: {
            timestamp: new Date().toISOString(),
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error calling DTCC:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries()),
      });
      return {
        error: `HTTP error! status: ${response.status}, message: ${errorText}`,
      };
    }

    const result = await response.json();
    console.log(result);
    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error("Error triggering workflow:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
