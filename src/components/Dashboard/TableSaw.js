/*eslint-disable*/

import React, {Component} from 'react';
import { Table, Panel, Grid, Row, Col } from 'react-bootstrap';

export default class TableSaw extends Component {
  init(data) {
    $('.tablesaw').table();
  }

  componentDidMount() {
    const {data} = this.props;
    this.init(data);
  }

  render() {
    return (
      <Panel header="Tablesaw: Mode Switch">
        <Grid>
          <Row>
            <Col xs={12}>
              <Table striped bordered className='tablesaw' data-mode-switch data-mode='columntoggle'>
                <thead>
                  <tr>
                    <th data-priority='3'>Rank</th>
                    <th data-priority='persist'>Movie Title</th>
                    <th data-priority='2'>Year</th>
                    <th data-priority='1'>
                      <abbr title='Rotten Tomato Rating'>Rating</abbr>
                    </th>
                    <th data-priority='4'>Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>1</th>
                    <td>
                      <a href='http://en.wikipedia.org/wiki/Citizen_Kane' data-rel='external'>Citizen Kane</a>
                    </td>
                    <td>1941</td>
                    <td>100%</td>
                    <td>74</td>
                  </tr>
                  <tr>
                    <th>2</th>
                    <td>
                      <a href='http://en.wikipedia.org/wiki/Casablanca_(film)' data-rel='external'>Casablanca</a>
                    </td>
                    <td>1942</td>
                    <td>97%</td>
                    <td>64</td>
                  </tr>
                  <tr>
                    <th>3</th>
                    <td>
                      <a href='http://en.wikipedia.org/wiki/The_Godfather' data-rel='external'>The Godfather</a>
                    </td>
                    <td>1972</td>
                    <td>97%</td>
                    <td>87</td>
                  </tr>
                  <tr>
                    <th>4</th>
                    <td>
                      <a href='http://en.wikipedia.org/wiki/Gone_with_the_Wind_(film)' data-rel='external'>Gone with the Wind</a>
                    </td>
                    <td>1939</td>
                    <td>96%</td>
                    <td>87</td>
                  </tr>
                  <tr>
                    <th>5</th>
                    <td>
                      <a href='http://en.wikipedia.org/wiki/Lawrence_of_Arabia_(film)' data-rel='external'>Lawrence of Arabia</a>
                    </td>
                    <td>1962</td>
                    <td>94%</td>
                    <td>87</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </Grid>
      </Panel>
    );
  }
}

/*eslint-disable*/
