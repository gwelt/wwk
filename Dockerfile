FROM node:alpine
WORKDIR /code
COPY . /code
RUN npm install
EXPOSE 3000
CMD ["npm","start"]
