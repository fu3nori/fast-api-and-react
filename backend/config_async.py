# config_async.py
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# .env ファイルがある場合は読み込む
load_dotenv()

# 環境変数から接続情報を取得（デフォルト値も指定）
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "")
DB_NAME = os.getenv("DB_NAME", "tracker")

# 非同期用接続文字列（MySQLの場合、asyncmyを利用）
SQLALCHEMY_DATABASE_URL = f"mysql+asyncmy://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}?charset=utf8mb4"

# 非同期エンジンの作成
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True,  # ログ出力を有効にするか（必要に応じてFalseに変更）
    future=True
)

# 非同期セッションの生成用ファクトリ
AsyncSessionLocal = sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession
)
