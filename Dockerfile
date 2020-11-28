FROM node:lts
ENV PORT=8000
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN npm i
RUN npm run build
USER node
EXPOSE 8000
CMD ["npm", "start"]
