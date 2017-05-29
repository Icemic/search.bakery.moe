const fs = require('fs');
const path = require('path');
const klaw = require('klaw');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const static = require('koa-static');
const mount = require('koa-mount');
const log4js = require('log4js');
const through2 = require('through2');
const mongoose = require('mongoose');
const redis = require('./utils/redis');


const CONFIG = require('./config/config');

// init logger

//console log is loaded by default, so you won't normally need to do this
// log4js.loadAppender('console');
log4js.loadAppender('file');
// log4js.addAppender(log4js.appenders.console());
const date = new Date();
log4js.addAppender(log4js.appenders.file(path.resolve(__dirname, `logs/${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.log`)));

const logger = log4js.getLogger('Core');
logger.setLevel('Debug');

// logger.trace('Entering cheese testing');
// logger.debug('Got cheese.');
// logger.info('Cheese is Gouda.');
// logger.warn('Cheese is quite smelly.');
// logger.error('Cheese is too ripe!');
// logger.fatal('Cheese was breeding ground for listeria.');

logger.info('Server starting...');

(async () => {

  const app = new Koa();

  mongoose.Promise = global.Promise;
  mongoose.connect(`mongodb://${CONFIG.mongo.host}:${CONFIG.mongo.port}/${CONFIG.mongo.name}`);
  logger.info(`Connected to main database ${CONFIG.mongo.name}`);

  redis.init({
    host: CONFIG.redis.host,
    port: CONFIG.redis.port,
    db: CONFIG.redis.memorizedb
  });
  logger.info(`Connected to cache database redis-${CONFIG.redis.memorizedb}`);

  // install middlewares

  const Traffic = log4js.getLogger('Traffic');
  const Unhandled = log4js.getLogger('Unhandled');
  app.use(async (ctx, next) => {
    const startTime = Date.now();
    try {
      await next();
    } catch (e) {
      Unhandled.error(e.stack);
      // ctx.app.emit('error', e, ctx);
    }
    const deltaTime = Date.now() - startTime;
    if (ctx.status < 400) {
      Traffic.info(`${ctx.method.toUpperCase()} ${ctx.url} ${ctx.status} ${deltaTime}ms`);
    } else if (ctx.status < 500) {
      Traffic.warn(`${ctx.method.toUpperCase()} ${ctx.url} ${ctx.status} ${deltaTime}ms`);
    } else {
      Traffic.error(`${ctx.method.toUpperCase()} ${ctx.url} ${ctx.status} ${deltaTime}ms`);
    }
  });

  // 
  app.use(mount('/dist', static(path.resolve(__dirname, '../client/dist'))))
  app.use(mount('/static', static(path.resolve(__dirname, '../client/static'))))
  app.use(bodyParser());

  // auto-load routes
  const routeList = [];
  const excludeDirFilter = through2.obj(function (item, enc, next) {
    if (item.path.endsWith('.js')) this.push(item);
    next();
  });

  const rootRouter = new Router()
  await new Promise((resolve, reject) => {
    klaw(path.resolve(__dirname, 'routes'))
    .pipe(excludeDirFilter)
    .on('data', item => {
      const router = require(item.path);
      const routerName = path.basename(item.path, '.js');
      if (router instanceof Router) {
        rootRouter.use(`/${path.basename(item.path, '.js').replace('.', '/')}`, router.routes(), router.allowedMethods());
        logger.info(`Load route ${routerName} success`);
      } else {
        logger.warn(`Load route ${routerName} failed, invalid router.`);
      }
    })
    .on('error', reject)
    .on('end', resolve);
  });
  app.use(rootRouter.routes()).use(rootRouter.allowedMethods());

  app.use(async (ctx) => {
    ctx.status = 404;
    ctx.body = `404 Not Found!\n${ctx.method.toUpperCase()} ${ctx.url}`;
  });

  app.listen(CONFIG.port);

  logger.info(`Server is running at port ${CONFIG.port}`);

})();
