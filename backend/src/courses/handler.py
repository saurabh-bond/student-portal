import json
import os
import uuid
import boto3
from core.auth_helper import get_user_context, format_response

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])

def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method")
    path_params = event.get("pathParameters") or {}
    user = get_user_context(event)

    if method == "OPTIONS":
        return format_response(200, {})

    # GET ALL COURSES (Open to logged in users)
    if method == "GET":
        response = table.query(
            IndexName="GSI1",
            KeyConditionExpression="GSI1PK = :gsi1pk",
            ExpressionAttributeValues={":gsi1pk": "ENTITY#COURSE"}
        )
        return format_response(200, {"courses": response.get("Items", [])})

    # CREATE COURSE (Admin Only)
    elif method == "POST":
        if not user["is_admin"]:
            return format_response(403, {"error": "Unauthorized: Admin privileges required."})

        body = json.loads(event.get("body", "{}"))
        course_id = str(uuid.uuid4())
        item = {
            "PK": f"COURSE#{course_id}",
            "SK": "METADATA",
            "GSI1PK": "ENTITY#COURSE",
            "GSI1SK": f"TITLE#{body.get('title', '')}",
            "course_id": course_id,
            "title": body.get("title"),
            "description": body.get("description"),
            "instructor": body.get("instructor", user["email"]),
            "created_by": user["email"]
        }
        table.put_item(Item=item)
        return format_response(201, {"message": "Course created", "course": item})

    # DELETE COURSE (Admin Only)
    elif method == "DELETE":
        if not user["is_admin"]:
            return format_response(403, {"error": "Unauthorized: Admin privileges required."})

        course_id = path_params.get("course_id")
        table.delete_item(
            Key={
                "PK": f"COURSE#{course_id}",
                "SK": "METADATA"
            }
        )
        return format_response(200, {"message": "Course removed successfully"})

    return format_response(405, {"error": "Method not allowed"})
