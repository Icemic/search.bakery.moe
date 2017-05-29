const Redis = require('ioredis');

let redis = null;

module.exports = {
  init(options) {
    redis = new Redis(options);
  },
  memorize(func) {
    return func;
    return async (ctx, next) => {
      const key = `${ctx.method}|${ctx.request.path}|${ctx.querystring}|${ctx.request.rawBody}`;
      const stored = await redis.get(key);
      if (stored) {
        Object.assign(ctx, JSON.parse(stored));
      } else {
        await func(ctx, next);
        const data = {
          status: ctx.status,
          body: ctx.body
        };
        await redis.set(key, JSON.stringify(data), 'EX', 604800);
      }
    }
  }
}
