# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.network "private_network", ip: "192.168.12.34"
  
  config.vm.provision "shell", path: "vagrant-installation.sh"

  # config.vm.provision "shell", inline: "nodejs /vagrant/server.js",
  #   run: "always"

end
