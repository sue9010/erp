import os
from uuid import uuid4

# 공통 업로드 메타데이터 저장소
uploaded_files = []  # [{id, entity, entity_id, path, original_name}]

def register_file(entity: str, entity_id: int, file_data, base_dir: str):
    os.makedirs(base_dir, exist_ok=True)
    original_filename = file_data.filename
    sanitized_filename = f"{entity}_{entity_id}_{original_filename.replace(' ', '_')}"
    full_path = os.path.join(base_dir, sanitized_filename)

    with open(full_path, "wb") as f:
        f.write(file_data.file.read())

    file_id = str(uuid4())
    uploaded_files.append({
        "id": file_id,
        "entity": entity,
        "entity_id": entity_id,
        "path": full_path,
        "original_name": original_filename,
    })

    return {
        "file_id": file_id,
        "original_name": original_filename
    }

def get_files_by_entity(entity: str, entity_id: int):
    return [
        {"file_id": f["id"], "original_name": f["original_name"]}
        for f in uploaded_files
        if f["entity"] == entity and f["entity_id"] == entity_id
    ]

def get_file_meta(file_id: str):
    return next((f for f in uploaded_files if f["id"] == file_id), None)

def delete_file(file_id: str):
    global uploaded_files
    file_meta = get_file_meta(file_id)
    if not file_meta:
        return False
    try:
        os.remove(file_meta["path"])
    except FileNotFoundError:
        pass
    uploaded_files = [f for f in uploaded_files if f["id"] != file_id]
    return True

def get_all_entity_files(entity: str, entity_id: int):
    return [f for f in uploaded_files if f["entity"] == entity and f["entity_id"] == entity_id]
