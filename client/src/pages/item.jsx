import React from 'react'
import ItemList from '../components/itemList';
import ItemDetail from '../components/itemDetail';
import './item.less';

import { dispatch } from '../utils/store';
import CONFIG from '../utils/config';

export default class Item extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      list: [],
      similarities: [],
      stars: {},
      page: 1,
      ended: false
    };
  }
  componentDidMount() {
    this.freshList(this.props.match.params.bgmid);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.bgmid !== this.props.match.params.bgmid) {
      this.freshList(nextProps.match.params.bgmid);
    }
  }
  freshList(bgmid) {
    fetch(`${CONFIG.host}/search/similarity/${bgmid}?page=1`, { mode: 'cors' })
    .then(res => res.json())
    .then(data => {
      this.setState({
        list: data.items,
        similarities: data.similarities,
        stars: data.stars,
        page: 1,
        ended: data.ended
      });
      document.body.scrollTop = 0;
    });
  }
  loadNextPage() {
    const bgmid = this.props.match.params.bgmid;
    const { list, similarities, stars, page } = this.state;

    return fetch(`${CONFIG.host}/search/similarity/${bgmid}?page=${page + 1}`, { mode: 'cors' })
    .then(res => res.json())
    .then(data => this.setState({
      list: [...list, ...data.items],
      similarities: [...similarities, ...data.similarities],
      stars: Object.assign({}, stars, data.stars),
      page: page + 1,
      ended: data.ended
    }));
  }
  handleStar(targetId) {
    const bgmid = this.props.match.params.bgmid;
    return fetch(`${CONFIG.host}/search/item/${bgmid}/star/${targetId}`, { method: 'POST', mode: 'cors' });
  }
  handleDetail(detail) {
    dispatch('title', { value: `与 ${detail.title} 相似的动画`, page: 'item' });
  }
  render() {
    return (
      <main>
        <div className='itemlistbox'>
          <ItemDetail bgmid={this.props.match.params.bgmid} onDetail={this.handleDetail.bind(this)}/>
          <ItemList
          head='你可能会喜欢（按相似度倒序排列）：'
          list={this.state.list}
          similarities={this.state.similarities}
          stars={this.state.stars}
          onMore={this.loadNextPage.bind(this)}
          onStar={this.handleStar.bind(this)}
          ended={this.state.ended}
          />
        </div>
      </main>
    )
  }
}
