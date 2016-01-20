/*eslint-disable*/

import React, {Component} from 'react';
import { Table } from 'react-bootstrap';

export default class BootstrapTable extends Component {
  init(data) {
  }

  update(data) {
  }

  componentDidMount() {
    const {data} = this.props;
    console.log("[BootstrapTable] mounted data: ", data);
    this.init(data);
  }

  componentDidUpdate() {
    const {data} = this.props;
    console.log("[BootstrapTable] updated data: ", data);
    this.update(data);
  }

  render() {
    return (
      <Table striped>
        <thead>
          <tr>
            <th>#</th>
            <th>Column heading</th>
            <th>Column heading</th>
            <th>Column heading</th>
          </tr>
        </thead>
        <tbody>
          <tr className='active'>
            <td>1</td>
            <td>Column content</td>
            <td>Column content</td>
            <td>Column content</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Column content</td>
            <td>Column content</td>
            <td>Column content</td>
          </tr>
          <tr className='success'>
            <td>3</td>
            <td>Column content</td>
            <td>Column content</td>
            <td>Column content</td>
          </tr>
          <tr>
            <td>4</td>
            <td>Column content</td>
            <td>Column content</td>
            <td>Column content</td>
          </tr>
          <tr className='info'>
            <td>5</td>
            <td>Column content</td>
            <td>Column content</td>
            <td>Column content</td>
          </tr>
          <tr>
            <td>6</td>
            <td>Column content</td>
            <td>Column content</td>
            <td>Column content</td>
          </tr>
          <tr className='warning'>
            <td>7</td>
            <td>Column content</td>
            <td>Column content</td>
            <td>Column content</td>
          </tr>
          <tr>
            <td>8</td>
            <td>Column content</td>
            <td>Column content</td>
            <td>Column content</td>
          </tr>
          <tr className='danger'>
            <td>9</td>
            <td>Column content</td>
            <td>Column content</td>
            <td>Column content</td>
          </tr>
        </tbody>
      </Table>
    );
  }
}

/*eslint-disable*/
