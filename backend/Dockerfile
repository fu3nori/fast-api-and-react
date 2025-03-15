# ベースイメージの指定
FROM python:3.10-slim

# 作業ディレクトリの設定
WORKDIR /app

# 依存パッケージリスト（requirements.txt）をコピー
COPY requirements.txt .

# pip のアップグレードと依存パッケージのインストール
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# アプリケーションコードのコピー
COPY . .

# サーバーの起動（例: uvicorn を利用）
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--log-level", "debug"]
