const path = require('path');
const Router = require('koa-router');
// const similarity = require( 'compute-cosine-similarity' );
const similarity = require('talisman/metrics/distance/cosine').similarity;
const {
  index,
  similarity: jsimilarity,
  distance
} = require('talisman/metrics/distance/jaccard');
const Anime = require('../models/anime');
const Star = require('../models/star');
const jieba = require("../utils/jieba");
const redis = require('../utils/redis');
const calc = require('../utils/calc');

const route = new Router();

route.get('/cut', async (ctx, next) => {
  const result = jieba.cut(ctx.query.word, true)
  ctx.body = result.join(' ,');
});

route.get('/keywords/:value', redis.memorize(async (ctx, next) => {
  const searchString = ctx.params.value;
  const page = parseInt(ctx.query.page) || 1;

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

    let maxDistance = 0;
    for (const alias of record.alias) {
      maxDistance = Math.max(maxDistance, jsimilarity(searchString, alias))
      // console.log(searchString, alias, maxDistance)
    }

    list.push([maxDistance * (cutString.length + cutAlias.length - total), record.title, record._id, record.bgmid]);
  }

  let ended = false;
  let ending = page * 10;

  if (list.length < (page - 1) * 10) {
    ended = true;
    ctx.body = { items: [], ended };
    return;
  } else if (list.length <= ending) {
    ended = true;
    ending = list.length;
  }

  const sortedList = list.sort((a, b) => b[0] - a[0]);

  const sortedIds = sortedList.slice((page - 1) * 10, ending).map(v => v[2]);
  const sortedBGMIds = sortedList.slice((page - 1) * 10, ending).map(v => v[3]);

  const sortedItems = await Anime.find({ _id: { $in: sortedIds } }).select('-vector -_id -keywords');

  ctx.body = {
    items: sortedItems.sort((a, b) => sortedBGMIds.indexOf(a.bgmid) - sortedBGMIds.indexOf(b.bgmid)),
    ended
  };

  next();

}), redis.limitFrequency(async (ctx, next) => {
  const searchString = ctx.params.value;
  await redis.storeKeywords(searchString.trim().split(/\s+/));
}));

route.get('/item/:bgmid', async (ctx, next) => {
  const bgmid = parseInt(ctx.params.bgmid);

  const item = await Anime.findOneAndUpdate({ bgmid }, { $inc: { "meta.views": 1 } }).select('-vector -_id -keywords');

  ctx.body = item;
});

route.post('/item/:bgmid/star/:bgmid2', redis.limitFrequency(async (ctx, next) => {
  const bgmid = parseInt(ctx.params.bgmid);
  const bgmid2 = parseInt(ctx.params.bgmid2);

  await Star.update({ base: bgmid, target: bgmid2 }, { $inc: { "amount": 1 } }, { upsert: true });

  ctx.body = {
    success: 1,
    message: ''
  };
}));

route.get('/similarity/:bgmid', redis.memorize(async (ctx, next) => {
  const bgmid = parseInt(ctx.params.bgmid);
  const page = parseInt(ctx.query.page) || 1;

  if (!bgmid) {
    ctx.body = {
      items: [],
      similarities: []
    }
    return;
  };

  const selfItem = await Anime.findOne({ bgmid });
  const targetItems = await Anime.find({ bgmid: { $ne: bgmid } }).select('bgmid vector');

  const selfVector = selfItem.vector;
  const similarityValues = targetItems.map((targetItem, i) => [targetItem.bgmid, similarity(targetItem.vector, selfVector)]);

  let ended = false;
  let ending = page * 10;

  if (similarityValues.length < (page - 1) * 10) {
    ended = true;
    ctx.body = { items: [], similarities: [], ended };
    return;
  } else if (similarityValues.length <= ending) {
    ended = true;
    ending = similarityValues.length;
  }

  const sorted = similarityValues.sort((a, b) => b[1] - a[1]).slice((page - 1) * 10, ending);
  const sortedIds = sorted.map(v => v[0]);
  const sortedSimValuePercentage = sorted.map(v => (v[1] * 100).toFixed(1));

  const sortedItems = await Anime.find({ bgmid: { $in: sortedIds } }).select('-vector -_id -keywords');
  const starsDocs = await Star.find({ base: bgmid, target: { $in: sortedIds } });

  let starsMap = {};
  for (const starDoc of starsDocs) {
    starsMap[starDoc.target] = starDoc.amount;
  }

  ctx.body = {
    items: sortedItems.sort((a, b) => sortedIds.indexOf(a.bgmid) - sortedIds.indexOf(b.bgmid)),
    similarities: sortedSimValuePercentage,
    stars: starsMap,
    bgmids: sortedIds,  // for cache
    ended
  };

}, redis.limitFrequencyPure(async (ctx, next) => {
  const bgmid = parseInt(ctx.params.bgmid);
  const { bgmids: sortedIds } = ctx.body;

  const sortedItems = await Anime.find({ bgmid: { $in: sortedIds } }).select('-vector -_id -keywords');
  const starsDocs = await Star.find({ base: bgmid, target: { $in: sortedIds } });

  let starsMap = {};
  for (const starDoc of starsDocs) {
    starsMap[starDoc.target] = starDoc.amount;
  }

  Object.assign(ctx.body, {
    items: sortedItems.sort((a, b) => sortedIds.indexOf(a.bgmid) - sortedIds.indexOf(b.bgmid)),
    stars: starsMap
  });
})));



module.exports = route;
