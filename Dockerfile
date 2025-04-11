FROM node:18

WORKDIR  /sentinel

COPY package*.json ./

COPY . .
RUN npm install

EXPOSE 3000


CMD [ "npm","run", "start" ]