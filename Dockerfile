# Use a newer base Debian image
FROM debian:buster-slim

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Update and install dependencies
RUN apt-get update && apt-get install -y python make g++ curl \
    # Install Node.js
    && curl -fsSL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
    # Clean up
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Switching to root user
USER root

# Install app dependencies
COPY package.json /app
RUN npm install

# Bundle app source
COPY . /app

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define environment variable
ENV NAME World

# Run the application
CMD ["npm", "start"]
