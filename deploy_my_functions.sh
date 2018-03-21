#! /bin/bash

DEV=false
SERVER=false
CACHE=true

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -d|--development-mode)
    DEV=true
    shift # past argument
    ;;
    -s|--server)
    SERVER=true
    shift # past argument
    ;;
    --no-cache)
    CACHE=false
    shift # past argument
    shift # past value
    ;;
    *)    # unknown option
    print >&2 "Usage: $0 [-d|--development-mode] [-s|--server] "
    exit 1;;
    #:  ) echo "Missing option argument for -$OPTARG" >&2;
        #exit 1;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters


# CREATING SYMLINKS FOR DEV
if [ "$DEV" = true ];
then
    echo Creating symlinks for server
    rm ./server/func_light/my_rig_config.json
    rm ./server/func_heavy/my_rig_config.json
    rm ./server/func_super_heavy/my_rig_config.json
    rm ./server/func_obese_heavy/my_rig_config.json
    ln -s ../../my_rig_config.json ./server/func_light/my_rig_config.json
    ln -s ../../my_rig_config.json ./server/func_heavy/my_rig_config.json
    ln -s ../../my_rig_config.json ./server/func_super_heavy/my_rig_config.json
    ln -s ../../my_rig_config.json ./server/func_obese_heavy/my_rig_config.json

    echo Creating symlinks for middleware
    rm ./thing/middleware/my_functions.json
    rm ./thing/middleware/my_rig_config.json
    ln -s ../../my_rig_config.json ./thing/middleware/my_rig_config.json
    ln -s ../../.config/my_functions.json ./thing/middleware/my_functions.json
fi

#BUILD FUNCTIONS
if [ "$CACHE" = true ];
then
    sudo faas-cli build -f server/func_light.yml
    sudo faas-cli build -f server/func_heavy.yml
    sudo faas-cli build -f server/func_super_heavy.yml
    sudo faas-cli build -f server/func_obese_heavy.yml
else
    sudo faas-cli build -f server/func_light.yml --no-cache
    sudo faas-cli build -f server/func_heavy.yml --no-cache
    sudo faas-cli build -f server/func_super_heavy.yml --no-cache
    sudo faas-cli build -f server/func_obese_heavy.yml --no-cache
fi

if [ "$SERVER" = false ];
then
    if [ "$CACHE" = true ];
    then
        sudo faas-cli build -f thing/middleware.yml 
    else
        sudo faas-cli build -f thing/middleware.yml --no-cache
    fi
fi

#DEPLOY FUNCTIONS
faas-cli deploy -f server/func_light.yml
faas-cli deploy -f server/func_heavy.yml
faas-cli deploy -f server/func_super_heavy.yml
faas-cli deploy -f server/func_obese_heavy.yml

if [ "$SERVER" = false ];
then
    faas-cli deploy -f thing/middleware.yml
fi


