#! /bin/bash

DEV=false
example_functions=false
CACHE=true

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -d|--development-mode)
    DEV=true
    shift # past argument
    ;;
    -s|--example_functions)
    example_functions=true
    shift # past argument
    ;;
    --no-cache)
    CACHE=false
    shift # past argument
    shift # past value
    ;;
    *)    # unknown option
    print >&2 "Usage: $0 [-d|--development-mode] [-s|--example_functions] "
    exit 1;;
    #:  ) echo "Missing option argument for -$OPTARG" >&2;
        #exit 1;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters


# CREATING SYMLINKS FOR DEV
if [ "$DEV" = true ];
then
    echo Creating symlinks for example_functions
    rm ./example_functions/func_light/my_rig_config.json
    rm ./example_functions/func_heavy/my_rig_config.json
    rm ./example_functions/func_super_heavy/my_rig_config.json
    rm ./example_functions/func_obese_heavy/my_rig_config.json
    ln -s ../../my_rig_config.json ./example_functions/func_light/my_rig_config.json
    ln -s ../../my_rig_config.json ./example_functions/func_heavy/my_rig_config.json
    ln -s ../../my_rig_config.json ./example_functions/func_super_heavy/my_rig_config.json
    ln -s ../../my_rig_config.json ./example_functions/func_obese_heavy/my_rig_config.json

    echo Creating symlinks for proxy functions 
    rm ./proxy/proxy/my_functions.json
    rm ./proxy/proxy/my_rig_config.json
    rm ./proxy/weight-scale/my_functions.json
    rm ./proxy/weight-scale/my_rig_config.json
    ln -s ../../my_rig_config.json ./proxy/proxy/my_rig_config.json
    ln -s ../../.config/my_functions.json ./proxy/proxy/my_functions.json
    ln -s ../../my_rig_config.json ./proxy/weight-scale/my_rig_config.json
    ln -s ../../.config/my_functions.json ./proxy/weight-scale/my_functions.json
fi

#BUILD FUNCTIONS
if [ "$CACHE" = true ];
then
    sudo faas-cli build -f example_functions/func_light.yml
    sudo faas-cli build -f example_functions/func_heavy.yml
    sudo faas-cli build -f example_functions/func_super_heavy.yml
    sudo faas-cli build -f example_functions/func_obese_heavy.yml
else
    sudo faas-cli build -f example_functions/func_light.yml --no-cache
    sudo faas-cli build -f example_functions/func_heavy.yml --no-cache
    sudo faas-cli build -f example_functions/func_super_heavy.yml --no-cache
    sudo faas-cli build -f example_functions/func_obese_heavy.yml --no-cache
fi

if [ "$example_functions" = false ];
then
    if [ "$CACHE" = true ];
    then
        sudo faas-cli build -f proxy/proxy.yml 
    else
        sudo faas-cli build -f proxy/proxy.yml --no-cache
    fi
fi

#DEPLOY FUNCTIONS
faas-cli deploy -f example_functions/func_light.yml
faas-cli deploy -f example_functions/func_heavy.yml
faas-cli deploy -f example_functions/func_super_heavy.yml
faas-cli deploy -f example_functions/func_obese_heavy.yml

if [ "$example_functions" = false ];
then
    faas-cli deploy -f proxy/proxy.yml
fi
