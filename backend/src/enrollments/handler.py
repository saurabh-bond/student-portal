import json
import os
import uuid
import boto3
from boto3.dynamodb.conditions import Key
from core.auth_helper import get_user_context, format_response

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])

def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method")
    path = event.get("rawPath", "")
    path_params = event.get("pathParameters") or {}
    user = get_user_context(event)

    if method == "OPTIONS":
        return format_response(200, {})

    # 1. Student self-enrolls
    if path.endswith("/enrollments/apply") and method == "POST":
        body = json.loads(event.get("body", "{}"))
        course_id = body.get("course_id")
        course_title = body.get("course_title", "Course")
        enrollment_id = str(uuid.uuid4())

        item = {
            "PK": f"USER#{user['user_id']}",
            "SK": f"ENROLLMENT#{enrollment_id}",
            "GSI1PK": "STATUS#PENDING",
            "GSI1SK": f"COURSE#{course_id}",
            "enrollment_id": enrollment_id,
            "course_id": course_id,
            "course_title": course_title,
            "user_id": user["user_id"],
            "user_email": user["email"],
            "status": "PENDING"
        }
        table.put_item(Item=item)
        return format_response(201, {"message": "Enrollment request submitted", "enrollment": item})

    # 2. Student views enrolled courses
    elif path.endswith("/enrollments/my") and method == "GET":
        response = table.query(
            KeyConditionExpression=Key("PK").eq(f"USER#{user['user_id']}") & Key("SK").begins_with("ENROLLMENT#")
        )
        return format_response(200, {"enrollments": response.get("Items", [])})

    # 3. Admin views pending approvals
    elif path.endswith("/enrollments/pending") and method == "GET":
        if not user["is_admin"]:
            return format_response(403, {"error": "Admin privileges required"})

        response = table.query(
            IndexName="GSI1",
            KeyConditionExpression=Key("GSI1PK").eq("STATUS#PENDING")
        )
        return format_response(200, {"pending_approvals": response.get("Items", [])})

    # 4. Admin approves or rejects
    elif "/status" in path and method == "PUT":
        if not user["is_admin"]:
            return format_response(403, {"error": "Admin privileges required"})

        enrollment_id = path_params.get("enrollment_id")
        body = json.loads(event.get("body", "{}"))
        target_user_id = body.get("user_id")
        new_status = body.get("status") # APPROVED or REJECTED

        table.update_item(
            Key={
                "PK": f"USER#{target_user_id}",
                "SK": f"ENROLLMENT#{enrollment_id}"
            },
            UpdateExpression="SET #st = :s, GSI1PK = :gsi",
            ExpressionAttributeNames={"#st": "status"},
            ExpressionAttributeValues={
                ":s": new_status,
                ":gsi": f"STATUS#{new_status}"
            }
        )
        return format_response(200, {"message": f"Enrollment updated to {new_status}"})

    # 5. Student drops a course
    elif method == "DELETE":
        enrollment_id = path_params.get("enrollment_id")
        table.delete_item(
            Key={
                "PK": f"USER#{user['user_id']}",
                "SK": f"ENROLLMENT#{enrollment_id}"
            }
        )
        return format_response(200, {"message": "Course dropped successfully"})

    return format_response(404, {"error": "Route not found"})
