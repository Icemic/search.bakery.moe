import React from 'react'
import {
  Route,
  Link
} from 'react-router-dom';
import { CSSTransitionGroup } from 'react-transition-group' // ES6
import './itemDetail.less';

import CONFIG from '../utils/config';

export default class ItemList extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false
    };
  }
  componentWillMount() {
    this.freshDetail(this.props.bgmid);
  }
  componentWillReceiveProps(nextProps) {
    const bgmid = nextProps.bgmid;
    if (bgmid !== this.props.bgmid) {
      this.freshDetail(bgmid);
    }
  }
  freshDetail(bgmid) {
    fetch(`${CONFIG.host}/search/item/${bgmid}`, { mode: 'cors' })
    .then(res => res.json())
    .then(data => this.setState({ ...data, loaded: true }));
  }
  render() {
    return (
      this.state.loaded ? <div className='itemDetail'>
        <img src={this.state.cover} data-bgmid={this.state.bgmid} />
        <div className='info'>
          <h3 data-bgmid={this.state.bgmid}>{this.state.title}</h3>
          <p><i className='type'>{this.state.type}</i><i className='episode'>{parseInt(this.state.episode)}集</i></p>
          {this.state.alias.map(value => <p className='alias'>{value}</p>)}
          <div style={{ flex: 1 }}></div>
          <a className='bgmlink' target='_blank' href={`https://bgm.tv/subject/${this.state.bgmid}`}>浏览 bgm.tv 页面</a>
          <div className='detail'>
            <p className='rank'>评分：{'★★★★★★★★★★☆☆☆☆☆☆☆☆☆☆'.substr(10 - Math.round(this.state.rank), 10)} {this.state.rank.toFixed(1)}</p>
            <p className='meta'>共 {this.state.meta.views} 人浏览，{this.state.meta.stars} 人喜欢</p>
          </div>
        </div>
      </div> : <p>加载中...</p>
    );
  }
}
