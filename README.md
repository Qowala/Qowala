KoalasLiveTweet
===============

KoalasLiveTweet is a Twitter client to track tweets with specified hashtags. You can get the frequency of each hashtags and the percentage of languages using the hashtags.

## How to use 
To use the KoalasLiveTweet, rename **config/template_twitter.json** to **config/twitter.json** and put in your Twitter credentials (you can get the credentials on *Twitter Developer Website*).

The recommanded way to launch the app is to use **Vagrant**.

In the KoalasLiveTweet's directory do

    vagrant up
    
Make sure that **MongoDB** and **NodeJS** are installed.

Then run

    cd /vagrant/
    npm install
    node app.js
    
You will then be able to access the client in your browser at **http://192.168.12.34:8080/**