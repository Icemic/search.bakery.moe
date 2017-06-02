import React from 'react'
import ItemList from '../components/itemList';
import './item.less';

import { dispatch } from '../utils/store';

export default class Item extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      list: [],
      similarities: [],
      page: 1,
      ended: false
    };
  }
  componentDidMount() {
    this.freshList(this.props.match.params.bgmid, false);
  }
  componentWillReceiveProps(nextProps) {
    this.freshList(nextProps.match.params.bgmid, false);
  }
  freshList(bgmid) {
    fetch(`//127.0.0.1:3000/search/similarity/${bgmid}?page=1`, { mode: 'cors' })
    .then(res => res.json())
    .then(data => this.setState({ list: data.items, similarities: data.similarities, page: 1, ended: data.ended }))
    .then(() => document.body.scrollTop = 0)
    .then(() => dispatch('title', { value: 'test', page: 'item' }));
  }
  loadNextPage() {
    const bgmid = this.props.match.params.bgmid;
    const { list, similarities, page } = this.state;

    return fetch(`//127.0.0.1:3000/search/similarity/${bgmid}?page=${page + 1}`, { mode: 'cors' })
    .then(res => res.json())
    .then(data => this.setState({
      list: [...list, ...data.items],
      similarities: [...similarities, ...data.similarities],
      page: page + 1,
      ended: data.ended
    }));
  }
  render() {
    return (
      <main>
        <div className='itemlistbox'>
          <ItemList
          head='你可能会喜欢（按相似度倒序排列）：'
          list={this.state.list}
          similarities={this.state.similarities}
          onMore={this.loadNextPage.bind(this)}
          ended={this.state.ended}
          />
        </div>
      </main>
    )
  }
}
