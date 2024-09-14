# Use the official Node.js image from Docker Hub
FROM node:22.5.1

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install --omit=dev

# Copy the entire project into the container's working directory
COPY . .

# Expose the port your app runs on (usually 3000 or 8080)
EXPOSE 8080

# Command to start the application
CMD ["node", "server.js"]
