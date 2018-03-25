FROM node:alpine
WORKDIR /code
COPY . /code
RUN npm install
<<<<<<< HEAD
ENV PORT 80
EXPOSE 80
=======
EXPOSE 3000
>>>>>>> d221553196a138776152be2e2674658cbd750edf
CMD ["npm","start"]
