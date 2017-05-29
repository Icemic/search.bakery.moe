const path = require('path');
const Router = require('koa-router');
const Anime = require('../models/anime');
const jieba = require("../utils/jieba");
const redis = require('../utils/redis');

const route = new Router();

route.get('/cut', async (ctx, next) => {
  const result = jieba.cut(ctx.query.word, true)
  ctx.body = result.join(' ,');
});

route.get('/keywords', redis.memorize(async (ctx, next) => {
  const searchString = ctx.query.value;
  const cutString = [...new Set(jieba.cutForSearch(searchString.toUpperCase(), true))];

  const results = await Anime.find({
    keywords: { $in: cutString },
    // $or: [
    //   { title: /searchString/ },
    //   { keywords: { $in: cutString } }
    // ]
  });

  const list = [];
  for (const record of results) {
    const cutAlias = record.keywords;
    let total = [...new Set([...cutAlias, ...cutString])].length;
    list.push([cutString.length + cutAlias.length - total, record.title]);
  }

  const sortedList = list.sort((a, b) => b[0] - a[0]);

  ctx.body = sortedList.slice(0, 10)

}));

route.get('/similarity', redis.memorize(async (ctx, next) => {
  const bgmid = ctx.query.bgmid;

  const selfItem = await Anime.findOne({ bgmid });
  const targetItems = await Anime.find({ bgmid: { $ne: bgmid } }).select('bgmid vector');

  const selfVector = selfItem.vector;
  const similarities = targetItems.map((targetItem, i) => {
    const targetVector = targetItem.vector;
    const a = Math.sqrt(selfVector.reduce((prev, next) => prev + Math.pow(next, 2)));
    const b = Math.sqrt(targetVector.reduce((prev, next) => prev + Math.pow(next, 2)));

    const total = selfVector.reduce((prev, next, i) => prev + next * targetVector[i]);

    return [targetItem.bgmid, 0.5 + 0.5 * total / (a * b)];
  });

  const sorted = similarities.sort((a, b) => b[1] - a[1]).slice(0, 10);

  const sortedItems = await Anime.find({ bgmid: { $in: sorted.map(v => v[0]) } }).select('-vector -_id -keywords');

  ctx.body = {
    items: sortedItems,
    similarities: sorted.map(v => (v[1] * 100).toFixed(1))
  };

}));



module.exports = route;
