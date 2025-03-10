FROM node:20-alpine as third-party-ext
RUN apk add python3 g++ make
WORKDIR /extensions
ADD extensions .
RUN npm install
# Move all extensions the starts with directus-extension-, using find, to the /extensions/directus folder
RUN mkdir -p ./directus
RUN cd node_modules && find . -maxdepth 1 -type d -name "directus-extension-*" -exec mv {} ../directus \;

FROM directus/directus:11.4.1
# Copy third party extensions
COPY --from=third-party-ext /extensions/directus ./extensions