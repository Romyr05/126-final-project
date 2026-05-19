# cookies -> store info for future use
from fastapi import Response
from app.core.config import settings

access_token_max_age = 60*60 # lsat 1 hr
refresh_token_max_age = 60*60*24*30 # this is equal to 30 days
#user tokens reset after 30 days

# this is from the starlette which was imported in fastapi
def set_auth_cookies(response:Response, access_token:str, refresh_token:str) -> None:

    #this is for the access
    response.set_cookie(
        key = settings.ACCESS_COOKIE_NAME,    #name
        value = access_token   ,   
        httponly = True,                    #frontend js cant read
        secure = settings.COOKIE_SECURE,        #https or http
        samesite = settings.COOKIE_SAMESITE,   #lax for local default but deployment issue need env
        path = "/" ,   #avail to all routes
        max_age = access_token_max_age,
    )


    # for refresh
    response.set_cookie(
        key = settings.REFRESH_COOKIE_NAME,
        value = refresh_token,
        httponly = True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=refresh_token_max_age,
        path="/",
    )


#delete auth
def clear_auth_cookies(response: Response) -> None:

    #for access
    response.delete_cookie(
        key = settings.ACCESS_COOKIE_NAME,
        path ="/",
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )


    response.delete_cookie(
        key = settings.REFRESH_COOKIE_NAME,
        path ="/",
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )

