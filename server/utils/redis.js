const Redis = require('ioredis');

let redis = null;

module.exports = {
  init(options) {
    redis = new Redis(options);

    this.config = {
      enableMemorize: true
    }
  },
  // 根据请求参数缓存，返回相同的内容
  memorize(func, alterFunc) {
    if (process.env.NODE_ENV === 'production') {
      return async (ctx, next) => {
        const key = `cache:${ctx.method}|${ctx.request.path}:${ctx.querystring}|${ctx.request.rawBody}`;
        const stored = await redis.get(key);
        if (stored) {
          Object.assign(ctx, JSON.parse(stored));
          alterFunc && await alterFunc(ctx, next);
        } else {
          await func(ctx, next);
          const data = {
            status: ctx.status,
            body: ctx.body
          };
          await redis.set(key, JSON.stringify(data), 'EX', (604800 * Math.random()) << 0);
        }
      }
    } else {
      return func;
    }
  },
  // 在一定时间内，相同的ip和UA将返回相同的内容
  limitFrequency(func, alterFunc) {
    if (process.env.NODE_ENV === 'production') {
      return async (ctx, next) => {
        const key = `limitFreq:${ctx.method}|${ctx.request.path}:${ctx.ip.replace(/:/g, "_")}:${ctx.querystring}|${ctx.request.rawBody}`;
        const stored = await redis.get(key);
        if (stored) {
          Object.assign(ctx, JSON.parse(stored));
          alterFunc && await alterFunc(ctx, next);
        } else {
          await func(ctx, next);
          const data = {
            status: ctx.status,
            body: ctx.body
          };
          await redis.set(key, JSON.stringify(data), 'EX', 120);
        }
      }
    } else {
      return func;
    }
  },
  // 在一定时间内，相同的请求将返回相同的内容
  limitFrequencyPure(func, alterFunc) {
    if (process.env.NODE_ENV === 'production') {
      return async (ctx, next) => {
        const key = `limitFreq:${ctx.method}|${ctx.request.path}:${ctx.querystring}|${ctx.request.rawBody}`;
        const stored = await redis.get(key);
        if (stored) {
          Object.assign(ctx, JSON.parse(stored));
          alterFunc && await alterFunc(ctx, next);
        } else {
          await func(ctx, next);
          const data = {
            status: ctx.status,
            body: ctx.body
          };
          await redis.set(key, JSON.stringify(data), 'EX', 120);
        }
      }
    } else {
      return func;
    }
  },
  getInstance: () => redis,
  async storeKeywords(keywords) {
    for (const keyword of keywords) {
      await redis.zincrby('keywords', 1, keyword);
    }
  }
}
