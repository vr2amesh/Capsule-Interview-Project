module.exports = {
    networks: {
        development: {
            // host: "host.docker.internal",
            host: "127.0.0.1",
            port: 7545,
            network_id: "*"
        },
    },
    compilers: {
      solc: {
        version: "^0.8.0",
      },
    },
  };
  