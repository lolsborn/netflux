#!/usr/bin/env python3
"""
Test script to verify DALL-E image generation works
"""
import asyncio
import os
from image_service import image_service

async def test_image_generation():
    """Test generating an image with DALL-E"""
    print("Testing DALL-E image generation...")
    
    # Test episode data
    title = "The Merge That Broke Everything"
    description = "A critical bug was introduced during a seemingly simple merge that took down the entire production system. The team had to work through the night to identify and fix the issue while customers were unable to access the service."
    episode_id = 999
    
    try:
        # Generate image
        print(f"Generating image for episode: {title}")
        filename = await image_service.generate_episode_image(title, description, episode_id)
        
        if filename:
            print(f"✅ Image generated successfully: {filename}")
            image_path = image_service.get_image_path(filename)
            print(f"📁 Image saved to: {image_path}")
            
            # Check if file exists
            if os.path.exists(image_path):
                file_size = os.path.getsize(image_path)
                print(f"📊 File size: {file_size} bytes")
                
                # Get image URL
                image_url = image_service.get_image_url(filename)
                print(f"🔗 Image URL: {image_url}")
                
                return True
            else:
                print("❌ Image file was not created")
                return False
        else:
            print("❌ Image generation failed")
            return False
            
    except Exception as e:
        print(f"❌ Error during image generation: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_image_generation())
    if success:
        print("\n🎉 Image generation test passed!")
    else:
        print("\n💥 Image generation test failed!")
        print("Make sure you have set the OPENAI_API_KEY environment variable in .env")