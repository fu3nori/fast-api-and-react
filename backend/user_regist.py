from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import pymysql
import os

app = FastAPI()

# ユーザーフォームデータに対応するPydanticモデル
class UserForm(BaseModel):
    mail: str
    pen_name: str
    real_name:str
    password: str
    zipcode: int
    prefectures: str
    municipalities: str
    town_name: str
    address: str
    obj: Optional[str] = None  # 任意項目

# DB接続情報（例）
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "")
DB_NAME = os.getenv("DB_NAME", "mydatabase")

@app.get("/api/user_regist")
def read_root():
    return {"message": "Hello from FastAPI!"}

@app.post("/api/user_regist")
def create_user(user: UserForm):
    """
    ReactのUserRegist.jsxからPOSTされたユーザーデータを受け取り、
    メール重複チェック後、DBにINSERTする。
    メール重複ならエラーを返す。
    """
    try:
        # DB接続（例：pymysql）
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cursor:
            # メールアドレス重複チェック
            sql_check = "SELECT COUNT(*) as cnt FROM users WHERE mail = %s"
            cursor.execute(sql_check, (user.mail,))
            row = cursor.fetchone()
            if row and row["cnt"] > 0:
                # 既に存在する
                raise HTTPException(
                    status_code=400,
                    detail="このメールは既に使われています"
                )

            # DBにINSERT
            sql_insert = """
                INSERT INTO users 
                    (mail, pen_name,real_name, password, zipcode, prefectures, municipalities, town_name, address, obj, plan)
                VALUES
                    (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
            """
            cursor.execute(sql_insert, (
                user.mail,
                user.pen_name,
                user.real_name,
                user.password,  # 実際はハッシュ化推奨
                user.zipcode,
                user.prefectures,
                user.municipalities,
                user.town_name,
                user.address,
                user.obj
            ))
            conn.commit()

        # ここでセッション発行など行う（省略）
        # 本来はFastAPIの認証機能やJWTなどを使い、Cookieやトークンを返却するのが一般的です。

        return {"success": True, "message": "User created successfully"}
    except HTTPException as e:
        # 上記で手動発行したHTTPExceptionはそのままスロー
        raise e
    except Exception as e:
        print("Error in create_user:", str(e))
        # 想定外エラーは500エラーとして返す
        raise HTTPException(status_code=500, detail="サーバーエラーが発生しました")
    finally:
        if 'conn' in locals() and conn:
            conn.close()
