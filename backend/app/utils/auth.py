from typing import Annotated
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database.supabase_client_backend import supabase


security = HTTPBearer()

def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials,Depends(security)]):
    token = credentials.credentials 


    try:
        response = supabase.auth.get_current_user(token)
        user = response.user   #this is because json file ni so need i indicate what value lng


        if not user:
            raise HTTPException(status_code=401, detail="Invalid authentication token")

    except Exception:
            raise HTTPException(status_code=401, detail="Could not validate user")
        

    return user

