# Serverless architectural design for IoT systems

## Prerequisites
1. Install Docker CE for Ubuntu [here](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
## Setup

1. 
```
$ git clone https://github.com/openfaas/faas && \
  cd faas && \
  git checkout 0.7.1 && \
  ./deploy_stack.sh && \
  cd ..
```

1. 
```
$ curl -sSL https://cli.openfaas.com | sh
```

2. Template for `my_rig_config.json`

``` json
{
    "name": "pi001",
    "maxCapacity": 1001,
    "thing": true
}
```

3. 

```
$ sh ./deploy_faas.sh
```
4. 

```
$ sh ./deploy_my_functions.sh
```
