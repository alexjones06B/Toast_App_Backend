// Remote database connection using Cloudflare D1 HTTP API

interface D1Response {
  success: boolean;
  result: Array<{
    results: Record<string, unknown>[];
    success: boolean;
    meta: {
      changed_db: boolean;
      changes: number;
      duration: number;
      last_row_id: number;
      rows_read: number;
      rows_written: number;
    };
  }>;
  errors: string[];
  messages: string[];
}

export async function queryRemoteDB(
  sql: string,
  apiToken: string,
  accountId: string,
  databaseId: string
) {
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
    const payload = { sql };

    console.log(`Making request to: ${url}`);
    console.log(`Payload:`, JSON.stringify(payload));
    console.log(`Token prefix: ${apiToken.substring(0, 10)}...`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log(`Response body:`, responseText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
    }

    const data = JSON.parse(responseText) as D1Response;

    if (!data.success) {
      console.error(`D1 API error:`, data.errors);
      throw new Error(`D1 API error: ${JSON.stringify(data.errors)}`);
    }

    if (!data.result || data.result.length === 0) {
      console.log("No results returned");
      return [];
    }

    return data.result[0].results;
  } catch (error) {
    console.error("Remote DB query error:", error);
    throw error;
  }
}
