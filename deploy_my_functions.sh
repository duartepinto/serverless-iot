#! /bin/bash

DEV=false
SERVER=false
CACHE=true

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -s|--server)
    SERVER=true
    shift # past argument
    ;;
    --no-cache)
    CACHE=false
    shift # past argument
    ;;
    *)    # unknown option
    print >&2 "Usage: $0 [-d|--development-mode] [-s|--sample-functions] "
    exit 1;;
    #:  ) echo "Missing option argument for -$OPTARG" >&2;
        #exit 1;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters


# CREATING SYMLINKS FOR DEV
echo Creating symlinks for sample-functions
rm ./sample-functions/func_light/my_rig_config.json
rm ./sample-functions/func_heavy/my_rig_config.json
rm ./sample-functions/func_super_heavy/my_rig_config.json
rm ./sample-functions/func_obese_heavy/my_rig_config.json
ln -s ../../my_rig_config.json ./sample-functions/func_light/my_rig_config.json
ln -s ../../my_rig_config.json ./sample-functions/func_heavy/my_rig_config.json
ln -s ../../my_rig_config.json ./sample-functions/func_super_heavy/my_rig_config.json
ln -s ../../my_rig_config.json ./sample-functions/func_obese_heavy/my_rig_config.json

echo Creating symlinks for proxy functions 
rm ./proxy/proxy/my_functions.json
rm ./proxy/proxy/my_rig_config.json
rm ./proxy/weight_scale/my_functions.json
rm ./proxy/weight_scale/my_rig_config.json
rm ./proxy/insert_duration/my_functions.json
rm ./proxy/insert_duration/my_rig_config.json
rm ./proxy/get_duration/my_functions.json
rm ./proxy/get_duration/my_rig_config.json
ln -s ../../my_rig_config.json ./proxy/proxy/my_rig_config.json
ln -s ../../.config/my_functions.json ./proxy/proxy/my_functions.json
ln -s ../../my_rig_config.json ./proxy/weight_scale/my_rig_config.json
ln -s ../../.config/my_functions.json ./proxy/weight_scale/my_functions.json
ln -s ../../my_rig_config.json ./proxy/insert_duration/my_rig_config.json
ln -s ../../.config/my_functions.json ./proxy/insert_duration/my_functions.json
ln -s ../../my_rig_config.json ./proxy/get_duration/my_rig_config.json
ln -s ../../.config/my_functions.json ./proxy/get_duration/my_functions.json

#BUILD FUNCTIONS
if [ "$CACHE" = true ];
then
    sudo faas-cli build -f ./sample-functions/stack.yml
else
    sudo faas-cli build -f ./sample-functions/stack.yml --no-cache
fi

if [ "$SERVER" = false ];
then
    if [ "$CACHE" = true ];
    then
        sudo faas-cli build -f proxy/proxy.yml 
        sudo faas-cli build -f proxy/weight_scale.yml 
        sudo faas-cli build -f proxy/insert_duration.yml 
        sudo faas-cli build -f proxy/get_duration.yml 
    else
        sudo faas-cli build -f proxy/proxy.yml --no-cache
        sudo faas-cli build -f proxy/weight_scale.yml --no-cache
        sudo faas-cli build -f proxy/insert_duration.yml --no-cache
        sudo faas-cli build -f proxy/get_duration.yml --no-cache
    fi
fi

#DEPLOY FUNCTIONS
faas-cli deploy -f ./sample-functions/stack.yml

if [ "$SERVER" = false ];
then
    faas-cli deploy -f proxy/proxy.yml
    faas-cli deploy -f proxy/weight_scale.yml
    faas-cli deploy -f proxy/insert_duration.yml
    faas-cli deploy -f proxy/get_duration.yml
fi
