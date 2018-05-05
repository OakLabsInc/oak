FROM oaklabs/oak:4.2.3

WORKDIR /app
COPY . /app

RUN npm i --engine-strict=true --progress=false --loglevel="error" \
    && npm cache clean --force

CMD ["/app"]

EXPOSE 9999
