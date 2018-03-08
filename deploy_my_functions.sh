#! /bin/bash

#server = false
##while [ "$1" != "" ]; do
    ##PARAM=`echo $1 | awk -F= '{print $1}'`
    ##VALUE=`echo $1 | awk -F= '{print $2}'`
    ##case $PARAM in
        ##-s | --server)
            ##SERVER=true
            ##;;
        ##*)
            ##echo "ERROR: unknown parameter \"$PARAM\""
            ##usage
            ##exit 1
            ##;;
    ##esac
    ##shift
##done

#COPY CONFIGURATION FILES
echo 'Copying config files to ./thing/middleware/'
cp my_functions.json ./thing/middleware/
cp ./my_rig_config.json ./thing/middleware/

#BUILD FUNCTIONS
sudo faas-cli build -f server/func_light.yml

#if [ "$server" = false ];
if [ "$1" != "--server" ];
then
    sudo faas-cli build -f thing/middleware.yml
fi


#DEPLOY FUNCTIONS
faas-cli deploy -f server/func_light.yml
#if [ "$server" = false ] ;
if [ "$1" != "--server" ];
then
    faas-cli deploy -f thing/middleware.yml
fi


