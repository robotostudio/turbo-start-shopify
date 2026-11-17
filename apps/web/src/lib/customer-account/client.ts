import "server-only";

import { Logger } from "@workspace/logger";

import { getGraphqlEndpoint } from "./oauth";
import { getSession } from "./server";

const logger = new Logger("CustomerAccountClient");

export type CustomerAccountFailureKind =
  | "unauthorized"
  | "network"
  | "graphql"
  | "unknown";

/** Same shape as `StorefrontQueryResult`, plus an `unauthorized` kind. */
export type CustomerAccountQueryResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; kind: CustomerAccountFailureKind };

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

/**
 * Typed Customer Account API request, made as the signed-in customer. Every
 * Customer Account API call goes through here. Never cache the result: it is
 * one customer's private data.
 */
export async function customerAccountQuery<T>(
  query: string,
  options?: { variables?: Record<string, unknown> }
): Promise<CustomerAccountQueryResult<T>> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "Not signed in", kind: "unauthorized" };
  }

  try {
    const endpoint = await getGraphqlEndpoint();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // The Customer Account API takes the bare token, no `Bearer` prefix.
        Authorization: session.accessToken,
      },
      body: JSON.stringify({ query, variables: options?.variables }),
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        error: "Customer session rejected",
        kind: "unauthorized",
      };
    }
    if (!response.ok) {
      const error = `Customer Account API HTTP ${response.status}`;
      logger.error(error);
      return {
        ok: false,
        error,
        kind:
          response.status >= 500 || response.status === 429
            ? "network"
            : "unknown",
      };
    }

    const body = (await response.json()) as GraphqlResponse<T>;
    const messages = (body.errors ?? [])
      .map((error) => error.message)
      .filter((message): message is string => Boolean(message));
    if (messages.length > 0) {
      const error = messages.join("; ");
      logger.error(`Customer Account API error: ${error}`);
      return { ok: false, error, kind: "graphql" };
    }
    if (!body.data) {
      return { ok: false, error: "No data returned", kind: "unknown" };
    }
    return { ok: true, data: body.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Customer Account API request failed: ${message}`);
    return { ok: false, error: message, kind: "network" };
  }
}
