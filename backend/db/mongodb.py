from motor.motor_asyncio import AsyncIOMotorClient
import os

client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))

db = client.smartcv
resume_collection = db.resumes