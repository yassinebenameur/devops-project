FROM node:10-alpine
LABEL MAINTAINER  ="Yassine"
WORKDIR /app
COPY ["package.json","package-lock.json*","./"]
RUN npm install --silent
COPY . .
EXPOSE 8000
CMD ["nodemon","index.js"]