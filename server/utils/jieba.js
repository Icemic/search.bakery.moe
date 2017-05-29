const path = require('path');
const nodejieba = require("nodejieba");

nodejieba.load({
  dict: path.resolve(__dirname, './SogouLabDic.dic'),
  userDict: path.resolve(__dirname, './japanese.dict.utf8')
});

module.exports = nodejieba;
