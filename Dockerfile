FROM node:alpine

WORKDIR /usr/app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 8181

CMD ["npm", "run", "dev"]