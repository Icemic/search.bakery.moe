const path = require('path');
const Router = require('koa-router');
const importer = require('../utils/import');
const Anime = require('../models/anime');

const route = new Router();

route.get('/import', async (ctx, next) => {
  const ids = path.resolve(__dirname, '../metaInfo.txt');
  const matrix = path.resolve(__dirname, '../trained_X.mat');
  const ite = await importer(ids, matrix);

  try {
    for (const item of ite) {
      await Anime.update({
        bgmid: item.bgmid
      }, item, {
        upsert: true,
        setDefaultsOnInsert: true
      });
    }
    ctx.body = 'success!';
  } catch (e) {
    ctx.status = 500;
    ctx.body = e.stack;
  }
});

module.exports = route;
