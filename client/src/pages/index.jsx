import React from 'react'
import DocumentTitle from 'react-document-title';
import './index.less';

import Search from '../components/search';
import ItemList from '../components/itemList';
import { dispatch } from '../utils/store';

export default class Index extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      list: [],
      page: 1,
      ended: false
    };
  }
  componentDidMount() {
    if (this.props.match.params.search) {
      this.freshList(this.props.match.params.search);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.search !== nextProps.match.params.search) {
      this.freshList(nextProps.match.params.search);
    }
  }
  freshList(value) {
    fetch(`//127.0.0.1:3000/search/keywords/${encodeURIComponent(value)}?page=1`, { mode: 'cors' })
    .then(res => res.json())
    .then(data => this.setState({ list: data.items, page: 1, ended: data.ended }))
    .then(() => document.body.scrollTop = 0)
    .then(() => dispatch('title', { value, page: 'search' }));
  }
  loadNextPage() {
    const value = this.props.match.params.search;
    const { list, page } = this.state;

    return fetch(`//127.0.0.1:3000/search/keywords/${encodeURIComponent(value)}?page=${page + 1}`, { mode: 'cors' })
    .then(res => res.json())
    .then(data => this.setState({
      list: [...list, ...data.items],
      page: page + 1,
      ended: data.ended
    }));
  }
  handleSearch(value) {
    this.props.history.push(`/search/${value}`);
  }
  render() {
    return (
      <main>
        <div className='searchbox'>
          <Search onSearch={this.handleSearch.bind(this)} defaultValue={this.props.match.params.search}/>
        </div>
        {this.props.match.params.search}
        <div className='itemlistbox'>
          <ItemList head='查询结果' list={this.state.list} onMore={this.loadNextPage.bind(this)} ended={this.state.ended}/>
        </div>
      </main>
    )
  }
}
