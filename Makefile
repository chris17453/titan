

build:
	@docker-compose build

run:
	@docker-compose  up

stop:
	@docker-compose down

local:
	@python app/app.py