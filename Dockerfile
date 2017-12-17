FROM node:8

COPY . .
RUN yarn install && yarn run client-build
EXPOSE 3000

CMD ["yarn", "run", "server-prod"]
