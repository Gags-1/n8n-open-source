from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound
from openai import OpenAI
from app.models.state import State
import logging

logger = logging.getLogger(__name__)

def video_summary_node(state: State, **params) -> State:
    try:
        # Initialize state if needed
        if "current_output" not in state:
            state["current_output"] = {}
            
        # Get video ID
        video_id = params.get("video_id")
        if not video_id:
            raise ValueError("Missing video_id parameter")
        
        # Get transcript
        try:
            transcript = YouTubeTranscriptApi.get_transcript(
                video_id, 
                languages=[params.get("language", "en")]
            )
            if not transcript:
                raise ValueError("Empty transcript returned")
        except NoTranscriptFound:
            raise ValueError(f"No English transcript available for video {video_id}")
        
        # Generate summary
        openai_key = state.get("api_keys", {}).get("openai")
        if not openai_key:
            raise ValueError("Missing OpenAI API key")
            
        client = OpenAI(api_key=openai_key)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{
                "role": "system",
                "content": "Summarize this in 3 bullet points:"
            }, {
                "role": "user",
                "content": " ".join([t['text'] for t in transcript])
            }]
        )
        
        # Safely store results
        state["current_output"] = {
            "summary": response.choices[0].message.content,
            "video_id": video_id,
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Video summary failed: {str(e)}")
        state["error"] = str(e)
        state["current_output"] = {"status": "failed", "reason": str(e)}
    
    return state