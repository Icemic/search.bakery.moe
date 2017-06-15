const fs = require('fs');

const thenify = require('thenify');
const csvParse = thenify(require('csv-parse'));
const jieba = require('./jieba');

async function getIterator(ids, matrix) {
  const idData = fs.readFileSync(ids, 'utf8');
  const idList = await csvParse(idData, {
    auto_parse: true,
    comment: '#',
    delimiter: ',',
    trim: true,
    relax_column_count: true
  });

  const matrixData = fs.readFileSync(matrix, 'utf8');

  const featureMatrix = await csvParse(matrixData, {
    auto_parse: true,
    comment: '#',
    delimiter: ',',
    trim: true,
    skip_lines_with_empty_values: true
  });

  console.log(idList.length, featureMatrix.length)

  return loaderGenerator(idList, featureMatrix);
}

function *loaderGenerator(idList, featureMatrix) {
  for (const [i, idItem] of idList.entries()) {
    const [id, rank, type, episode, originTitle, hanTitle, aliasString = '', cover] = idItem;
    const _alias = [originTitle, hanTitle, ...aliasString.split('||')];

    const alias = [];
    for (const name of _alias) {
      try {
        if (name && name.trim()) {
          alias.push(name);
        }
      } catch (e) {
        alias.push(`${name}`);
      }
    }

    const vector = featureMatrix[i];
    const keywords = [...new Set(jieba.cutForSearch(alias.join(' ').toUpperCase(), true))];
    // vector.shift();
    yield {
      title: hanTitle || originTitle,
      alias,
      vector,
      keywords,
      rank,
      type,
      episode,
      cover,
      bgmid: id
    }
  }
}

module.exports = getIterator;
