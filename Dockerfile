FROM node:6

# Override for non-production image with docker build --build-arg NODE_ENV=dev .
ARG NODE_ENV=production
ARG PORT=10050
ENV NODE_ENV ${NODE_ENV}
ENV PORT ${PORT}

ENV APP_HOME $HOME/node/app/

# Enhance default password rules
RUN sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS 90/' /etc/login.defs &&\
    sed -i 's/sha512/sha512 minlen=8/' /etc/pam.d/common-password &&\
    mkdir -p $APP_HOME &&\
    # Get node inspector for remote debugging
    npm install -g node-inspector

WORKDIR $APP_HOME

# Could be doing tricks with volumes to minimize rebuild times, but going with
# keeping dependencies built in a separate layer so it will not be rebuild on
# regular changes. Should have npm-shrinkwrap.json included below as well, but
# it is not working with private registry

COPY package.json $APP_HOME
RUN npm install

ADD . $APP_HOME

# remove .npmrc
RUN rm -f .npmrc

USER node

EXPOSE $PORT
CMD ["npm", "start"]
