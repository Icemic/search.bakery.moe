import React from 'react'
import {
  Route,
  Link
} from 'react-router-dom';
import { CSSTransitionGroup } from 'react-transition-group' // ES6
import './itemList.less';

export default class ItemList extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      stared: []
    };
  }
  handleClick(e) {
    const bgmid = e.target.getAttribute('data-bgmid');

    this.props.onClick && this.props.onClick(bgmid);

    e.stopPropagation();
  }
  async handleMore(e) {
    if (this.props.onMore) {
      this.setState({
        loading: true
      });
      await this.props.onMore();
      this.setState({
        loading: false
      });
    }
    // e.stopPropagation();
  }
  async handleStar(e) {
    e.stopPropagation();

    const targetId = parseInt(e.target.getAttribute('data-bgmid'));
    if (this.state.stared.includes(targetId)) {
      return;
    }
    this.props.onStar && await this.props.onStar(targetId);

    // 注意：此处无论是否有 onStar 传入，点击状态都会改变
    this.setState({
      stared: [targetId, ...this.state.stared]
    });
  }
  render() {
    const similarities = this.props.similarities || [];
    const stars = this.props.stars || null;
    if (this.props.list && this.props.list.length) {

      // const prevList = this.prevList || [];
      let j = 0;

      const items = this.props.list.map((item, i) => 
        <li key={item.bgmid} className={`animate-${j++ % 10}`}>
          <Link to={`/item/${item.bgmid}`}>
            <img src={item.cover} data-bgmid={item.bgmid} />
            {similarities[i] && <i className='similarity'>{similarities[i]}%</i>}
          </Link>
          <div className='info'>
            <i className='type'>{item.type}</i><Link to={`/item/${item.bgmid}`}><h4 data-bgmid={item.bgmid}>{item.title}</h4></Link>
            <div className='detail'>
              <p className='alias'>{item.alias.join(' | ')}</p>
              <p className='episode'>集数：{item.episode}</p>
              <p className='rank'>评分：{'★★★★★★★★★★☆☆☆☆☆☆☆☆☆☆'.substr(10 - Math.round(item.rank), 10)} {item.rank.toFixed(1)}</p>
              <p className='meta'>已有 {item.meta.views} 次浏览{ stars && `，${(stars[item.bgmid] || 0) + (this.state.stared.includes(item.bgmid) ? 1 : 0)} 人觉得准确`}{stars && <span>| <button data-bgmid={item.bgmid} onClick={this.handleStar.bind(this)}><img src={`/images/${this.state.stared.includes(item.bgmid) ? 'liked' : 'like'}.svg`} />准确</button></span>}</p>
            </div>
          </div>
        </li>
      );

      // this.prevList = this.props.list;

      return (
        <div className='itemList'>
          <h3>{this.props.head}</h3>
          <CSSTransitionGroup
            component='ul'
            transitionName="slidetop"
            transitionAppear={true}
            transitionLeave={false}
            transitionAppearTimeout={3000}
            transitionEnterTimeout={3000}>
            { items }
          </CSSTransitionGroup>
          {!this.props.ended && <button className='load' disabled={this.state.loading} onClick={this.handleMore.bind(this)}>{this.state.loading ? '加载中...' : '加载更多'}</button>}
        </div>
      );
    } else {
      return null;
    }
  }
}
