module.exports = {
  mongo: {
    host: '172.17.0.1',
    port: 27017,
    name: 'search',
  },
  redis: {
    sessiondb: 0,
    memorizedb: 1,
    host: '172.17.0.1',
    port: 6379
  },
  port: 3000
};
