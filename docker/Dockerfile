FROM node:7

MAINTAINER Ivan Shumkov <ivan@shumkov.ru>

RUN npm i -g grpc-everywhere pm2

COPY configs /etc/grpc-everywhere
RUN mkdir /etc/grpc-everywhere/services /var/log/grpc-everywhere

VOLUME /var/log/grpc-everywhere
VOLUME /etc/grpc-everywhere/services

EXPOSE 50051

CMD ["pm2-docker", "/etc/grpc-everywhere/pm2.yml"]