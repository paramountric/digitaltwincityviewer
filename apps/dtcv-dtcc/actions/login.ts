"use server";

import { DbProfile, DbUser, dbUserToUserWithProfile } from "@/model";
import { createClient } from "@/utils/supabase/server";
import { SERVICES } from "@/utils/constants";

export async function login(email: string, password: string) {
  try {
    // 1. Authenticate with Supabase
    const client = await createClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { data };

    // 2. Authenticate with Speckle
    // const speckleUrl = new URL("/auth/local/login", SERVICES.speckle);
    // speckleUrl.searchParams.append("challenge", "true");

    // const speckleResponse = await fetch(speckleUrl.toString(), {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Accept: "application/json",
    //   },
    //   body: JSON.stringify({
    //     email,
    //     password,
    //   }),
    //   credentials: "include",
    //   redirect: "manual", // Don't automatically follow redirects
    // });

    // // Handle 302 redirect and get access code
    // if (speckleResponse.status === 302) {
    //   const location = speckleResponse.headers.get("location");
    //   if (!location) {
    //     return { error: "No redirect location found" };
    //   }

    //   const accessCode = new URL(location).searchParams.get("access_code");
    //   if (!accessCode) {
    //     return { error: "No access code found" };
    //   }

    //   // 3. Exchange access code for token
    //   const tokenResponse = await fetch(`${SERVICES.speckle}/auth/token`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       accessCode,
    //       challenge: "none",
    //       appId: process.env.SPECKLE_APP_ID,
    //       appSecret: process.env.SPECKLE_APP_SECRET,
    //     }),
    //     credentials: "include",
    //   });

    //   if (!tokenResponse.ok) {
    //     const errorBody = await tokenResponse.text();
    //     console.error("Token exchange failed:", errorBody);
    //     return { error: "Failed to exchange access code for token" };
    //   }

    //   const tokenData = await tokenResponse.json();
    //   console.log("Speckle token data:", tokenData);

    //   return {
    //     data,
    //     error: null,
    //   };
    // }

    // // Handle non-302 responses as errors
    // const errorBody = await speckleResponse.text();
    // console.error("Speckle authentication failed:", {
    //   status: speckleResponse.status,
    //   statusText: speckleResponse.statusText,
    //   body: errorBody,
    // });
    // return {
    //   error: `Speckle authentication failed: ${speckleResponse.status} ${speckleResponse.statusText}`,
    // };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Authentication failed" };
  }
}
