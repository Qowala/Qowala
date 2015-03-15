Qowala live
===========

Qowala live is a Twitter client that can track tweets with specified hashtags. You can get the frequency of each hashtags and the percentage of languages using the hashtags.

### Qowala live v0.3 functionalities:

- Multi-client with Twitter authentication
- Display user's timeline
- Display all user's lists
- Track tweets according hashtags
- See tweets statistics : number of tweets per min and proportion of tweets languages
- Stop and play the stream

![Qowala live Screenshot](http://www.killiankemps.fr/data/images/screenshot_qowala-live_v0_3.png)

### How to install Qowala live

- Rename **config/template_twitter.json** to **config/twitter.json** and put in your Twitter credentials (you can get the credentials on *Twitter Developer Website* at http://apps.twitter.com after creating your own app).

![Twitter App Manager](https://lut.im/qAlAvLX3/hYTfULdb)

- For the callback URL in **config/twitter.json** you have to put the domain name where the app will be hosted and add to it '/auth/twitter/callback'.

##### Ubuntu 14.04 process:
- Automatically: You can just launch the **KoalasLiveTweet_InstallationScript.sh**, it will do automatically what is below
- Manually: Follow below instructions

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
    
###### Run the app
    nodejs app.js
    
    
*NodeJS installation process inspired by Digital Ocean: https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-an-ubuntu-14-04-server*

*MongoDB installation process inspired by MongoDB.org http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/*

#### To develop
The recommanded way to launch the app for development is to use **Vagrant**.

In the Qowala live's directory do

    vagrant up
    
Make sure that **MongoDB** and **NodeJS** are installed (follow instructions above).

Then run
    
    vagrant ssh
    cd /vagrant/
    npm install
    node app.js
    
You will then be able to access the client in your browser at **http://192.168.12.34:8080/**

# Project released under MIT License

The MIT License (MIT)

Copyright (c) 2015 Killian Kemps

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
