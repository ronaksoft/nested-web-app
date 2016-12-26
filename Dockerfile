FROM registry.ronaksoftware.com/base/node:6

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y python2.7 && apt-get install -y python-pip

# Install app dependencies
RUN npm install -g gulp bower && npm i node-sass &&  npm rebuild node-sass
EXPOSE 80

