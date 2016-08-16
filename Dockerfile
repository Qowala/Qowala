FROM       node:0.12
MAINTAINER Killian Kemps

RUN        mkdir /var/app
COPY       qowala_app/package.json var/app/package.json

RUN        cd /var/app && npm install
RUN        npm install -g forever

COPY       qowala_app var/app/

WORKDIR    /var/app

EXPOSE     8080

ADD        docker/service-start.sh /
CMD        ["/service-start.sh"]
