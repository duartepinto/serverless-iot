# Serverless architectural design for IoT systems

## Prerequisites
1. Install Docker CE for Ubuntu [here](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
2. Install faas-cli. Instructions [here](https://github.com/openfaas/faas-cli#get-started-install-the-cli)
## Setup


1. Template for `my_rig_config.json`

``` json
{
    "name": "pi001",
    "maxCapacity": 1001,
    "thing": true,
    "localUrl": "http://192.168.78.1",
    "localPort": 8080,
    "serverUrl": "http://192.168.78.128",
    "serverPort": "8080"
}
```

2. Deploy faas and remove unnecessary functions that come preinstalled.

```
$ sh ./deploy_faas.sh
```
3. Deploy my functions.

```
$ sh ./deploy_my_functions.sh
```
