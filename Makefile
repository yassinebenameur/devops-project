install:
	npm i

test:	install
	jest

start:
	nodemon index.js
