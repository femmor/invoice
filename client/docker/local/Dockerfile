ARG NODE_VERSION=18.16.0

# Node version - base image
FROM node:${NODE_VERSION}-alpine as base

ARG APP_HOME=/app

WORKDIR ${APP_HOME}

COPY package*.json ./

RUN npm install

COPY . ${APP_HOME}

CMD ["npm", "start"]