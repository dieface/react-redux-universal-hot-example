/*eslint-disable*/

import React, {Component} from 'react';
import { TimelineView, TimelineItem, TimelineHeader, TimelineIcon, TimelineTitle, TimelineBody } from 'helpers/timeline.js';

export default class TimeLine extends Component {
  init(data) {
  }

  update(data) {
  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

  render() {
    // console.log("[Timeline] render");
    const {data} = this.props;
    // console.log("[Timeline] data: ", data);

    // const data = [
    //   {
    //     // createdAt: (new Date).toString(),
    //     createdAt: chance.date().toString(),
    //     messages: [
    //       "girl!!"
    //     ]
    //   },
    //   {
    //     createdAt: chance.date().toString(),
    //     messages: [
    //       "oh ya man!",
    //       "cool boy"
    //     ]
    //   }
    // ];

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
