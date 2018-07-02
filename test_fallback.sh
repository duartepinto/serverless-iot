#!/bin/bash

LOCAL_IP="127.0.0.1:8080"
N=1

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -n)
    N="$2"
    shift # past argument
    shift # past value
    ;;
    *)    # unknown option
    print >&2 "Usage: $0 [-n number of cicles for the test] "
    exit 1;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters




for i in `seq 2 $N`
    do
        curl -s -w "\n$i time_total: %{time_total}\n" "http://$LOCAL_IP/function/proxy" -d '{"func":"func_heavy", "data":{"value": false}}'

        if [ $i -eq "50" ]; then
            nmcli radio wifi off;
        fi;
    done


nmcli radio wifi on
