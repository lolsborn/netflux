from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import create_db_and_tables, init_admin_settings
import os
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()
    init_admin_settings()
    
    # Create static images directory if it doesn't exist
    os.makedirs("static/images", exist_ok=True)
    
    yield
    
    # Shutdown (cleanup if needed)
    pass

app = FastAPI(title="Netflux Backend", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create static directory first, then mount
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

from fastapi import HTTPException, Depends
from sqlmodel import Session, select
from models import Episode, EpisodeCreate, EpisodeRead, AdminSettings, AdminSettingsUpdate, AdminSettingsRead, StatusRead
from database import get_session
from image_service import image_service
from title_service import title_service
from episode_description_service import episode_description_service
from datetime import datetime

@app.get("/")
async def root():
    return {"message": "Welcome to Netflux Backend"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Episode endpoints
@app.post("/api/episodes", response_model=EpisodeRead)
async def create_episode(episode: EpisodeCreate, session: Session = Depends(get_session)):
    # Check if submissions are open
    settings = session.get(AdminSettings, 1)
    if not settings or not settings.is_submission_open:
        raise HTTPException(status_code=403, detail="Submissions are closed")
    
    # Generate title using ChatGPT
    print(f"🎬 Generating title for episode by {episode.submitted_by}")
    generated_title = await title_service.generate_episode_title(episode.description)
    
    # Generate comedy description using ChatGPT
    print(f"🎭 Generating comedy description for episode by {episode.submitted_by}")
    comedy_description = await episode_description_service.generate_episode_description(generated_title, episode.description)
    
    # Create episode in database with generated title and comedy description
    db_episode = Episode(
        title=generated_title,
        description=episode.description,
        comedy_description=comedy_description,
        submitted_by=episode.submitted_by
    )
    session.add(db_episode)
    session.commit()
    session.refresh(db_episode)
    
    # Generate AI image asynchronously
    print(f"🎨 Attempting to generate image for episode {db_episode.id}: '{db_episode.title}'")
    
    try:
        image_filename = await image_service.generate_episode_image(
            title=db_episode.title,
            description=db_episode.description,
            episode_id=db_episode.id
        )
        
        if image_filename:
            # Update episode with image URL
            db_episode.image_url = image_service.get_image_url(image_filename)
            session.add(db_episode)
            session.commit()
            session.refresh(db_episode)
            print(f"✅ Image generated successfully: {image_filename}")
        else:
            print("⚠️  Image generation returned None")
            
    except Exception as e:
        print(f"❌ Failed to generate image for episode {db_episode.id}: {str(e)}")
        
        # Check for specific error types
        if "billing_hard_limit_reached" in str(e):
            print("💰 OpenAI billing limit reached. Add credits to your account.")
        elif "invalid_api_key" in str(e):
            print("🔑 Invalid OpenAI API key. Check your .env file.")
        elif "rate_limit_exceeded" in str(e):
            print("⏰ OpenAI rate limit exceeded. Try again later.")
        else:
            print(f"🔍 Error details: {type(e).__name__}: {e}")
        
        # Continue without image - not critical for episode creation
    
    print(f"📝 Episode {db_episode.id} created successfully")
    
    return db_episode

@app.get("/api/episodes", response_model=list[EpisodeRead])
async def get_episodes(session: Session = Depends(get_session)):
    episodes = session.exec(select(Episode).order_by(Episode.timestamp.desc())).all()
    return episodes

@app.delete("/api/episodes/{episode_id}")
async def delete_episode(episode_id: int, session: Session = Depends(get_session)):
    episode = session.get(Episode, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    
    session.delete(episode)
    session.commit()
    return {"message": "Episode deleted"}

# Admin endpoints
@app.get("/api/admin/settings", response_model=AdminSettingsRead)
async def get_admin_settings(session: Session = Depends(get_session)):
    settings = session.get(AdminSettings, 1)
    if not settings:
        raise HTTPException(status_code=404, detail="Admin settings not found")
    return settings

@app.put("/api/admin/settings", response_model=AdminSettingsRead)
async def update_admin_settings(settings_update: AdminSettingsUpdate, session: Session = Depends(get_session)):
    settings = session.get(AdminSettings, 1)
    if not settings:
        raise HTTPException(status_code=404, detail="Admin settings not found")
    
    settings.is_submission_open = settings_update.is_submission_open
    settings.updated_at = datetime.utcnow()
    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings

@app.delete("/api/admin/episodes")
async def clear_all_episodes(session: Session = Depends(get_session)):
    episodes = session.exec(select(Episode)).all()
    for episode in episodes:
        session.delete(episode)
    session.commit()
    return {"message": f"Deleted {len(episodes)} episodes"}

# Status endpoint
@app.get("/api/status", response_model=StatusRead)
async def get_status(session: Session = Depends(get_session)):
    settings = session.get(AdminSettings, 1)
    if not settings:
        return StatusRead(is_submission_open=True)
    return StatusRead(is_submission_open=settings.is_submission_open)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
