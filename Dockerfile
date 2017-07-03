FROM node:argon

RUN mkdir /app
RUN apt-get update \
&& apt-get install -qq libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++

WORKDIR /app

COPY package.json /app
RUN npm install
RUN npm install --save paper-jsdom-canvas 

COPY . /app

EXPOSE 3000

CMD ["npm", "start"]
