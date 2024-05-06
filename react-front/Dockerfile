## build:: docker image build -t market-front:dev .
## run:: docker run -d -p 3000:3000 market-front:dev
# docker run -d -p 3000:3000 market-front-new:test

# FROM node:20.10-alpine
# WORKDIR /react-front/

# COPY public/ /react-front/public
# COPY src/ /react-front//src
# COPY package.json /react-front/

# RUN npm install

# CMD ["npm", "start"]

# ===
FROM node:20.10-alpine
WORKDIR /react-front/

# Add ARG for backend URL
# ARG REACT_APP_BACKEND_URL

# Set the environment variable so that it is used during the build
# ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

COPY public/ /react-front/public
COPY src/ /react-front/src
COPY package.json /react-front/

RUN npm install
EXPOSE 3000

CMD ["npm", "start"]
# ===

# # Stage 1: Build the React application
# FROM node:20.10 AS build
# WORKDIR /app
# COPY package*.json ./

# COPY . .

# # Build the React app
# RUN npm run build

# # Stage 2: Serve the app using Node.js and the `serve` package
# FROM node:20.10

# # Install `serve` to serve the app. You can specify a version if needed.
# RUN npm install -g serve

# # Copy the build artifacts from the `build` stage
# COPY --from=build /app/build /app

# WORKDIR /app

# # Expose the port `serve` will run on
# EXPOSE 3000

# # Serve the app
# CMD ["serve", "-s", ".", "-l", "3000"]
