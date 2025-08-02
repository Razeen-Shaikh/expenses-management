@echo off

call npm ci --silent

call npm start --silent sample_input\input1.txt

call npm start --silent sample_input\input2.txt
