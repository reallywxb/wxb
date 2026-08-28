FROM nginx
VOLUME /tmp
ENV LANG en_US.UTF-8
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
  echo 'Asia/Shanghai' >/etc/timezone
ADD dist/ /usr/share/nginx/html/spd
ADD bi-dist/ /usr/share/nginx/html/spd-bi
ADD 404.html /usr/share/nginx/html/404.html
ADD default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 443
