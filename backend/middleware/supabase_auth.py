"""
Supabase JWT authentication middleware.
Validates JWT tokens from Supabase Auth.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from config import get_settings


# Security scheme
security = HTTPBearer()


class UserInfo(BaseModel):
    """Extracted user information from JWT."""
    user_id: str
    email: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[datetime] = None


async def verify_supabase_token(token: str) -> dict:
    """
    Verify a Supabase JWT token.
    
    Args:
        token: The JWT token to verify
        
    Returns:
        The decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    settings = get_settings()
    
    print(f"[Auth] Verifying token with JWT secret...")
    
    try:
        # Decode and verify the JWT
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        print(f"[Auth] Token verified successfully for user: {payload.get('sub')}")
        return payload
    except JWTError as e:
        print(f"[Auth] JWT verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UserInfo:
    """
    Dependency to get the current authenticated user.
    
    Args:
        credentials: The HTTP Bearer credentials
        
    Returns:
        UserInfo with extracted user data
        
    Raises:
        HTTPException: If authentication fails
    """
    print(f"[Auth] Received credentials: {credentials}")
    token = credentials.credentials
    print(f"[Auth] Token (first 50 chars): {token[:50]}...")
    
    try:
        payload = await verify_supabase_token(token)
        
        # Extract user info from Supabase JWT structure
        user_id = payload.get("sub")
        print(f"[Auth] Extracted user_id: {user_id}")
        
        if not user_id:
            print("[Auth] ERROR: Missing user ID in token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_info = UserInfo(
            user_id=user_id,
            email=payload.get("email"),
            role=payload.get("role", "authenticated"),
            exp=datetime.fromtimestamp(payload.get("exp", 0)) if payload.get("exp") else None,
        )
        print(f"[Auth] Created UserInfo successfully: {user_info}")
        return user_info
    except HTTPException:
        print("[Auth] HTTPException caught, re-raising")
        raise
    except Exception as e:
        print(f"[Auth] Unexpected exception: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
) -> Optional[UserInfo]:
    """
    Optional authentication dependency.
    Returns None if no token provided, UserInfo if valid token.
    """
    if credentials is None:
        return None
    
    return await get_current_user(credentials)

