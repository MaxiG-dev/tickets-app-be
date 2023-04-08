FROM node:alpine

COPY . .

RUN yarn install

EXPOSE 3000

CMD ["yarn", "start:prod"]