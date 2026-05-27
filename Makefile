.PHONY: start test

start:
	uvx things-api &
	python3 server.py

test:
	node test.js
