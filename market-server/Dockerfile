# #build::: docker build -t market-server:dev .
# #run::: docker run -d -p 8000:8000 market-server:dev

FROM node:20.10
WORKDIR /usr/src/app

# Assuming Dockerfile is in the root of `market-server`
COPY . .
COPY ./docs/market-pro.db /usr/src/app/docs/market-pro.db

# Install dependencies
RUN npm install

# Rebuild sqlite3 specifically for the container environment
# RUN npm rebuild sqlite3 --build-from-source

EXPOSE 8000
CMD [ "node", "server/server.js" ]


