import 'normalize.css';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import ReactGA from 'react-ga';
import history from './utils/history';

import DocumentTitle from 'react-document-title';
import { subscribe, unsubscribe, register } from './utils/store';

import './app.css';
import Index from './pages/index.jsx';
import Item from './pages/item.jsx';
import About from './pages/about.jsx';
import Header from './components/header';
import Footer from './components/footer';

register('title', (state, action) => {
  const { value, page } = action;

  if (page === 'search') {
    return value ? `搜索\`${value}\` - ` : '';
  } else if (page === 'item') {
    return `${value} - `;
  }
  return action.value;
});

ReactGA.initialize('UA-101128351-1');
ReactGA.plugin.require('displayfeatures');

const withTracker = (WrappedComponent) => {
  const trackPage = (page) => {
    ReactGA.set({ page });
    ReactGA.pageview(page);
    _czc && _czc.push(["_trackPageview", page]);
  };

  const HOC = (props) => {
    const page = props.location.pathname + props.location.search;
    trackPage(page);

    return (
      <WrappedComponent {...props} />
    );
  };

  return HOC;
};

class WindowTitle extends React.PureComponent {
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
    return <DocumentTitle title={this.state.title + '面包番组推荐 Alpha'} />
  }
}

const App = () => (
  <Router history={history}>
    <div>
      <WindowTitle />
      <Header />

      <Route exact path="/" component={withTracker(Index)}/>
      <Route path="/search/:search" component={withTracker(Index)}/>
      <Route path='/item/:bgmid' component={withTracker(Item)}/>
      <Route path="/about" component={withTracker(About)}/>

      <Footer />
    </div>
  </Router>
);


ReactDOM.render( <App />,
  document.getElementById("app"));
