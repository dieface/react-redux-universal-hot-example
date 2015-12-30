/*eslint-disable*/

import React, {Component} from 'react';
import { TimelineView, TimelineItem, TimelineHeader, TimelineIcon, TimelineTitle, TimelineBody } from 'helpers/timeline.js';

export default class TimeLine extends Component {
  init(data) {
  }

  update(data) {
  }

  componentDidMount() {
    const {data} = this.props;
    this.init(data);
  }

  componentDidUpdate() {
    this.update(data);
  }

  render() {
    return (
      <div>
        <TimelineView className='border-hoverblue tl-blue'>
          <TimelineItem>
            <TimelineHeader>
              <TimelineIcon className='bg-blue fg-white' glyph='icon-fontello-chat-1' />
              <TimelineTitle>
                Tue Jul 29 2014
              </TimelineTitle>
            </TimelineHeader>
            <TimelineBody>
              <ul>
                <li>
                  helllo girl!!
                </li>
              </ul>
            </TimelineBody>
          </TimelineItem>
        </TimelineView>
        <TimelineView className='border-hoverblue tl-blue'>
          <TimelineItem>
            <TimelineHeader>
              <TimelineIcon className='bg-blue fg-white' glyph='icon-fontello-chat-1' />
              <TimelineTitle>
                Tue Jul 28 2014
              </TimelineTitle>
            </TimelineHeader>
            <TimelineBody>
              <ul>
                <li>
                  <span>oh ya man!</span>
                </li>
                <li>
                  <span>cool boy</span>
                </li>
              </ul>
            </TimelineBody>
          </TimelineItem>
        </TimelineView>
      </div>
    );
  }
}

/*eslint-disable*/
