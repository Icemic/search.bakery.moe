import React from 'react'
import './header.less';
import { Link } from 'react-router-dom';
import PropTypes from "prop-types";

export default class Footer extends React.PureComponent {
  static contextTypes = {
    router: PropTypes.object
  }
  render() {
    return (
      <header>
        <nav>
          <ul>
            <li><a href="javascript:void(0)" onClick={() => this.context.router.history.goBack()}>⇦</a></li>
            <li><Link to="/">面包番组推荐</Link></li>
            <li><Link to="/about">关于</Link></li>
          </ul>
        </nav>
      </header>
    );
  }
}
