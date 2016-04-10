#!/bin/bash

# The MIT License (MIT)
#
# Copyright (c) 2015 Killian Kemps
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

###############################
#
# This script was meant to be used with Ubuntu 14.04 Trusty
# This script will install what is required for Qowala live then install the Twitter app
#
# The components installation process was being inspired by Digital Ocean tutorial accessible at : https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-an-ubuntu-14-04-server
#
################################

# Get the servers IP adress
ipadress=$(ip addr show eth0 | grep inet | awk '{ print $2; }' | sed 's/\/.*$//' | head -n 1)

echo "*******************************************************************************"
echo "***                       Qowala Installation Script                        ***"
echo "*******************************************************************************"
echo "This script will try to install MongoDB, NodeJS and its modules."
echo "It will then download and install Qowala so you will be able to access it at (you will set the domain name during the installation) :

"

echo '	http://'$ipadress'/:8080' '

'

read -p 'Do you want to launch the installation script ? [Y/n] : ' ifInstall

if [ $ifInstall = "Y" ] || [ $ifInstall = 'y' ]
	then

		sudo apt-get update

		# Install NodeJS
		curl -sL https://deb.nodesource.com/setup | sudo bash -
		sudo apt-get install -y nodejs
		sudo apt-get install -y build-essential

		# Install MongoDB
		sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
		echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
		sudo apt-get update
		sudo apt-get install -y mongodb-org

		sudo npm install

		# Install forever for reliability of the server
		sudo npm install -g forever

		echo "*******************************************************************************"
		echo "***                       Qowala Installation Script                        ***"
		echo "*******************************************************************************"
		echo "We will now configure your Twitter app.
		"
		echo "1) If you haven't done it before, first create a Twitter account at www.twitter.com"
		echo "2) Then, become a Twitter developer by going on dev.twitter.com."
		echo "3) Finally, create a Twitter application with the name you want. You should now have your Consumer Token and Consumer Secret.

		"

		read -p 'What is your Consumer Token ? (Use Ctrl+Shift+V to paste into the terminal, be careful that there is no space before your Token) : ' consumerKey
		read -p 'What is your Consumer Secret ? : ' consumerSecret

		echo "One last information needed,"
		read -p 'What is the domain name of the server ? : ' domainName

		# Creating the twitter configuration file
		sudo echo '{"consumerKey" : "'$consumerKey'",'' "consumerSecret" : "'$consumerSecret'", "callbackURL": "http://'$domainName':8080/auth/twitter/callback"}' >> config/twitter.json

		# Launch the application
		sudo forever -l forever.log -ao stdout.log -e stderr.log start app.js

		# Display end message
		message='Your Qowala installation is ready to be used at : http://'

		echo "*******************************************************************************"
		echo "***                        Qowala Installation Script                       ***"
		echo "*******************************************************************************"
		echo ""
		echo $message$domainName'/:8080'
		echo "If they are errors, check the stderr.log file"

	else
		echo "Okay, good bye !"
fi
