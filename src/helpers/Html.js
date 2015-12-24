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
          <link media="screen" rel="stylesheet" type="text/css" href="/css/vendor/pace/pace.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/css/vendor/perfect-scrollbar/perfect-scrollbar.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/css/vendor/morris/morris.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/bower_components/codemirror/lib/codemirror.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/bower_components/codemirror/theme/ambiance.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/demo.css"/>
          <link media="screen,print" rel="stylesheet" type="text/css" href="/css/demo/blessed/ltr/main-blessed1.css"/>
          <link media="screen,print" rel="stylesheet" type="text/css" href="/css/demo/blessed/ltr/main.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/css/demo/blessed/ltr/theme.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/css/demo/blessed/ltr/colors-blessed1.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/css/demo/blessed/ltr/colors.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/css/demo/blessed/ltr/font-faces.css"/>
          <link media="screen" rel="stylesheet" type="text/css" href="/css/fonts/demo/fonts.css"/>
          <script type="text/javascript" charset="UTF-8" src="http://maps.google.com/maps-api-v3/api/js/23/3/intl/zh_tw/common.js"></script>
          <script type="text/javascript" charset="UTF-8" src="http://maps.google.com/maps-api-v3/api/js/23/3/intl/zh_tw/map.js"></script>
          <script type="text/javascript" charset="UTF-8" src="http://maps.google.com/maps-api-v3/api/js/23/3/intl/zh_tw/util.js"></script>
          <script type="text/javascript" charset="UTF-8" src="http://maps.google.com/maps-api-v3/api/js/23/3/intl/zh_tw/geometry.js"></script>
          <script type="text/javascript" charset="UTF-8" src="http://maps.google.com/maps-api-v3/api/js/23/3/intl/zh_tw/directions.js"></script>
          <script type="text/javascript" src="/js/demo/demo.js"></script>
          <link media="screen" rel="stylesheet" type="text/css" href="/demo.css"/>
          <script type="text/javascript" charset="UTF-8" src="http://maps.google.com/maps-api-v3/api/js/23/3/intl/zh_tw/onion.js"></script>
          <script type="text/javascript" charset="UTF-8" src="http://maps.google.com/maps-api-v3/api/js/23/3/intl/zh_tw/stats.js"></script>
          <script type="text/javascript" charset="UTF-8" src="http://maps.google.com/maps-api-v3/api/js/23/3/intl/zh_tw/controls.js"></script>
          <script type="text/javascript" charset="UTF-8" src="http://maps.google.com/maps-api-v3/api/js/23/3/intl/zh_tw/poly.js"></script>
          <script type="text/javascript" charset="UTF-8" src="http://maps.google.com/maps-api-v3/api/js/23/3/intl/zh_tw/marker.js"></script>
        </head>
        <body>
          <div id='pace-loader' class='pace-big'></div>
          <div id='app-preloader'></div>
          <div id="content" dangerouslySetInnerHTML={{__html: content}}/>
          <div id='blueimp-gallery' class='blueimp-gallery blueimp-gallery-controls'>
            <div class='slides'></div>
            <h3 class='title'></h3>
            <p class="description"></p>
            <a class='prev'>‹</a>
            <a class='next'>›</a>
            <a class='close'>×</a>
            <a class='play-pause'></a>
            <ol class='indicator'></ol>
          </div>
          <script type='text/javascript' src='/js/common/pace/pace.js'></script>
          <script type='text/javascript' src='/js/common/uuid/uuid.js'></script>
          <script type='text/javascript' src='/bower_components/modernizr/modernizr.js'></script>
          <script type='text/javascript' src='/bower_components/codemirror/lib/codemirror.js'></script>
          <script type='text/javascript' src='/bower_components/codemirror/mode/javascript/javascript.js'></script>
          <script type='text/javascript' src='/bower_components/jquery/dist/jquery.js'></script>
          <script type='text/javascript' src='/bower_components/jquery-ui/jquery-ui.min.js'></script>
          <script type='text/javascript' src='/bower_components/moment/moment.js'></script>
          <script type='text/javascript' src='/bower_components/eventemitter2/lib/eventemitter2.js'></script>
          <script type='text/javascript' src='/bower_components/vex/js/vex.combined.min.js'></script>
          <script type='text/javascript' src='/bower_components/chartjs/Chart.js'></script>
          <script type='text/javascript' src='/bower_components/trumbowyg/dist/trumbowyg.js'></script>
          <script type='text/javascript' src='/bower_components/blueimp-gallery/js/blueimp-gallery.js'></script>
          <script type='text/javascript' src='/js/vendor/p-scrollbar/min/perfect-scrollbar.min.js'></script>
          <script type='text/javascript' src='/bower_components/react/react-with-addons.js'></script>
          <script type='text/javascript' src='/js/vendor/datatables/datatables.js'></script>
          <script type='text/javascript' src='/js/common/react-l20n/react-l20n.js'></script>
          <script type='text/javascript' src='/js/common/rubix-bootstrap/rubix-bootstrap.js'></script>
          <script type="text/javascript" src="//maps.google.com/maps/api/js?sensor=true"></script>
          <script type='text/javascript' src='/js/vendor/gmaps/gmaps.js'></script>
          <script type='text/javascript' src='/js/vendor/bootstrap/bootstrap.js'></script>
          <script type='text/javascript' src='/js/vendor/bootstrap-slider/bootstrap-slider.js'></script>
          <script type='text/javascript' src='/js/vendor/bootstrap-datetimepicker/bootstrap-datetimepicker.js'></script>
          <script type='text/javascript' src='/js/vendor/ion.tabs/ion.tabs.min.js'></script>
          <script type='text/javascript' src='/js/vendor/ion.rangeSlider/ion.rangeSlider.min.js'></script>
          <script type='text/javascript' src='/js/vendor/d3/d3.js'></script>
          <script type='text/javascript' src='/js/vendor/jquery.knob/jquery.knob.js'></script>
          <script type='text/javascript' src='/js/vendor/leaflet/leaflet.js'></script>
          <script type='text/javascript' src='/js/vendor/sparklines/sparklines.js'></script>
          <script type='text/javascript' src='/js/vendor/switchery/switchery.js'></script>
          <script type='text/javascript' src='/js/vendor/raphael/raphael.js'></script>
          <script type='text/javascript' src='/js/vendor/messenger/messenger.min.js'></script>
          <script type='text/javascript' src='/js/vendor/select2/select2.js'></script>
          <script type='text/javascript' src='/js/vendor/xeditable/xeditable.js'></script>
          <script type='text/javascript' src='/js/vendor/typeahead/typeahead.js'></script>
          <script type='text/javascript' src='/js/vendor/jquery-steps/jquery-steps.js'></script>
          <script type='text/javascript' src='/js/vendor/jquery-validate/jquery-validate.js'></script>
          <script type='text/javascript' src='/js/vendor/tablesaw/tablesaw.js'></script>
          <script type='text/javascript' src='/js/vendor/fullcalendar/fullcalendar.js'></script>
          <script type='text/javascript' src='/js/vendor/nestable/nestable.js'></script>
          <script type='text/javascript' src='/js/vendor/dropzone/dropzone.js'></script>
          <script type='text/javascript' src='/js/vendor/jcrop/color.js'></script>
          <script type='text/javascript' src='/js/vendor/jcrop/jcrop.js'></script>
          <script type='text/javascript' src='/js/vendor/prism/prism.js'></script>
          <script type='text/javascript' src='/js/vendor/morris/morris.js'></script>
          <script type='text/javascript' src='/js/vendor/timeline/timeline.js'></script>
          <script type='text/javascript' src='/js/vendor/holder/holder.js'></script>
          <script type='text/javascript' src='/bower_components/c3/c3.js'></script>
          <script type='text/javascript' src='/js/common/rubix/rubix.js'></script>
          <script type='text/javascript' src='/js/common/globals.js'></script>
          <script dangerouslySetInnerHTML={{__html: `window.__data=${serialize(store.getState())};`}} charSet="UTF-8"/>
          <script src={assets.javascript.main} charSet="UTF-8"/>
        </body>
      </html>
    );
  }
}
