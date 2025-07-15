const API_BASE_URL = process.env.BACKEND_URL;

const TOKEN = process.env.BACKEND_TOKEN;

export interface QueryRequest {
  node_ids: string[];
  user_query: string;
  api_keys: Record<string, any>;
  node_params?: Record<string, Record<string, any>>;
}

export interface QueryResponse {
  result: string;
}

export interface ApiError {
  detail: string;
}

// Next.js API route handler for POST requests
export async function POST(request: Request) {
  try {
    const body: QueryRequest = await request.json();

    // Validate request body
    if (!body.node_ids || !Array.isArray(body.node_ids)) {
      return Response.json(
        { detail: "node_ids is required and must be an array" },
        { status: 400 }
      );
    }

    if (!body.user_query || typeof body.user_query !== "string") {
      return Response.json(
        { detail: "user_query is required and must be a string" },
        { status: 400 }
      );
    }

    if (!body.api_keys || typeof body.api_keys !== "object") {
      return Response.json(
        { detail: "api_keys is required and must be an object" },
        { status: 400 }
      );
    }

    const response = await executeWorkflow(body);
    return Response.json(response);
  } catch (error) {
    console.error("API route error:", error);

    if (error instanceof Error) {
      return Response.json(
        { detail: error.message },
        { status: 500 }
      );
    }

    return Response.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}

// Next.js API route handler for GET requests (health check)
export async function GET() {
  try {
    const health = await healthCheck();
    return Response.json(health);
  } catch (error) {
    console.error("Health check error:", error);
    return Response.json(
      { detail: "Backend service unavailable" },
      { status: 503 }
    );
  }
}

async function executeWorkflow(
  request: QueryRequest
): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    mode: "cors",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let error: ApiError;
    try {
      error = await response.json();
    } catch {
      error = {
        detail: `HTTP ${response.status}: ${
          response.statusText || "Network error"
        }`,
      };
    }
    throw new Error(
      error.detail || `Failed to execute workflow (Status: ${response.status})`
    );
  }

  return response.json();
}

async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: "GET",
    mode: "cors",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Backend is not available (Status: ${response.status})`);
  }
  return response.json();
}
