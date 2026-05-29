from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId

from db.mongodb import resume_collection


async def create_resume(name: str, resume_data: dict):
    document = {
        "name": name,
        "resume_data": resume_data,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await resume_collection.insert_one(document)

    return str(result.inserted_id)


async def list_resumes():
    resumes = []

    async for doc in resume_collection.find().sort("created_at", -1):
        resumes.append(
            {
                "id": str(doc["_id"]),
                "name": doc["name"],
                "created_at": doc.get("created_at"),
                "updated_at": doc.get("updated_at"),
            }
        )

    return resumes


async def get_resume(resume_id: str):
    object_id = _parse_resume_id(resume_id)
    doc = await resume_collection.find_one({"_id": object_id})

    if not doc:
        return None

    return _serialize_resume(doc)

async def delete_resume(resume_id: str) -> bool:
    object_id = _parse_resume_id(resume_id)
    result = await resume_collection.delete_one({"_id": object_id})
    return result.deleted_count > 0


def _parse_resume_id(resume_id: str) -> ObjectId:
    try:
        return ObjectId(resume_id)
    except InvalidId as exc:
        raise ValueError("Invalid resume id") from exc


def _serialize_resume(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "resume_data": doc.get("resume_data", {}),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }