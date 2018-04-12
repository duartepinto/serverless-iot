# Serverless architectural design for IoT systems

## Prerequisites
1. Install Docker CE for Ubuntu [here](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
2. Install faas-cli. Instructions [here](https://github.com/openfaas/faas-cli#get-started-install-the-cli)
3. Python3 installed with the yml module (this is used to create the configuration files)

## Basic Instalation 

1. Template for `my_rig_config.json`

``` json
{
    "name": "pi001",
    "maxCapacity": 1001,
    "thing": true,
    "localUrl": "http://192.168.78.1",
    "localPort": 8080,

    "serverUrl": "http://192.168.78.130",
    "serverPort": "8080",
    "prometheusPort":9090,
    "write_timeout": 10,
    "read_timeout": 10,
    "mongo": "openfaas-db-mongodb"

}
```
2. Clone the openfaas repository
``` sh
$ git clone https://github.com/openfaas/faas && \
  cd faas && \
  git checkout 0.7.7 && \
  cd ..
```
2. Initiate a docker swarm
``` 
$ sudo docker swarm init
```
In some cases, the flag _--advertise-addr_ might be needed to specify the advertised address.
    
3. Deploy faas and remove unnecessary functions that come preinstalled.
``` 
$ sh sudo ./deploy_faas.sh
```

4. Continue instalation process process for [IoT swarm](#inst_swarm_local) or [Cloud swarm](#inst_swarm_cloud)

### <a name="inst_swarm_local"></a> (Cont.) Instalation for local swarm (IoT)

1. Create a mongodb Docker Service
``` 
$ docker service create --network=func_functions --name openfaas-db-mongodb --publish 27017:27017 mongo mongod
```
2. Create configuration files 
``` 
$ python3 create_my_functions.py
```
3. Deploy my functions.

``` 
$ sh sudo ./deploy_my_functions.sh
```

### <a name="inst_swarm_cloud"></a> (Cont.) Instalation in the cloud swarm (Server)
1. Create configuration files 
``` 
$ python3 create_my_functions.py
```
2. Deploy my functions.

``` 
$ sh sudo ./deploy_my_functions.sh
```

