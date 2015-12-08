FROM ubuntu
MAINTAINER Killian Kemps

RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup | sudo bash -
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10 || true
RUN echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list

RUN apt-get update && apt-get install -y \
	nodejs \
	build-essential \
	mongodb-org

ADD . /home

WORKDIR /home

RUN npm install

EXPOSE 8080

CMD ["nodejs", "server.js"]

VOLUME ["/home"]