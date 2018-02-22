import React from 'react'
import './footer.less';

export default class Footer extends React.PureComponent {
  render() {
    return (
      <footer>
        <p>相似度数据基于 bgm.tv 的 260 万用户评分使用机器学习获得</p>
        <p>简介抓取自 bgm.tv，遵循 CC-BY-SA，详见 <a href='https://bgm.tv/about/copyright'>Bangumi 版权声明</a></p>
        <p>Favicon made by <a href='http://www.freepik.com/'>Freepik</a> from <a href='http://www.flaticon.com/'>Flaticon</a> licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></p>
        <p>© 2017 bakery.moe</p>
      </footer>
    );
  }
}
