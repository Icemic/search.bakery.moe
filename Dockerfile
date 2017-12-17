FROM node:8-alpine

COPY . .
RUN yarn install && yarn run client-build
EXPOSE 3000

CMD ["yarn", "run", "server-prod"]
