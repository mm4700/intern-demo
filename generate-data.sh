#!/bin/bash
node --max_old_space_size=8192 --optimize_for_size --max_executable_size=4096 --stack_size=4096 ./data-generator.js
