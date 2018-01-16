FROM oaklabs/oak:4.1.2

WORKDIR /app
COPY . /app

RUN npm i --engine-strict=true --progress=false --loglevel="error" \
    && npm cache clean

CMD ["/app"]

EXPOSE 9999
