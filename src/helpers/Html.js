import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom/server';
import serialize from 'serialize-javascript';
import DocumentMeta from 'react-document-meta';

/**
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */
export default class Html extends Component {
  static propTypes = {
    assets: PropTypes.object,
    component: PropTypes.node,
    store: PropTypes.object
  }

  render() {
    const {assets, component, store} = this.props;
    const content = component ? ReactDOM.renderToString(component) : '';

    return (
      <html lang="en-us">
        <head>
          {DocumentMeta.renderAsReact()}

          <link rel="shortcut icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {/* styles (will be present only in production with webpack extract text plugin) */}
          {Object.keys(assets.styles).map((style, key) =>
            <link href={assets.styles[style]} key={key} media="screen, projection"
                  rel="stylesheet" type="text/css" charSet="UTF-8"/>
          )}

          {/* (will be present only in development mode) */}
          {/* outputs a <style/> tag with all bootstrap styles + App.scss + it could be CurrentPage.scss. */}
          {/* can smoothen the initial style flash (flicker) on page load in development mode. */}
          {/* ideally one could also include here the style for the current page (Home.scss, About.scss, etc) */}
          {/* Object.keys(assets.styles).length === 0 ? <style dangerouslySetInnerHTML={{__html: require('../theme/bootstrap.config.js') + require('../containers/App/App.scss')._style}}/> : null */}
          <link media="screen" rel="stylesheet" type="text/css" href="/css/vendor/perfect-scrollbar/perfect-scrollbar.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/css/vendor/morris/morris.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/bower_components/codemirror/lib/codemirror.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/bower_components/codemirror/theme/ambiance.css"/>
          <link media="screen,print" rel="stylesheet" type="text/css" href="/css/demo/blessed/ltr/main-blessed1.css"/>
          <link media="screen,print" rel="stylesheet" type="text/css" href="/css/demo/blessed/ltr/main.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/css/demo/blessed/ltr/theme.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/css/demo/blessed/ltr/colors-blessed1.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/css/demo/blessed/ltr/colors.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/css/demo/blessed/ltr/font-faces.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/css/fonts/demo/fonts.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/demo.css"/>
        </head>
        <body>
          <div id="content" dangerouslySetInnerHTML={{__html: content}}/>
          <div id='blueimp-gallery' className='blueimp-gallery blueimp-gallery-controls'>
            <div className='slides'></div>
            <h3 className='title'></h3>
            <p className="description"></p>
            <a className='prev'>‹</a>
            <a className='next'>›</a>
            <a className='close'>×</a>
            <a className='play-pause'></a>
            <ol className='indicator'></ol>
          </div>

          <script dangerouslySetInnerHTML={{__html: `window.__data=${serialize(store.getState())};`}} charSet="UTF-8"/>
          {/*Main script will effect rubix's UI*/}
          <script src={assets.javascript.main} charSet="UTF-8"/>
        </body>
      </html>
    );
  }
}
