const Redis = require('ioredis');

let redis = null;

module.exports = {
  init(options) {
    redis = new Redis(options);

    this.config = {
      enableMemorize: true
    }
  },
  memorize(func) {
    return func
    return async (ctx, next) => {
      if (this.config.enableMemorize) {

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
          await redis.set(key, JSON.stringify(data), 'EX', (604800 * Math.random()) << 0);
        }

      } else {
        await func(ctx, next);
      }
    }
  }
}
