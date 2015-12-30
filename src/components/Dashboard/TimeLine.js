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
    const data = [
      {
        createdAt: moment().format('YYYY-MM-DD'),
        messages: [
          "girl!!"
        ]
      },
      {
        createdAt: moment().format('YYYY-MM-DD'),
        messages: [
          "oh ya man!",
          "cool boy"
        ]
      }
    ];

    return (
      <div>
        {data && data.map((d) => {
          return (
            <TimelineView key={d.createdAt} className='border-hoverblue tl-blue'>
              <TimelineItem>
                <TimelineHeader>
                  <TimelineIcon className='bg-blue fg-white' glyph='icon-fontello-chat-1' />
                  <TimelineTitle>
                    {d.createdAt}
                  </TimelineTitle>
                </TimelineHeader>
                <TimelineBody>
                  <ul>
                    {d.messages.map((m) => {
                      return (
                        <li key={m}>
                          <span>{m}</span>
                        </li>
                      );
                    })}
                  </ul>
                </TimelineBody>
              </TimelineItem>
            </TimelineView>
          );
        })}
      </div>
    );
  }
}

/*eslint-disable*/
