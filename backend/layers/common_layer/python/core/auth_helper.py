import json

def get_user_context(event: dict) -> dict:
    """Extract user information and roles from the API Gateway Cognito Authorizer context."""
    try:
        claims = event["requestContext"]["authorizer"]["jwt"]["claims"]
        groups = claims.get("cognito:groups", [])
        if isinstance(groups, str):
            # Cognito might return a bracketed string or comma separated
            groups = groups.replace("[", "").replace("]", "").split(",")
            groups = [g.strip() for g in groups]

        return {
            "user_id": claims.get("sub"),
            "email": claims.get("email"),
            "groups": groups,
            "is_admin": "Admin" in groups,
            "is_student": "Student" in groups or len(groups) == 0
        }
    except (KeyError, TypeError):
        return {
            "user_id": None,
            "email": None,
            "groups": [],
            "is_admin": False,
            "is_student": False
        }

def format_response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
        },
        "body": json.dumps(body)
    }
