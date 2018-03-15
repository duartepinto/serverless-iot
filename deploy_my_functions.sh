#! /bin/bash

#COPY CONFIGURATION FILES
echo 'Copying config files to functions'
cp my_functions.json ./thing/middleware/
cp ./my_rig_config.json ./thing/middleware/

cp ./my_rig_config.json ./server/func_light/
cp ./my_rig_config.json ./server/func_heavy/
cp ./my_rig_config.json ./server/func_super_heavy/
cp ./my_rig_config.json ./server/func_obese_heavy/

#BUILD FUNCTIONS
sudo faas-cli build -f server/func_light.yml
sudo faas-cli build -f server/func_heavy.yml
sudo faas-cli build -f server/func_super_heavy.yml
sudo faas-cli build -f server/func_obese_heavy.yml

#if [ "$server" = false ];
if [ "$1" != "--server" ];
then
    sudo faas-cli build -f thing/middleware.yml
fi

#DEPLOY FUNCTIONS
faas-cli deploy -f server/func_light.yml
faas-cli deploy -f server/func_heavy.yml
faas-cli deploy -f server/func_super_heavy.yml
faas-cli deploy -f server/func_obese_heavy.yml

if [ "$1" != "--server" ];
then
    faas-cli deploy -f thing/middleware.yml
fi


