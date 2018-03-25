FROM node:alpine
WORKDIR /code
COPY . /code
RUN npm install
ENV PORT 80
EXPOSE 80
CMD ["npm","start"]
