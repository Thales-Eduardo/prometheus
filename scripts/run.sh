 test -d build && rm -rf build && yarn tsc && \
    node build/server.js || \
    yarn tsc && node build/server.js