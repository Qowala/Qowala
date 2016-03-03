### How to install Qowala

#### Qowala configuration
- Copy and rename **config/template_twitter.json** to **config/twitter.json** and put in your Twitter credentials (you can get the credentials on *Twitter Developer Website* at http://apps.twitter.com after creating your own app).

- Give your application Read & Write permissions on Twitter Application Management Dashboard

![Twitter App Manager](http://www.killiankemps.fr/data/images/qowala-live-twitter-settings.png)

- For the callback URL in **config/twitter.json** you have to put the domain name where the app will be hosted and add to it '/auth/twitter/callback'.

#### Qowala easy installation

Just launch the **Qowala-live_InstallationScript.sh**, it will do automatically what is below

#### Qowala manual installation

##### Ubuntu 14.04 process:

###### Install NodeJS
    curl -sL https://deb.nodesource.com/setup | sudo bash -
    sudo apt-get install nodejs
    sudo apt-get install build-essential

###### Install MongoDB
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
    echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org

###### Install the dependencies
    npm install

*NodeJS installation process inspired by Digital Ocean: https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-an-ubuntu-14-04-server*

*MongoDB installation process inspired by MongoDB.org http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/*

#### Qowala Simple Run
    nodejs server.js

#### Qowala Production mode
    sudo npm install -g forever
    forever -l forever.log -ao stdout.log -e stderr.log start server.js
