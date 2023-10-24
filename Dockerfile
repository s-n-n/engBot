FROM node:14-slim

WORKDIR /app

COPY ./package*.json /app/
RUN npm install --production
COPY ./ /app

ENTRYPOINT ["npm", "run", "start"]
