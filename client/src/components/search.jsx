import React from 'react'
import './search.less';

export default class Search extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      tip: false
    };
  }
  handleKeyDown(e) {
    if (e.keyCode === 13 && e.target.value.trim()) {
      this.props.onSearch && this.props.onSearch(e.target.value.trim());
      e.stopPropagation();
    }
  }
  handleInput(e) {
    const isEmpty = !e.target.value.trim();

    if (!isEmpty && !this.state.tip) {
      this.setState({
        tip: true
      });
    } else if (isEmpty && this.state.tip) {
      this.setState({
        tip: false
      });
    }
  }
  render() {
    return (
      <div className='searchWrap'>
        <input type="text" className="search"
          autoComplete="off" defaultValue={this.props.defaultValue}
          accessKey="s"
          placeholder="输入动画名称或关键词"
          onKeyDown={this.handleKeyDown.bind(this)}
          onInput={this.handleInput.bind(this)} />
        <small className={this.state.tip ? `show` : null}>按回车键⏎查询</small>
      </div>
    );
  }
}

//按「回车键 ⏎」确认订阅
