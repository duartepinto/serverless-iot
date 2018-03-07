#! /bin/bash

#COPY CONFIGURATION FILES
echo 'Copying config files to ./thing/middleware/'
cp my_functions.json ./thing/middleware/
cp ./my_rig_config.json ./thing/middleware/

#BUILD FUNCTIONS
sudo faas-cli build -f server/func_light.yml
#sudo faas-cli build -f thing/read_value.yml


#DEPLOY FUNCTIONS
faas-cli deploy -f server/func_light.yml
#faas-cli deploy -f thing/read_value.yml
