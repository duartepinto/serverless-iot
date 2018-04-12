# Log
This log is used to keep track of decisions that were made

1. Because I could not figure out how use Kubernetes I've decided to use Docker Swarm instead.
2. 03/03/2018 - Followed this tutorial: https://github.com/openfaas/faas/blob/master/guide/deployment_k8s.md
3. There is a script to deploy the functions
4. There is a script to gather the information from the yml files
5. To get metrics about each of the running functions I used the already available metrics through Prometheus. Available metrics:
    * gateway_functions_seconds -
        * gateway_functions_seconds_bucket- 
        * gateway_functions_seconds_sum - Sum of the times of all the invocations
        * gateway_functions_seconds_count - Number of invocations of the function (similiar to gateway_function_invocation_total)
    * gateway_function_invocation_total - Number of invocations of the function
    * gateway_service_count - Number of replicas for each available for each function
* To keep metrics about functions running on the cloud I've used a MongoDB. Implementation based on this https://github.com/alexellis/mongodb-function

