import requests
from app.models.state import State

def hashnode_node(state: State) -> State:
    if not state.get("current_output"):
        raise ValueError("No content to publish from previous node")

    # Access keys from inside 'api_keys'
    hashnode_token = state["api_keys"]["hashnode_token"]
    publication_id = state["api_keys"]["hashnode_publication_id"]

    query = """
    mutation CreateDraft($input: CreateDraftInput!) {
      createDraft(input: $input) {
        draft {
          id
          title
        }
      }
    }
    """

    variables = {
        "input": {
            "title": "AI Generated Post",
            "contentMarkdown": state["current_output"],
            "publicationId": publication_id,
            "slug": "ai-generated-post"
        }
    }

    headers = {
        "Authorization": hashnode_token,
        "Content-Type": "application/json"
    }

    response = requests.post(
        "https://gql.hashnode.com",
        json={"query": query, "variables": variables},
        headers=headers
    )

    if response.status_code != 200:
        raise ValueError(f"Hashnode API HTTP error: {response.text}")

    result = response.json()
    if "errors" in result:
        raise ValueError(f"Hashnode GraphQL error: {result['errors']}")

    draft_id = result["data"]["createDraft"]["draft"]["id"]
    draft_title = result["data"]["createDraft"]["draft"]["title"]

    state["current_output"] = f"✅ Draft '{draft_title}' created successfully on Hashnode with ID: {draft_id}"
    return state
