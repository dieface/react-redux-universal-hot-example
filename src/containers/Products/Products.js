import React, {Component, PropTypes} from 'react';
import DocumentMeta from 'react-document-meta';
import {connect} from 'react-redux';
import * as productActions from 'redux/modules/products';
import {isLoaded, load as loadProducts} from 'redux/modules/products';
import {initializeWithKey} from 'redux-form';
import connectData from 'helpers/connectData';
import { ProductForm } from 'components';
import config from '../../config';
import { Pagination } from 'react-bootstrap';

function fetchDataDeferred(getState, dispatch) {
  if (!isLoaded(getState())) {
    return dispatch(loadProducts());
  }
}

@connectData(null, fetchDataDeferred)
@connect(
  state => ({
    products: state.products.data,
    count: state.products.count,
    editing: state.products.editing,
    error: state.products.error,
    loading: state.products.loading,
    activePage: state.products.activePage
  }),
  {...productActions, initializeWithKey })
export default class Products extends Component {
  static propTypes = {
    products: PropTypes.object,
    count: PropTypes.number,
    error: PropTypes.string,
    loading: PropTypes.bool,
    activePage: PropTypes.number,
    initializeWithKey: PropTypes.func.isRequired,
    editing: PropTypes.object.isRequired,
    load: PropTypes.func.isRequired,
    editStart: PropTypes.func.isRequired,
    changePage: PropTypes.func.isRequired
  }

  render() {
    const handleEdit = (product) => {
      const {editStart} = this.props; // eslint-disable-line no-shadow
      return () => editStart(String(product.id));
    };

    const handleFlip = (event, selectedEvent) => {
      const {changePage} = this.props; // eslint-disable-line no-shadow
      changePage(selectedEvent.eventKey);
    };

    const { products, count, error, editing, loading, load,
      activePage
    } = this.props;

    let refreshClassName = 'fa fa-refresh';
    if (loading) {
      refreshClassName += ' fa-spin';
    }

    const styles = require('./Products.scss');

    return (
      <div className={styles.products + ' container'}>
        <h1>
          Products ({count})
          <button className={styles.refreshBtn + ' btn btn-success'} onClick={load}>
            <i className={refreshClassName}/> {' '} Reload Products
          </button>
        </h1>
        <DocumentMeta title={config.app.title + '| Products'}/>
        {error &&
        <div className="alert alert-danger" role="alert">
          <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
          {' '}
          {error}
        </div>}
        {products && JSON.stringify(products) !== '{}' &&
        <table className="table table-striped">
          <thead>
          <tr>
            <th className={styles.idCol}>ID</th>
            <th className={styles.nameCol}>Name</th>
            <th className={styles.brandCol}>Brand</th>
            <th className={styles.imgCol}>Image</th>
            <th className={styles.pointsCol}>Points</th>
            <th className={styles.priceCol}>Price</th>
            <th className={styles.volumeCol}>Volume</th>
            <th className={styles.descriptionCol}>Description</th>
            <th className={styles.launchedAtCol}>Launched Date</th>
            <th className={styles.bodyPartCol}>Body Part</th>
            <th className={styles.categoryCol}>Category</th>
            <th className={styles.buttonCol}></th>
          </tr>
          </thead>
          <tbody>
          {
            Object.values(products).map((prod) => {
              return editing[prod.id] ?
              <ProductForm formKey={String(prod.id)} key={String(prod.id)} initialValues={prod}/> :
              <tr key={prod.id}>
                <td className={styles.idCol}>{prod.id}</td>
                <td className={styles.nameCol}>{prod.name}</td>
                <td className={styles.brandCol}>{prod.brand}</td>
                <td className={styles.imgCol}>
                  <img src={prod.imgUrl} width="50" height="50" />
                </td>
                <td className={styles.pointsCol}>{prod.points}</td>
                <td className={styles.priceCol}>{prod.price}</td>
                <td className={styles.volumeCol}>{prod.volume}</td>
                <td className={styles.descriptionCol}>{prod.description}</td>
                <td className={styles.launchedAtCol}>{prod.launchedAt}</td>
                <td className={styles.bodyPartCol}>{prod.bodyPart}</td>
                <td className={styles.categoryCol}>{prod.categoryName}</td>
                <td className={styles.buttonCol}>
                  <button className="btn btn-primary" onClick={handleEdit(prod)}>
                    <i className="fa fa-pencil"/> Edit
                  </button>
                </td>
              </tr>;
            })
          }
          </tbody>
        </table>}

        <Pagination
                prev
                next
                first
                last
                ellipsis
                items={Math.floor(count / 10) + (count % 10 > 0 ? 1 : 0)}
                maxButtons={10}
                activePage={activePage}
                onSelect={handleFlip}
                />
      </div>
    );
  }
}
