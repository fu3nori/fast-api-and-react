from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import Column, Integer, String, DateTime, SmallInteger, func
from sqlalchemy.orm import declarative_base
from passlib.context import CryptContext  # パスワードハッシュ化のためのPassLib
import logging
import os
import datetime
import jwt  # JWTトークン生成のためのPyJWT

# python-dotenv を使って .env ファイルを読み込む
from dotenv import load_dotenv

load_dotenv()  # カレントディレクトリに .env ファイルがあればロードする

logging.basicConfig(level=logging.ERROR)

# config_async.py で設定した非同期エンジンとセッションファクトリをインポート
from config_async import AsyncSessionLocal, engine

# ORM用のベースクラスを生成
Base = declarative_base()

# bcrypt を利用したパスワードハッシュ化の設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    平文のパスワードを受け取り、bcryptでハッシュ化して返す。
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    平文のパスワードとハッシュ化済みパスワードを比較して、一致するか検証する。
    """
    return pwd_context.verify(plain_password, hashed_password)


# ORMモデル: usersテーブルに対応するUserクラス
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mail = Column(String(255), nullable=False, unique=True, index=True)
    pen_name = Column(String(64), nullable=False, index=True)
    real_name = Column(String(255), nullable=False)
    password = Column(String(128), nullable=False)
    # 郵便番号は文字列として扱う
    zipcode = Column(String(16), nullable=False)
    prefectures = Column(String(255), nullable=False)
    municipalities = Column(String(255), nullable=False)
    town_name = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)
    obj = Column(String(255), nullable=True)
    plan = Column(SmallInteger, nullable=False, default=1)
    created = Column(DateTime(timezone=True), server_default=func.now())
    modified = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


# Pydanticモデル: クライアントから受け取るユーザーデータの定義
class UserForm(BaseModel):
    mail: str
    pen_name: str
    real_name: str
    password: str
    zipcode: str
    prefectures: str
    municipalities: str
    town_name: str
    address: str
    obj: Optional[str] = None  # 任意項目


# JWT の秘密鍵は環境変数から取得する（.env からロードされる）
SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # トークン有効期限（分）


def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    """
    渡されたデータをペイロードに含む JWT トークンを生成する関数。
    expires_delta が指定されていなければデフォルトの有効期限を設定する。
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# FastAPI の依存性注入: 各リクエストごとに非同期DBセッションを生成
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


# APIRouter のインスタンスを生成し、ユーザー登録関連のルートを定義する
router = APIRouter()


@router.get("/user_regist")
async def read_root():
    """
    ユーザー登録用エンドポイントのテスト用GETメソッド。
    """
    return {"message": "Hello from FastAPI!"}


@router.post("/user_regist")
async def create_user(user: UserForm, db: AsyncSession = Depends(get_db)):
    """
    ユーザー登録エンドポイント。

    手順:
    1. 入力されたメールアドレスが既に使用されていないかチェックする。
    2. パスワードをbcryptでハッシュ化する。
    3. 新規ユーザーオブジェクトを作成し、データベースに保存する。
    4. コミット成功後、JWTトークンを生成して返す。

    エラー:
    - 既にメールが使用されている場合は HTTP 400 エラー。
    - その他のエラーの場合は HTTP 500 エラーを返す。
    """
    # 1. メール重複チェック
    query = select(User).where(User.mail == user.mail)
    result = await db.execute(query)
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="このメールは既に使われています")

    # 2. パスワードのハッシュ化
    hashed_pw = hash_password(user.password)

    # 3. 新規ユーザーオブジェクトの作成
    new_user = User(
        mail=user.mail,
        pen_name=user.pen_name,
        real_name=user.real_name,
        password=hashed_pw,
        zipcode=user.zipcode,
        prefectures=user.prefectures,
        municipalities=user.municipalities,
        town_name=user.town_name,
        address=user.address,
        obj=user.obj,
        plan=1  # デフォルトは無課金プラン
    )

    # 4. DB セッションに追加
    db.add(new_user)
    try:
        # 5. コミットして変更を確定し、新規ユーザーの最新状態を取得
        await db.commit()
        await db.refresh(new_user)
    except Exception as e:
        await db.rollback()
        logging.error("Error in create_user: %s", str(e))
        raise HTTPException(status_code=500, detail="サーバーエラーが発生しました")

    # 6. JWT トークンを生成（ユーザーIDをペイロードに含む）
    access_token = create_access_token(data={"user_id": new_user.id})

    # 7. 登録成功のレスポンスとして、ユーザーIDと生成したトークンを返す
    return {
        "success": True,
        "message": "User created successfully",
        "user_id": new_user.id,
        "session": access_token
    }
