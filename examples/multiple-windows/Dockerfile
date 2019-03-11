FROM oaklabs/oak:5.0.5

WORKDIR /app
COPY . /app

RUN npm i --engine-strict=true --progress=false --loglevel="error" \
    && npm cache clean --force

CMD ["/app"]

EXPOSE 9999
