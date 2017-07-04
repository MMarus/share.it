FROM node:argon

RUN mkdir /app
WORKDIR /app

RUN apt-get update \
&& apt-get install -qq libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++

RUN echo pwd

COPY . /app

RUN npm install

RUN npm list

EXPOSE 3000

CMD ["npm", "start"]
