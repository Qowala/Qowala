FROM ubuntu
MAINTAINER Killian Kemps

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10 || true
RUN echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list

RUN apt-get update && apt-get install -y \
	build-essential \
	mongodb-org

EXPOSE 27017

CMD ["mongod"]
