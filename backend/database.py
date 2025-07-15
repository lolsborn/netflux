from sqlmodel import SQLModel, create_engine, Session
from models import Episode, AdminSettings
import os
import sqlite3

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./netflux.db")

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    
    # Handle migration for image_url field
    migrate_episode_table()

def migrate_episode_table():
    """Add image_url and comedy_description columns to existing episode table if they don't exist"""
    db_path = DATABASE_URL.replace("sqlite:///", "").replace("sqlite://", "")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check existing columns
        cursor.execute("PRAGMA table_info(episode)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add image_url column if it doesn't exist
        if 'image_url' not in columns:
            cursor.execute("ALTER TABLE episode ADD COLUMN image_url TEXT")
            conn.commit()
            print("Added image_url column to episode table")
        
        # Add comedy_description column if it doesn't exist
        if 'comedy_description' not in columns:
            cursor.execute("ALTER TABLE episode ADD COLUMN comedy_description TEXT")
            conn.commit()
            print("Added comedy_description column to episode table")
        
        conn.close()
    except Exception as e:
        print(f"Migration warning: {e}")
        # Continue even if migration fails - table might not exist yet

def get_session():
    with Session(engine) as session:
        yield session

def init_admin_settings():
    with Session(engine) as session:
        existing_settings = session.get(AdminSettings, 1)
        if not existing_settings:
            settings = AdminSettings(id=1, is_submission_open=True)
            session.add(settings)
            session.commit()