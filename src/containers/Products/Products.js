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

    // product table pre-requirements
    const productSchema = ['id', 'name', 'brand', 'imgUrl', 'points', 'price', 'volume', 'description', 'launchedAt'];
    const cols = productSchema.length;
    const colWidth = 75 / cols + '%';

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
            {(() => {
              return productSchema.map((key) => {
                return <th key={'th-' + key} style={{width: colWidth}}>{key}</th>;
              });
            })()}
            <th className={styles.buttonCol}>Button</th>
          </tr>
          </thead>
          <tbody>
          {
            Object.values(products).map((prod) => {
              const id = prod.id;
              return editing[id] ?
              <ProductForm formKey={String(id)} key={String(id)} initialValues={prod}/> :
              <tr key={id} style={{width: colWidth}}>
                {productSchema.map((key) => {
                  if (key === 'imgUrl') {
                    return (<td key={id + key} style={{width: colWidth}}>
                      <img src={prod[key]} style={{width: '100%', height: '50px'}} />
                    </td>);
                  }

                  return (<td key={id + key} style={{width: colWidth}}>
                    <div className={styles.cell}>{prod[key]}</div>
                  </td>);
                })}
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
