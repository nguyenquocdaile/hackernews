import React, { Component } from 'react';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import './App.css';


const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/SEARCH';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';


class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      results: null,
      query: DEFAULT_QUERY,
      search: '',
      isLoading: false,
      sortKey: 'NONE',
      isSortReverse: false,
    };


    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.needsToSearchTopstories = this.needsToSearchTopstories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  setSearchTopstories(result) {
      const { hits, page } = result;
      const { searchKey } = this.state;
      const oldHits = page === 0 ? [] : this.state.results[searchKey].hits;
      const updatedHits = [ ...oldHits, ...hits ];
      this.setState({
      results: {
          ...this.state.results,
          [searchKey]: { hits: updatedHits, page },
          isLoading: false
      }
      });
}

  fetchSearchTopstories(query, page){
    this.setState({ isLoading: true});
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${query}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`).then(response => response.json()).then(result => this.setSearchTopstories(result));
  }

  componentDidMount(){
    const { query } = this.state;
    this.setState({ searchKey: query });
    this.fetchSearchTopstories(query, DEFAULT_PAGE);
  }

  needsToSearchTopstories(query) {
    return !this.state.results[query];
  }

  onSearchChange(event){
    this.setState({ query: event.target.value });
  }

  onSearchSubmit(event) {
    const { query } = this.state;
    this.setState({ searchKey: query });
    if (this.needsToSearchTopstories(query)) {
    this.fetchSearchTopstories(query, DEFAULT_PAGE);
    }
    event.preventDefault();
  }

  render() {
    const { query, results, searchKey, isLoading, sortKey, isSortReverse } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={query}
            onChange={this.onSearchChange}
            onSearchSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        <Table
          list={list}
          sortKey={sortKey}
          isSortReverse={isSortReverse}
          onSort={this.onSort}
        />
        <div className="interactions">
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopstories(query, page + 1)}>
            More
          </ButtonWithLoading>
        </div>
      </div>
    );
  }
}


const SORT = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse();
}


const widthLoading = (Component) => ({ isLoading, ...rest}) =>
  isLoading ? <Loading /> : <Component {...rest} />;


const Search = ({ value, onChange, onSubmit, children }) =>
       <form onSubmit={onSubmit}>
          <input
          type="text"
          value={value}
          onChange={onChange} />

          <button type="submit">
            {children}
          </button>
      </form>


const Table = ({ list, sortKey, isSortReverse, onSort }) => {
    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse ? isSortReverse.reverse() : sortedList;
    return (
      <div className="table">
          <div className="table-header">
            <span style={{ width: 40% }}>
                <Sort
                  sortKey={'TITLE'}
                  onSort={onSort}
                  activeSortKet={sortKey}
                >
                  Title
               </Sort>
            </span>

            <span style={{ width: 30% }}>
                <Sort
                  sortKey={'AUTHOR'}
                  onSort={onSort}
                  activeSortKet={sortKey}
                >
                  Author
               </Sort>
            </span>

            <span style={{ width: 15% }}>
                <Sort
                  sortKey={'COMMENTS'}
                  onSort={onSort}
                  activeSortKet={sortKey}
                >
                  Comments
               </Sort>
            </span>

            <span style={{ width: 15% }}>
                <Sort
                  sortKey={'POINTS'}
                  onSort={onSort}
                  activeSortKet={sortKey}
                >
                  Points
               </Sort>
            </span>

          </div>

          { SORTS[sortKey](list).map((item) =>
          <div key={item.objectID} className="table-row">
            <span style={{ width: '40%' }}>
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={{ width: '30%' }}>
              {item.author}
            </span>
            <span style={{ width: '15%' }}>
              {item.num_comments}
            </span>
            <span style={{ width: '15%' }}>
              {item.points}
            </span>
          </div>
          )}
      </div>
  );
}

const Button = ({ onClick, children}) =>
  <button onClick={onClick} type="button">
    {children}
  </button>

const Loading = () =>
  <div> Loading... </div>
const ButtonWithLoading = widthLoading(Button);

const Sort = ({ sortKey, activeSortKet, onSort, children }) => {
  const sortClass = classNames(
    'button-inline',
    {'button-active': sortKey === activeSortKey }
  );

  return (
      <button
        onClick={() => onSort(sortKey)}
        className={sortClass}
        type="button"
        >
        {children}
      </button>
  );
}

export default App;

export {
  Button,
  Search,
  Table,
};