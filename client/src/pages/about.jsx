import React from 'react'
import './about.less';

export default class About extends React.PureComponent {
  render() {
    return (
      <main>
        <div className='aboutbox'>
          <article>
            <h3>使用说明</h3>
            <p>在主页唯一的输入框中输入动画的名称或关键字，查找到某个你喜欢的动画，算法将为你推荐你可能会喜欢的相似动画。</p>
            <p>「相似」的确切含义是「喜欢该动画的人大多也会喜欢」，相似性计算基于抓取自 bangumi.tv 的 260 万次用户评分，反应了中国<del>死</del>宅的主流偏好。</p>
            <p>目前，本站使用的动画评分数据截止至 2018 年 2 月 21 日，即 2018 年冬番播放期间。为保证有足够多的评分支持推荐算法，请查询 2018 年 1 月以前的动画获得相似推荐。正在放送或尚未放送的动画缺少足够的评分数据，无法保证结果的准确性。</p>
            <p>本项目为非营利性公益性质，API 可供其他非营利项目自由调用，若用于商业目的请联系我。严禁使用爬虫进行高频抓取，你想要数据直接找我要就是了，累不累……</p>
            <p>暂不开源，但欢迎参与项目。联系方式：Icemic##bakery.moe</p>
          </article>
        </div>
      </main>
    )
  }
}
