from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from utils.file_store import get_file_meta, delete_file

router = APIRouter()

@router.get("/files/{file_id}")
def download_file(file_id: str):
    file_meta = get_file_meta(file_id)
    if not file_meta:
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
    return FileResponse(path=file_meta["path"], filename=file_meta["original_name"])

@router.delete("/files/{file_id}")
def delete_file_by_id(file_id: str):
    success = delete_file(file_id)
    if not success:
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
    return {"message": "파일이 삭제되었습니다"}
