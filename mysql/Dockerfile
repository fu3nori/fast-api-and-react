# mysql/Dockerfile
FROM mysql:8.0

# MySQLに渡す初期設定
ENV MYSQL_ROOT_PASSWORD=12345678
ENV MYSQL_USER=user
ENV MYSQL_PASSWORD=12345678

# もしデフォルトで作りたいDBがあれば:
# ENV MYSQL_DATABASE=my_database

EXPOSE 3306

# MySQLイメージではデフォルトCMDがmysqldなので不要だが明示
CMD ["mysqld"]
