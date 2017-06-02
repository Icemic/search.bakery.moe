import 'normalize.css';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import history from './utils/history';

import DocumentTitle from 'react-document-title';
import { subscribe, unsubscribe, register } from './utils/store';

import './app.css';
import Index from './pages/index.jsx';
import Item from './pages/item.jsx';

register('title', (state, action) => {
  const { value, page } = action;

  if (page === 'search') {
    return value ? `搜索\`${value}\` - ` : '';
  } else if (page === 'item') {
    return `${value} - `;
  }
  return action.value;
});

class App extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleTitle = this.handleTitle.bind(this);

    this.state = {
      title: ''
    };
  }
  componentDidMount() {
    subscribe('title', this.handleTitle);
  }
  componentWillUnmount() {
    unsubscribe('title', this.handleTitle);
  }
  handleTitle(title) {
    this.setState({ title })
  }
  render() {
    return (
      <DocumentTitle title={this.state.title + '面包推荐'}>
      <Router history={history}>
          <div>
            <ul>
              <li><Link to="/">Home</Link></li>
            </ul>

            <Route exact path="/" component={Index}/>
            <Route path="/search/:search" component={Index}/>
            <Route path='/item/:bgmid' component={Item}/>
          </div>
      </Router>
      </DocumentTitle>
    );
  };
}


ReactDOM.render( <App />,
  document.getElementById("app"));
