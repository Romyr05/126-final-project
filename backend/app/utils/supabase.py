from fastapi import HTTPException


def first_row(response, detail: str, status_code: int = 400):
    rows = response.data or []

    if not rows:
        raise HTTPException(status_code=status_code, detail=detail)

    return rows[0]
