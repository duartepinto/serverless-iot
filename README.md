# Serverless architectural design for IoT systems

1. 
```
$ git clone https://github.com/openfaas/faas && \
  cd faas && \
  git checkout 0.7.1 && \
  ./deploy_stack.sh && \
  cd ..
```

2. Template for `my_rig_config.json`

``` json
{
    "name": "pi001",
    "maxCapacity": 1001,
    "thing": true
}
```
