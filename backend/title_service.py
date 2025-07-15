import os
from openai import AsyncOpenAI
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class TitleGenerationService:
    def __init__(self):
        # Initialize OpenAI client with API key from environment
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.client = AsyncOpenAI(api_key=api_key)
    
    async def generate_episode_title(self, description: str) -> str:
        """Generate a Netflix-style clickbait episode title using ChatGPT"""
        print(f"🎬 Generating title for: {description[:100]}...")
        
        try:
            # Create a prompt for generating clickbait episode titles
            prompt = f"""You are a Netflix content creator specializing in dramatic, clickbait episode titles for a tech show called "CaseMark Blitz Chronicles."

Given this engineering story/issue:
"{description}"

Generate a dramatic, clickbait-style episode title that would make viewers want to click and watch. The title should be:
- Dramatic and attention-grabbing
- Netflix-style (like "The Social Dilemma" or "The Tinder Swindler")
- Related to the engineering issue described
- 3-8 words long
- Intriguing but not spoiling the story

Examples of good titles:
- "The Merge That Broke Everything"
- "Code Red: The Friday Deploy"
- "The Bug That Cost Millions"
- "Midnight Crisis: Server Down"
- "The Intern's Fatal Click"

Return ONLY the title, no quotes or additional text."""

            # Call ChatGPT API
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a Netflix content creator who specializes in dramatic, clickbait episode titles for engineering stories."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=50,
                temperature=0.8,  # Some creativity but not too random
            )
            
            # Extract the title
            title = response.choices[0].message.content.strip()
            
            # Clean up the title (remove quotes if present)
            title = title.strip('"').strip("'")
            
            print(f"✅ Generated title: {title}")
            return title
            
        except Exception as e:
            print(f"❌ Error generating title: {str(e)}")
            
            # Fallback titles based on common patterns
            fallback_titles = [
                "The Incident That Changed Everything",
                "Crisis in the Code",
                "The Bug That Wouldn't Die",
                "Midnight Emergency",
                "The Deploy That Went Wrong",
                "Code Red Situation",
                "The System Meltdown",
                "Production Nightmare"
            ]
            
            # Simple fallback based on description keywords
            description_lower = description.lower()
            if "deploy" in description_lower or "release" in description_lower:
                return "The Deploy That Went Wrong"
            elif "bug" in description_lower or "error" in description_lower:
                return "The Bug That Wouldn't Die"
            elif "crash" in description_lower or "down" in description_lower:
                return "The System Meltdown"
            elif "database" in description_lower or "db" in description_lower:
                return "Database Disaster"
            elif "security" in description_lower or "hack" in description_lower:
                return "Security Breach"
            else:
                return "The Incident That Changed Everything"

# Global instance
title_service = TitleGenerationService()