FROM node:0.12
MAINTAINER Killian Kemps

#RUN apt-get update
#RUN apt-get install -y curl

# Install nvm for NodeJS
#RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.4/install.sh | bash
#RUN export NVM_DIR="/root/.nvm"
#RUN [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
#
## Install NodeJS v0.12 via nvm
#RUN nvm install v0.12
#RUN nvm use v0.12

RUN mkdir /var/app

# Fails here as it only copies the Dockerfile
COPY * /var/app/

WORKDIR /var/app/

RUN cd /var/app/ && ls

RUN npm install

RUN npm install -g forever

EXPOSE 8080

CMD ["forever", "-l forever.log -ao stdout.log -e stderr.log start server.js"]
