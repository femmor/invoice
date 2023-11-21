# Dockerfile instructions

# Built in instructions
ARG NODE_VERSION=21-alpine3.18

# Node version - base image
FROM node:${NODE_VERSION}

# Label instructions - adds metadata to the image
LABEL name="mern-invoice"
LABEL license="MIT"
LABEL description="MERN invoice image"

# ENV instruction
ENV NODE_ENV=development

# Application home directory
ARG APP_HOME=/app

# Working directory
WORKDIR ${APP_HOME}

# Run docker container as non-root user - add a user (invoice) to the invoice group
RUN addgroup -S invoice \
    && adduser -S invoice -G invoice

# Copy the package json/lock file and install dependencies
COPY package*.json ./

# Run npm install
RUN npm install

# Change ownership of the user within the invoice group to working directory
COPY --chown=invoice:invoice . ${APP_HOME}

# Run the change ownership of the user within the invoice group
RUN chown invoice:invoice ${APP_HOME}

# Switch to the created user
USER invoice

# Start the development server
CMD ["npm", "run", "dev"]