from fastapi import FastAPI
from user_regist import router as user_regist_router

app = FastAPI()

@app.get("/api/hello")
def read_root():
    """
    テスト用 GET エンドポイント。
    /api/hello にアクセスすると "Hello from FastAPI!" が返る。
    """
    return {"message": "Hello from FastAPI!"}

# user_regist のルーターを /api プレフィックスで取り込み、ルートを統合する
app.include_router(user_regist_router, prefix="/api")
