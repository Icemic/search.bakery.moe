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
      loading: false
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
  render() {
    const similarities = this.props.similarities || [];
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
              <p className='meta'>共 {item.meta.views} 人浏览，{item.meta.stars} 人喜欢</p>
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
