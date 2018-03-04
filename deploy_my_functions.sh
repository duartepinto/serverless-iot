#! /bin/bash
sudo faas-cli build -f server/func_light.yml
sudo faas-cli build -f thing/read_value.yml


faas-cli deploy -f server/func_light.yml
faas-cli deploy -f thing/read_value.yml
