FROM registry.ng.bluemix.net/ibmnode

ENV HOME /home/iot4i
RUN mkdir -p $HOME/iot4i-starter-app-backend
ADD . $HOME/iot4i-starter-app-backend
WORKDIR $HOME/iot4i-starter-app-backend

# Enhance default password rules, adding user 'iot4i' to avoid root privileges, running npm install
RUN sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS 90/' /etc/login.defs &&\
    sed -i 's/^PASS_MIN_DAYS.*/PASS_MIN_DAYS 1/' /etc/login.defs &&\
    sed -i 's/sha512/sha512 minlen=8/' /etc/pam.d/common-password &&\
    useradd --user-group --create-home --shell /bin/false iot4i &&\
    chown -R iot4i:iot4i $HOME/* &&\
    npm install

USER iot4i

EXPOSE 10010

CMD ["npm", "start"]
