
#FROM node:4
FROM mhart/alpine-node:4

MAINTAINER cisco

# default node-red version
ARG NODERED_VERSION=0.13.4

# upgrade OS packages
RUN apk upgrade \
  && apk update --repository http://dl-3.alpinelinux.org/alpine/edge/community/ \
  && apk add --update --repository http://dl-3.alpinelinux.org/alpine/edge/community/ \
  bash unzip python util-linux curl make g++

# ensure npm is at v2 && install node-red
RUN npm install -g npm@2.x && npm install -g --unsafe-perm node-red@${NODERED_VERSION}

# copy entrypoint, config, and code updates
COPY ./entry.sh /
COPY ./config/ /flowstudio
COPY ./csc-node-red/v${NODERED_VERSION} /usr/lib/node_modules/node-red

RUN chmod +x /entry.sh

# expose port
EXPOSE 1880

ENTRYPOINT ["/entry.sh"]
