import os
import hashlib
import aiofiles
import httpx
from openai import AsyncOpenAI
from typing import Optional
import asyncio
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ImageGenerationService:
    def __init__(self, storage_dir: str = "static/images"):
        self.storage_dir = storage_dir
        
        # Initialize OpenAI client with API key from environment
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.client = AsyncOpenAI(api_key=api_key)
        self.ensure_storage_directory()
        
    def ensure_storage_directory(self):
        """Create storage directory if it doesn't exist"""
        os.makedirs(self.storage_dir, exist_ok=True)
        
    def generate_dalle_prompt(self, title: str, description: str) -> str:
        """Generate a DALL-E prompt for Netflix-style episode thumbnail"""
        
        # Create a cinematic, Netflix-style prompt
        prompt = f"""Create a Netflix-style episode thumbnail for a TV show called "CaseMark Blitz Chronicles". 
        
        Episode Title: "{title}"
        Episode Description: "{description}"
        
        Style requirements:
        - Cinematic, high-quality digital artwork
        - Dark, dramatic lighting with purple accent colors
        - Modern, sleek design similar to Netflix thumbnails
        - 16:9 aspect ratio composition
        - Professional TV show poster aesthetic
        - Include subtle tech/engineering elements if relevant to the description
        - Bold, dramatic composition
        - No text or typography in the image
        - Focus on visual storytelling that captures the essence of the engineering challenge described
        
        The image should feel like a premium streaming service thumbnail that would make viewers want to click and watch the episode about this engineering story."""
        
        return prompt
    
    async def generate_episode_image(self, title: str, description: str, episode_id: int) -> Optional[str]:
        """Generate DALL-E image for episode"""
        print(f"🎨 Starting image generation for episode {episode_id}")
        
        try:
            # Generate unique filename
            content_hash = hashlib.md5(f"{title}{description}".encode()).hexdigest()[:8]
            filename = f"episode_{episode_id}_{content_hash}.png"
            filepath = os.path.join(self.storage_dir, filename)
            
            print(f"📁 Target file path: {filepath}")
            
            # Check if image already exists
            if os.path.exists(filepath):
                print(f"♻️  Image already exists, using cached version: {filename}")
                return filename
            
            # Generate DALL-E prompt
            prompt = self.generate_dalle_prompt(title, description)
            print(f"📝 Generated prompt: {prompt[:100]}...")
            
            # Call DALL-E API
            print("🔄 Calling DALL-E API...")
            response = await self.client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",  # DALL-E 3 standard size
                quality="standard",
                n=1,
            )
            
            # Get the image URL
            image_url = response.data[0].url
            print(f"🔗 Got image URL: {image_url[:50]}...")
            
            # Download the image
            print("⬇️  Downloading image...")
            async with httpx.AsyncClient() as client:
                img_response = await client.get(image_url)
                img_response.raise_for_status()
                
                print(f"📊 Downloaded {len(img_response.content)} bytes")
                
                # Save the image
                async with aiofiles.open(filepath, 'wb') as f:
                    await f.write(img_response.content)
            
            print(f"✅ Image saved successfully: {filename}")
            return filename
            
        except Exception as e:
            print(f"❌ Error generating image for episode {episode_id}: {str(e)}")
            print(f"🔍 Error type: {type(e).__name__}")
            
            # Print more details for debugging
            if hasattr(e, 'response'):
                print(f"📡 Response status: {e.response.status_code if hasattr(e.response, 'status_code') else 'N/A'}")
                print(f"📡 Response text: {e.response.text if hasattr(e.response, 'text') else 'N/A'}")
            
            return None
    
    def get_image_path(self, filename: str) -> str:
        """Get full path to image file"""
        return os.path.join(self.storage_dir, filename)
    
    def image_exists(self, filename: str) -> bool:
        """Check if image file exists"""
        return os.path.exists(self.get_image_path(filename))
    
    def delete_image(self, filename: str) -> bool:
        """Delete image file"""
        try:
            filepath = self.get_image_path(filename)
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
            return False
        except Exception:
            return False
    
    def get_image_url(self, filename: str) -> str:
        """Get URL for serving the image"""
        return f"/static/images/{filename}"

# Global instance
image_service = ImageGenerationService()