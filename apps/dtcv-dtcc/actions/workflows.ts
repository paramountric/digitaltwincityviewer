"use server";

import { z } from "zod";
import { SERVICES } from "@/utils/constants";
import { getN8nApiKey } from "./n8n";

// Environment variable validation schema
const envSchema = z.object({
  N8N_URL: z.string().url(),
  N8N_API_KEY: z.string(),
});

// Validate environment variables
const env = envSchema.parse({
  N8N_URL: SERVICES.n8n,
  N8N_API_KEY: process.env.N8N_API_KEY || "1234567890", // Fallback for development
});

/**
 * Setup n8n workflow
 */
export async function setupWorkflow(workflow: any) {
  try {
    const apiKey = process.env.N8N_API_KEY || (await getN8nApiKey());

    const headers = {
      "X-N8N-API-KEY": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Remove 'active' property from workflow before sending (or make sure the workflow does now contain it..)
    const { active, ...workflowData } = workflow;

    const response = await fetch(`${env.N8N_URL}/api/v1/workflows`, {
      method: "POST",
      headers,
      body: JSON.stringify(workflowData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("N8N API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: `${env.N8N_URL}/api/v1/workflows`,
      });
      throw new Error(`Failed to create workflow: ${response.statusText}`);
    }

    console.log("Workflow created successfully");
    const result = await response.json();
    console.log("Workflow ID:", result.id);

    console.log("Attempting to activate workflow...");
    const activateResponse = await fetch(
      `${env.N8N_URL}/api/v1/workflows/${result.id}/activate`,
      {
        method: "POST",
        headers,
      }
    );

    if (!activateResponse.ok) {
      console.error("Failed to activate workflow:", {
        status: activateResponse.status,
        statusText: activateResponse.statusText,
      });
      throw new Error("Failed to activate workflow");
    }

    console.log("Workflow activated successfully");
    return { success: true, workflowId: result.id };
  } catch (error) {
    console.error("Workflow setup error:", error);
    // Log the full error object for debugging
    console.error("Full error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
