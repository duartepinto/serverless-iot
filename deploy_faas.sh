#! /bin/bash
cd faas
sudo sh deploy_stack.sh 
cd ..

#REMOVE UNWANTED FUNCTIONS
faas-cli remove func_echoit
faas-cli remove func_wordcount
faas-cli remove func_base64
faas-cli remove func_markdown 
faas-cli remove func_hubstats


#CLEAN DOCKER
sudo docker system prune
# exit
