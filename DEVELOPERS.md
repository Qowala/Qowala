# Qowala configuration

- Copy and rename **config/template_twitter.json** to **config/twitter.json** and put in your Twitter credentials (you can get the credentials on *Twitter Developer Website* at http://apps.twitter.com after creating your own app).

- Give your application Read & Write permissions on Twitter Application Management Dashboard

![Twitter App Manager](http://www.killiankemps.fr/data/images/qowala-live-twitter-settings.png)

- For the callback URL in **config/twitter.json** you have to put the domain name where the app will be hosted and add to it '/auth/twitter/callback'.

# Qowala Development mode
Once the Qowala configuration done as written above, the recommended way to launch the app for development is to use **Vagrant**. No need to install Qowala Vagrant will do it for you.

In the Qowala's directory do

    vagrant up

Then access to the VM

    vagrant ssh

Move the directory containing your files

    cd /vagrant/

Start the server

    nodejs server.js

You will then be able to access the client in your browser at **http://192.168.12.34:8080/** (The IP address can be changed in the Vagrantfile)
