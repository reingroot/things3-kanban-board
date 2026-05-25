.PHONY: start

start:
	uvx things-api &
	python3 server.py
