import os
from openai import AsyncOpenAI
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class EpisodeDescriptionService:
    def __init__(self):
        # Initialize OpenAI client with API key from environment
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.client = AsyncOpenAI(api_key=api_key)
    
    async def generate_episode_description(self, title: str, issue: str) -> str:
        """Generate a Netflix-style comedy episode description using ChatGPT"""
        print(f"🎭 Generating comedy description for: {title}")
        
        try:
            # Create a prompt for generating comedy episode descriptions
            prompt = f"""You are a Netflix comedy writer creating episode descriptions for "CaseMark Blitz Chronicles," a workplace comedy series about software development teams. 

Create a single paragraph episode description that:
- Starts with "In this [adjective] episode, our heroic development team..."
- Transforms the mundane engineering issue into an epic quest or catastrophe
- Uses dramatic language and overwrought metaphors
- References common developer experiences (Stack Overflow, coffee, meetings, bugs, deployments, etc.)
- Includes specific technical details but treats them as mysterious forces
- Ends with a cliffhanger question about whether they'll solve the problem
- Mentions "guest appearances" by personified developer frustrations
- Maintains a tone that's simultaneously grandiose and absurd
- Length: 4-6 sentences, roughly 150-200 words

Input format:
- Title: {title}
- Issue: {issue}

Transform the boring reality into comedy gold while keeping the core technical issue recognizable. Think "The Office" meets "Lord of the Rings" but for programmers."""

            # Call ChatGPT API
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a Netflix comedy writer who specializes in turning mundane software engineering problems into epic, dramatic, and hilarious episode descriptions for a workplace comedy series."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.8,  # High creativity for comedy
            )
            
            # Extract the description
            description = response.choices[0].message.content.strip()
            
            print(f"✅ Generated comedy description: {description[:100]}...")
            return description
            
        except Exception as e:
            print(f"❌ Error generating comedy description: {str(e)}")
            
            # Fallback comedy description
            return f"In this catastrophic episode, our heroic CaseMark development team faces the dreaded {title}! Armed with nothing but caffeinated beverages and increasingly desperate Stack Overflow searches, they must battle the mysterious forces of {issue}. Will they triumph over this technical nightmare, or will they be consumed by the ever-growing pile of error messages? Guest appearances by Imposter Syndrome and the dreaded Monday Morning Standup make this an episode you won't want to miss!"

# Global instance
episode_description_service = EpisodeDescriptionService()