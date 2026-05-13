from pydantic import BaseModel, EmailStr,Field  # these are all just validators from pydantic


class LoginRequestSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length = 8)


class SignupRequestSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length = 8)
    username: str = Field(min_length=3, max_length=30)

class AuthResponseSchema(BaseModel):
    id: str
    email: str | None = None
    username: str | None = None


