# mysql/Dockerfile
FROM mysql:8.0

# MySQLに渡す初期設定
ENV MYSQL_ROOT_PASSWORD=abcd
ENV MYSQL_USER=user
ENV MYSQL_PASSWORD=abcd

# もしデフォルトで作りたいDBがあれば:
ENV MYSQL_DATABASE=tracker

EXPOSE 3306

# MySQLイメージではデフォルトCMDがmysqldなので不要だが明示
CMD ["mysqld"]
