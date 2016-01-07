/*eslint-disable*/

import React, {Component} from 'react';
import { Table, Panel, Grid, Row, Col } from 'react-bootstrap';

const moment = require('moment');
const chance = require('chance').Chance();

export default class DataTable extends Component {
  init(data) {
    // if (this.table && this.table.length > 0) {
    //   this.table.destory();
    // }

    var table;
    if ($.fn.dataTable.isDataTable( '#example' ) ) {
      console.log("destroy if table existed");
      table = $('#example').DataTable();
      table.destroy();
    }

    // Separate the jQuery chain to get pure DataTable object
    var tmp = $('#example').addClass('nowrap');
    // Only uppercase 'D' of 'DataTable' will work
    // var self = this;
    table = tmp.DataTable({
      responsive: true,
      columnDefs: [
        { targets: [-1, -3], className: 'dt-body-right' }
      ]
      // "bDestroy": true,
      // "fnDrawCallback": () => {
      //   self.forceUpdate();
      // }
    });
    // this.table = table;

    $('a.toggle-vis').on('click', this.toggleColumn(table));
  }

  toggleColumn(table) {
    return function (e) {
      e.preventDefault();

      // Get the column API object
      var column = table.column($(this).attr('data-column'));

      // Toggle the visibility
      column.visible(!column.visible());
    };
  }

  update(data) {
    // this.table.draw();
    // Separate the jQuery chain to get pure DataTable object
    // var tmp = $('#example').addClass('nowrap');
    // Only uppercase 'D' of 'DataTable' will work
    console.log("[update]");
    // this.table.draw();
    // var table = tmp.DataTable({
    //     responsive: true,
    //     columnDefs: [
    //       { targets: [-1, -3], className: 'dt-body-right' }
    //     ],
    //     "bDestroy": true
    // });
  }

  // componentWillReceiveProps(nextProps) {
    // console.log("[componentWillReceiveProps] this.table: ", this.table);
    // this.table.destory();
  // }

  componentDidMount() {
    const {data} = this.props;
    this.init(data);
  }

  // shouldComponentUpdate(nextProps, nextState) {
    // console.log("[shouldComponentUpdate] this.table: ", this.table);
    // return false;
  // }

  // componentWillUpdate() {
  //   // const {data} = this.props;
  //   //
  //   // console.log("[componentWillUpdate] this.table: ", this.table);
  //   if (this.table && this.table.length > 0) {
  //     console.log("[componentWillUpdate] destory");
  //     this.table.destroy();
  //   }
  // }

  componentDidUpdate() {
    console.log("[componentDidUpdate]");

    const {data} = this.props;
    this.init(data);
  }


  render() {
    const {data} = this.props;
    // const data = {
    //   columns: [
    //     "Name",
    //     "Position",
    //     "Office",
    //     "Age",
    //     "Start Date",
    //     "Salary"
    //   ],
    //   rows: [
    //     {
    //       name: "Tiger Nixon",
    //       position: "System Architect",
    //       office: "Edinburgh",
    //       age: "61",
    //       startAt: "2011/04/25",
    //       salary: "$320,800"
    //     },
    //     {
    //       name: "Tiger Nixon",
    //       position: "System Architect",
    //       office: "Edinburgh",
    //       age: "61",
    //       startAt: "2011/04/25",
    //       salary: "$320,800"
    //     },
    //     {
    //       name: "Tiger Nixon",
    //       position: "System Architect",
    //       office: "Edinburgh",
    //       age: "61",
    //       startAt: "2011/04/25",
    //       salary: "$320,800"
    //     }
    //   ]
    // };

    return (
      <div>
        <div>
          Toggle column:
          {data.columns && data.columns.map((col, index) => {
            return (
              <a key={"col-" + index} className="toggle-vis" data-column={index}>{col}</a>
            );
          })}
        </div>

        <Panel>
          <Grid>
            <Row>
              <Col xs={12}>
                <Table id='example' className='display' cellSpacing='0' width='100%'>
                  <thead>
                    <tr>
                      {data.columns && data.columns.map((col, index) => {
                        return (
                          <th key={"th-" + index}>{col}</th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tfoot>
                    <tr>
                      {data.columns && data.columns.map((col, index) => {
                        return (
                          <th key={"tf-" + index}>{col}</th>
                        );
                      })}
                    </tr>
                  </tfoot>
                  <tbody>
                    {data.rows && data.rows.map((row, index) => {
                      return (
                        <tr key={"row-" + index}>
                          <td>{row.name}</td>
                          <td>{row.gender}</td>
                          <td>{row.office}</td>
                          <td>{row.age}</td>
                          <td>{row.startAt}</td>
                          <td>{row.salary}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Grid>
        </Panel>
      </div>
    );
  }
}

/*eslint-disable*/
