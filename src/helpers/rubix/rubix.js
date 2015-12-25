/*eslint-disable */

// const RubixStackedAreaSeries = require('./StackedAreaSeries');
// const RubixPieDonut = require('./PieDonut');
// const RubixLineSeries = require('./LineSeries');
// const RubixColumnSeries = require('./ColumnSeries');
// const RubixAreaSeries = require('./AreaSeries');

import RubixStackedAreaSeries from './StackedAreaSeries';
import RubixPieDonut from './PieDonut';
import RubixLineSeries from './LineSeries';
import RubixColumnSeries from './ColumnSeries';
import RubixAreaSeries from './AreaSeries';

const $ = require('jquery');
const d3 = require('d3');
let RubixListeners = [];

const isSafari = () => {
  return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
};

let useTable = 'inline'; //isSafari() ? 'inline' : 'table';

/**
* @param {string} id
* @param {?Object} opts
* @constructor
*/
export default class Rubix {
  constructor(id, opts) {
    this.chart_counter = 0;
    this.masterId = this.uid('masterId');
    RubixListeners.push(this.masterId);

    this.data_stack = {};
    this.chart_stack = {};

    this.area_stack_data_stack = [];
    this.column_stack_data_stack = [];

    this.root_elem = $(id);
    this.root_elem.css('position', 'relative');
    this.root_elem.addClass('rubixcc-main-chart');
    this.root_elem.append('<div class="rubixcc-tooltip"></div>');
    this.root_elem.append('<div class="rubixcc-title"></div>');
    this.root_elem.append('<div class="rubixcc-subtitle"></div>');
    this.root_elem.append('<div class="rubixcc-chart text-center"><div style="margin-top:5px">Loading...</div></div>');
    this.root_elem.append('<div class="rubixcc-legend"></div>');

    let width = opts.width || '100%';
    let height = opts.height || 150;
    this.root_elem.width(width).height(height);

    this.elem = this.root_elem.find('.rubixcc-chart');

    opts.tooltip = opts.tooltip || {};
    this.tooltip = this.root_elem.find('.rubixcc-tooltip');
    this.tooltip.hide();

    if (opts && opts.tooltip && opts.tooltip.animate) {
      this.tooltip.addClass('animate');
    }

    this.tooltip.html("");
    this.tooltip.css({
      'font-family': 'Lato, "Lucida Grande", Arial, Helvetica, sans-serif',
      'font-size': '12px',
      'position': 'absolute',
      'background': 'white',
      'color': '#89949B',
      'padding': '10px 15px',
      'display': 'none',
      'pointer-events': 'none',
      'border-radius': '5px',
      'z-index': 100,
      'min-height': 50,
      'user-select': 'none',
      'cursor': 'default',
      'border': '3px solid ' + (opts.tooltip.color ? opts.tooltip.color : '#89949B'),
      'box-shadow': 'rgba(0, 0, 0, 0.2) 2px 4px 8px',
      'background': 'white'
    });

    opts.legend = opts.legend || {};

    this.legend = this.root_elem.find('.rubixcc-legend');
    this.legend.css({
      'font-family': "Lato, 'Lucida Grande', Arial, Helvetica, sans-serif",
      'text-align': 'center',
      'margin-top': opts.legend.top || '-10px',
      'margin-bottom': opts.legend.bottom || '5px',
      'user-select': 'none',
      'display': opts.hideLegend ? 'none' : 'block'
    });

    this.title = this.root_elem.find('.rubixcc-title');
    this.subtitle = this.root_elem.find('.rubixcc-subtitle');

    this.title.css({
      'font-family': "Lato, 'Lucida Grande', Arial, Helvetica, sans-serif",
      'text-align': 'center',
      'user-select': 'none',
      'font-weight': 'bold',
      'font-size': '16px',
      'color': 'steelblue',
      'margin-top': '10px',
      'cursor': 'default'
    });

    this.subtitle.css({
      'font-family': "Lato, 'Lucida Grande', Arial, Helvetica, sans-serif",
      'text-align': 'center',
      'user-select': 'none',
      'font-size': '12px',
      'color': 'steelblue',
      'margin-top': '5px',
      'cursor': 'default',
      'opacity': 0.8,
      'font-weight': 'bold'
    });

    let self = this;
    this.tooltip.on({
      'mouseover': function(e) {
        d3.select(self.elem.find('.overlay').get(0)).node().__onmousemove(e);
      },
      'mousemove': function(e) {
        d3.select(self.elem.find('.overlay').get(0)).node().__onmousemove(e);
      },
      'mouseout': function(e) {
        $(this).hide();
      }
    });

    this.elem.css({
      'width': '100%',
      'height': parseInt(this.root_elem.get(0).style.height),
      'user-select': 'none',
      'cursor': 'default',
      'position': 'relative'
    });
    this.root_elem.css('height', '100%');
    this.opts = opts || {};

    this.data = {};
    this.charts = {};
    this.extent = [];
    this.extent_coordinates = [];
    this.is_touch_device = 'ontouchstart' in document.documentElement;
    this.d3_eventSource = function () {
      let e = d3.event, s;
      while (s = e.sourceEvent) e = s;
      return e;
    }

    this.custom_interpolations = {
      sankey: function(points) {
        let x0 = points[0][0], y0 = points[0][1], x1, y1, x2, path = [x0, ",", y0], i = 0, n = points.length;
        while (++i < n) {
          x1 = points[i][0], y1 = points[i][1], x2 = (x0 + x1) / 2;
          path.push("C", x2, ",", y0, " ", x2, ",", y1, " ", x1, ",", y1);
          x0 = x1, y0 = y1;
        }
        return path.join("");
      }
    };

    this.xlabelcolor = 'steelblue';
    this.ylabelcolor = 'steelblue';

    this.first_time = true;
    this.last_render = null;

    this.data_changed = false;

    this.setup();
  }

  setup() {
    this.setupOpts();
    this.setupOnce();
    this.setupRedraw();

    this.draw();
  }

  draw() {
    if (!this.data_changed) {
      if (this.last_render !== null)
      if (Date.now() - this.last_render < 300) return;
      this.last_render = Date.now();
    }
    this.data_changed = false;
    if (!this.root_elem.is(':visible')) return;
    this._draw($(window).width(), $(window).height());
  }

  uid(type) {
    return 'rubixcc-' + type +'-' + Math.floor(2147483648*Math.random()).toString(36);
  }

  /** @private */
  setupOpts() {
    this.opts.theme_style = this.opts.theme_style || $('body').attr('data-theme') || 'light';
    this.opts.theme_style_color = this.opts.gridColor || ((this.opts.theme_style === 'light') ? '#C0D0E0' : '#555');
    this.opts.theme_focus_line_color = this.opts.focusLineColor || ((this.opts.theme_style === 'light') ? '#C0D0E0' : '#888');
    this.opts.tickColor = this.opts.tickColor || ((this.opts.theme_style === 'light') ? '#666' : '#999');

    this.opts.titleColor = this.opts.titleColor || 'steelblue';
    this.opts.subtitleColor = this.opts.subtitleColor || 'steelblue';

    this.opts.legend_color_brightness = this.opts.legend_color_brightness || 0.5;

    this.title.css('color', this.opts.titleColor);
    this.subtitle.css('color', this.opts.subtitleColor);

    if (this.opts.theme_style === 'dark' || this.opts.tooltip.theme_style === 'dark') {
      this.tooltip.css({
        "color": "#aaa",
        "font-weight": "bold",
        "border": "1px solid #222",
        "background-color": "#303030"
      });
    }

    this.opts.margin = this.opts.margin || {};
    this.margin = {
      top    : (this.opts.margin.top >= 0) ? this.opts.margin.top : 25,
      left   : (this.opts.margin.left >= 0) ? this.opts.margin.left : 25,
      right  : (this.opts.margin.right >= 0) ? this.opts.margin.right : 12.5,
      bottom : (this.opts.margin.bottom >= 0) ? this.opts.margin.bottom : 25
    };

    this.opts.draw = this.opts.draw || {};
    this.opts.draw = {
      grid: (this.opts.draw.grid === false) ? false : true
    };

    this.opts.invertAxes = this.opts.invertAxes || false;
    this.opts.axis = this.opts.axis || {};
    this.opts.axis.x = this.opts.axis.x || {};
    this.opts.axis.y = this.opts.axis.y || {};
    this.axis = {
      x: {
        type: this.opts.axis.x.type || 'linear',
        range: this.opts.axis.x.range || '',
        tickCount : this.opts.axis.x.tickCount,
        tickFormat: this.opts.axis.x.tickFormat || '',
        label: this.opts.axis.x.label || '',
        labelColor: this.opts.axis.x.labelColor || 'steelblue'
      },
      y: {
        type: this.opts.axis.y.type || 'linear',
        range: this.opts.axis.y.range || '',
        tickCount : this.opts.axis.y.tickCount,
        tickFormat: this.opts.axis.y.tickFormat || '',
        label: this.opts.axis.y.label || '',
        labelColor: this.opts.axis.y.labelColor || 'steelblue'
      }
    };

    this.xlabelcolor = this.opts.axis.x.labelColor;
    this.ylabelcolor = this.opts.axis.y.labelColor;

    if (this.axis.x.label.length) {
      if (this.opts.invertAxes) {
        this.margin.left += 15;
      } else {
        this.margin.bottom += 15;
      }
    }

    if (this.axis.y.label.length) {
      if (this.opts.invertAxes) {
        this.margin.bottom += 15;
      } else {
        this.margin.left += 15;
      }
    }

    this.margin.defaultLeft = this.margin.left;

    this.opts.tooltip = this.opts.tooltip || {};
    this.opts.tooltip.format = this.opts.tooltip.format || {};
    this.opts.tooltip.abs = this.opts.tooltip.abs || {};
    this.tooltipFormatter = {
      format: {
        x: this.opts.tooltip.format.x || '',
        y: this.opts.tooltip.format.y || ''
      },
      abs: {
        x: (this.opts.tooltip.abs.hasOwnProperty('x')) ? this.opts.tooltip.abs.x : false,
        y: (this.opts.tooltip.abs.hasOwnProperty('y')) ? this.opts.tooltip.abs.y : false
      }
    }

    if (this.opts.invertAxes) {
      let temp = this.axis.x;
      this.axis.x = this.axis.y;
      this.axis.y = temp;

      let temp2 = this.tooltipFormatter.format.x;
      this.tooltipFormatter.format.x = this.tooltipFormatter.format.y;
      this.tooltipFormatter.format.y = temp2;
    }

    if (this.opts.animationSpeed !== 0) {
      this.animationSpeed = this.opts.animationSpeed || 750;
    }

    this.opts.interval = this.opts.start_interval || 0;

    this.stacked = this.opts.stacked || false;
    this.grouped = this.opts.grouped || false;
    this.offset = this.opts.offset || 'zero';
    this.order  = this.opts.order || 'default';
    this.show_markers = this.opts.show_markers || false;

    this.resize = this.opts.resize || 'debounced';

    this.interpolate = this.opts.interpolate || 'linear';
    switch (this.interpolate) {
      case 'sankey':
      this.interpolate = this.custom_interpolations[this.interpolate];
      break;
      default:
      // do nothing
      break;
    }

    this.master_detail = this.opts.master_detail || false;

    this.master_detail_height = this.opts.master_detail_height || 50;
    if (this.master_detail) {
      this.master_detail_margin_bottom = this.margin.bottom;
      this.margin.bottom = (2 * this.margin.bottom) + this.master_detail_height;
    }

    this.opts.title = this.opts.title || '';
    this.opts.subtitle = this.opts.subtitle || '';

    this.title.html(this.opts.title);
    this.subtitle.html(this.opts.subtitle);
    if (this.opts.title.length || this.opts.subtitle.length) {
      this.elem.css('margin-top', '-20px');
    }
    (this.opts.title.length) ? this.title.show() : this.title.hide();
    (this.opts.subtitle.length) ? this.subtitle.show() : this.subtitle.hide();
  };

  /** @private */
  setupOnce() {
    let self = this;
    this.area_stack_data = [];
    this.area_stack = d3.layout.stack();
    this.area_stack.offset(this.offset);
    this.area_stack.order(this.order);
    this.area_stack.values(function(d) {
      return d.values;
    });
    this.area_stack.x(function(d) {
      return d.x;
    });
    this.area_stack.y(function(d) {
      return d.y;
    });
    this.area_stack.out(function(d, y0, y) {
      d.y0 = y0;
      d.y_new = y;
    });
    this.column_stack_data = [];
    this.column_stack = d3.layout.stack();
    this.column_stack.offset('zero');
    this.column_stack.order('default');
    this.column_stack.values(function(d) {
      return d.values;
    });
    this.column_stack.x(function(d) {
      return d.x;
    });
    this.column_stack.y(function(d) {
      return d.y;
    });
    this.column_stack.out(function(d, y0, y) {
      d.y0 = y0;
      d.y_new = y;
    });
  };

  /** @private */
  _setupAxis(animate) {
    switch (this.axis.x.type) {
      case 'linear': {
        this.x = d3.scale.linear();
        this.x.tickFormat(d3.format(this.axis.x.tickFormat));

        let range = [0, this.width];
        let masterRange = [0, this.width];
        if (this.master_detail) {
          this.x2 = d3.scale.linear();
        }

        if (this.axis.x.range === 'round') {
          this.x.rangeRound(range);

          if (this.master_detail) {
            this.x2.rangeRound(masterRange);
          }
        } else {
          this.x.range(range);

          if (this.master_detail) {
            this.x2.range(masterRange);
          }
        }
      }
      break;
      case 'ordinal': {
        this.x = d3.scale.ordinal();

        let range = [0, this.width];
        let masterRange = [0, this.width];
        if (this.master_detail) {
          this.canvas.select('.noData').text('Master-Detail chart only for quantitative scales.');
          throw new Error('Master-Detail chart only for quantitative scales.');
        }

        if (this.axis.x.range === 'round') {
          this.x.rangeRoundBands(range);
        } else if (this.axis.x.range == 'column' || this.axis.x.range == 'bar') {
          this.x.rangeRoundBands(range, 0.35);
        } else {
          this.x.rangePoints(range);

          if (this.master_detail) {
            this.x2.rangePoints(range);
          }
        }
      }
      break;
      case 'datetime': {
        this.x = d3.time.scale();
        this.x.ticks(d3.time.year, 50);
        this.x.tickFormat(d3.format(this.axis.x.tickFormat));

        let range = [0, this.width];
        let masterRange = [0, this.width];
        if (this.master_detail) {
          this.x2 = d3.time.scale();
        }

        if (this.axis.x.range === 'round') {
          this.x.rangeRound(range);

          if (this.master_detail) {
            this.x2.rangeRound(masterRange);
          }
        } else {
          this.x.range(range);

          if (this.master_detail) {
            this.x2.range(masterRange);
          }
        }
      }
      break;
      default:
      throw new Error('Unknown Scale for X Axis: ' + this.axis.x.type);
      break;
    }

    switch (this.axis.y.type) {
      case 'linear': {
        this.y = d3.scale.linear();
        this.y.clamp(true);
        this.y.tickFormat(d3.format(this.axis.y.tickFormat));

        let range = [this.height, 0];
        let masterRange = [this.master_detail_height, 0];
        if (this.master_detail) {
          this.y2 = d3.scale.linear();
          this.y2.clamp(true);
        }

        if (this.axis.y.range === 'round') {
          this.y.rangeRound(range);

          if (this.master_detail) {
            this.y2.rangeRound(masterRange);
          }
        } else {
          this.y.range(range);

          if (this.master_detail) {
            this.y2.range(masterRange);
          }
        }
      }
      break;
      case 'ordinal': {
        this.y = d3.scale.ordinal();

        let range = [this.height, 0];
        let masterRange = [this.master_detail_height, 0];
        if (this.master_detail) {
          this.y2 = d3.scale.ordinal();
        }

        if (this.axis.y.range === 'round') {
          this.y.rangeRoundBands(range);

          if (this.master_detail) {
            this.y2.rangeRoundBands(masterRange);
          }
        } else if (this.axis.y.range == 'column' || this.axis.y.range == 'bar') {
          this.y.rangeRoundBands(range, 0.35);
        } else {
          this.y.rangePoints(range);

          if (this.master_detail) {
            this.y2.rangePoints(masterRange);
          }
        }
      }
      break;
      case 'datetime': {
        this.y = d3.time.scale();
        this.y.tickFormat(d3.format(this.axis.y.tickFormat));
        this.y.clamp(true);

        let range = [this.height, 0];
        let masterRange = [this.master_detail_height, 0];
        if (this.master_detail) {
          this.y2 = d3.time.scale();
          this.y2.clamp(true);
        }

        if (this.axis.y.range === 'round') {
          this.y.rangeRound(range);

          if (this.master_detail) {
            this.y2.rangeRound(masterRange);
          }
        } else {
          this.y.range(range);

          if (this.master_detail) {
            this.y2.range(masterRange);
          }
        }
      }
      break;
      default:
      throw new Error('Unknown Scale for X Axis: ' + this.axis.y.type);
      break;
    }

    this.fontSize = 10;
    let yTicks = Math.floor((this.height / (this.fontSize + 3)) / 2);

    this.xAxis = d3.svg.axis();
    this.xAxis.scale(this.x).orient('bottom');

    if (this.master_detail) {
      this.xAxis2 = d3.svg.axis();
      this.xAxis2.scale(this.x2).orient('bottom');
    }

    if (this.axis.x.range === 'round' && (this.axis.x.type === 'linear' || this.axis.x.type === 'datetime')) {
      if (this.axis.x.type === 'linear') {
        this.xAxis.tickFormat(d3.format(this.axis.x.tickFormat));
      } else if (this.axis.x.type === 'datetime') {
        this.xAxis.tickFormat(d3.time.format(this.axis.x.tickFormat));
      }

      if (this.master_detail) {
        if (this.axis.x.type === 'linear') {
          this.xAxis2.tickFormat(d3.format(this.axis.x.tickFormat));
        } else {
          this.xAxis2.tickFormat(d3.time.format(this.axis.x.tickFormat));
        }
      }
    }

    if (this.axis.x.tickFormat) {
      if (this.axis.x.type === 'linear') {
        this.xAxis.tickFormat(d3.format(this.axis.x.tickFormat));
      } else if (this.axis.x.type === 'datetime') {
        this.xAxis.tickFormat(d3.time.format(this.axis.x.tickFormat));
      }

      if (this.master_detail) {
        if (this.axis.x.type === 'linear') {
          this.xAxis2.tickFormat(d3.format(this.axis.x.tickFormat));
        } else {
          this.xAxis2.tickFormat(d3.time.format(this.axis.x.tickFormat));
        }
      }
    }

    this.xGrid = d3.svg.axis();
    this.xGrid.scale(this.x).orient('bottom').ticks(5).tickSize(-this.height, 0, 0).tickFormat('');

    if (this.axis.x.tickCount !== undefined) {
      this.xGrid.ticks(this.axis.x.tickCount);
    }

    if (this.master_detail) {
      this.xGrid2 = d3.svg.axis();
      this.xGrid2.scale(this.x2).orient('bottom').ticks(5).tickSize(-this.master_detail_height, 0, 0).tickFormat('');
    }

    this.yAxis = d3.svg.axis();
    this.yAxis.scale(this.y).orient('left');

    this.yAxis.ticks(yTicks);

    if (this.axis.y.range === 'round' && (this.axis.y.type === 'linear' || this.axis.y.type === 'datetime')) {
      if (this.axis.y.type === 'linear') {
        this.yAxis.tickFormat(d3.format(this.axis.y.tickFormat));
      } else if (this.axis.y.type === 'datetime') {
        this.yAxis.tickFormat(d3.time.format(this.axis.y.tickFormat));
      }
    }

    if (this.axis.y.tickFormat) {
      if (this.axis.y.type === 'linear') {
        this.yAxis.tickFormat(d3.format(this.axis.y.tickFormat));
      } else if (this.axis.y.type === 'datetime') {
        this.yAxis.tickFormat(d3.time.format(this.axis.y.tickFormat));
      }
    }

    this.yGrid = d3.svg.axis();
    this.yGrid.scale(this.y).orient('left').ticks(5).tickSize(-this.width, 0, 0).tickFormat('');
    if (this.axis.y.tickCount !== undefined) {
      this.yGrid.ticks(this.axis.y.tickCount);
    }
    this.xAxisGroup = this.axis_group.append('g');
    this.xAxisGroup.attr('class', 'x axis');
    this.xAxisGroup.attr('transform', 'translate(0, ' +this.height+')');
    this.xAxisGroup.call(this.xAxis);
    this.xAxisGroup.select('path').style('fill', 'none').style('stroke', this.opts.theme_style_color).style('shape-rendering', 'crispEdges');
    this.xAxisGroup.selectAll('line').attr('fill', 'none').attr('stroke', this.opts.theme_style_color).style('shape-rendering', 'crispEdges');

    if (this.master_detail) {
      this.xAxisGroup2 = this.md_root.append('g');
      this.xAxisGroup2.attr('class', 'x axis');
      // this.xAxisGroup2.attr('transform', 'translate(0, ' + this.master_detail_height +')');
      this.xAxisGroup2.call(this.xAxis2);
      this.xAxisGroup2.select('path').style('fill', 'none');
      this.xAxisGroup2.select('line').style('fill', 'none').style('stroke', this.opts.theme_style_color).style('shape-rendering', 'crispEdges');
      this.xAxisGroup2.selectAll('line').attr('fill', 'none').attr('stroke', this.opts.theme_style_color).style('shape-rendering', 'crispEdges');
    }

    this.yAxisGroup = this.axis_group.append('g');
    this.yAxisGroup.attr('class', 'y axis');
    this.yAxisGroup.call(this.yAxis);
    this.yAxisGroup.select('path').style('fill', 'none').style('stroke', this.opts.theme_style_color).style('shape-rendering', 'crispEdges');
    this.yAxisGroup.selectAll('line').attr('fill', 'none').attr('stroke', this.opts.theme_style_color).style('shape-rendering', 'crispEdges');

    if (this.opts.draw.grid) {
      this.xGridGroup = this.grid_group.append('g');
      this.xGridGroup.attr('class', 'x grid');
      this.xGridGroup.attr('transform', 'translate(0,' +this.height+')');
      this.xGridGroup.call(this.xGrid);
      this.xGridGroup.selectAll('path').style('stroke-width', 0);
      this.xGridGroup.selectAll('.tick').style('stroke', this.opts.theme_style_color).style('opacity', 0.7);
    }

    if (this.master_detail) {
      this.xGridGroup2 = this.md_root.select('.md-grid').append('g');
      this.xGridGroup2.attr('class', 'x grid');
      this.xGridGroup2.attr('transform', 'translate(0,' +this.master_detail_height+')');
      this.xGridGroup2.call(this.xGrid2);
      this.xGridGroup2.selectAll('path').style('stroke-width', 0);
      this.xGridGroup2.selectAll('.tick').style('stroke', 'lightgray').style('opacity', 0.7);
    }

    if (this.opts.draw.grid) {
      this.yGridGroup = this.grid_group.append('g');
      this.yGridGroup.attr('class', 'y grid');
      this.yGridGroup.call(this.yGrid);
      this.yGridGroup.selectAll('path').style('stroke-width', 0);
      this.yGridGroup.selectAll('.tick').style('stroke', this.opts.theme_style_color).style('opacity', 0.7);
    }

    this.resetAxis(animate);

    if (this.master_detail) {
      if (this.axis.x.type === 'ordinal') {
        this.canvas.select('.noData').text('Master-Detail chart only for quantitative scales.');
        throw new Error('Master-Detail chart only for quantitative scales.');
      }
      this.brush = d3.svg.brush();
      this.brush.x(this.x2);
      let self = this;
      if (this.axis.x.type === 'datetime') {
        this.brush.on('brushend', () => {
          if (self.is_touch_device) {
            let coordinates = d3.touches(this, self.d3_eventSource().changedTouches)[0];
          } else {
            let coordinates = d3.mouse(this);
          }
          let x = coordinates[0];

          if (self.brush.empty()) {
            let current_x0 = self.x2(+new Date(self.extent[0]));
            let current_x1 = self.x2(+new Date(self.extent[1]));

            let distance_x0_x = current_x0 - x;

            let final_extent = [];
            if (distance_x0_x < 0) {
              let start = current_x0 + Math.abs(distance_x0_x);
              let finish = current_x1 + Math.abs(distance_x0_x);
              let max_extent = self.x2(+new Date(self.x2.domain()[1]));
              if (finish > max_extent) {
                start -= (finish - max_extent);
                finish = max_extent;
                final_extent = [
                  self.x2.invert(start),
                  self.x2.invert(finish)
                ];
              } else {
                let diff = Math.abs(start - finish);
                final_extent = [
                  self.x2.invert(start - diff/2),
                  self.x2.invert(finish - diff/2)
                ];
              }
            } else {
              let start = current_x0 - Math.abs(distance_x0_x);
              let finish = current_x1 - Math.abs(distance_x0_x);

              let diff = Math.abs(start - finish);
              let final_start = start - diff/2;
              let final_finish = finish - diff/2;

              let min_extent = self.x2(+new Date(self.x2.domain()[0]));

              if (final_start < min_extent) {
                final_finish += (min_extent - final_start);
                final_start = min_extent;
              }
              final_extent = [
                self.x2.invert(final_start),
                self.x2.invert(final_finish)
              ];
            }

            self.extent = final_extent;
            self.brush.extent(self.extent);
            self.brush_path.call(self.brush);
            self._brush();
          }


          let brush_x_pos = self.brush_path.select('.extent').attr('x');
          let brush_width = self.brush_path.select('.extent').attr('width');
          let brush_height = self.brush_path.select('.extent').attr('height');

          self.brush_path.select('.left-extent').attr('height', brush_height).attr('width', brush_x_pos).attr('x', 0);
          let brush_r_x_pos = parseFloat(brush_x_pos)+parseFloat(brush_width);
          self.brush_path.select('.right-extent').attr('height', brush_height).attr('x', brush_r_x_pos).attr('width', self.md_root.attr('width') - brush_r_x_pos);
          self.brush_path.select('.left-border').attr('width', 1).attr('x', brush_x_pos);
          self.brush_path.select('.left-top-border').attr('width', brush_x_pos);
          self.brush_path.select('.right-border').attr('width', 1).attr('x', brush_r_x_pos);
          self.brush_path.select('.right-top-border').attr('x', brush_r_x_pos).attr('width', self.md_root.attr('width') - brush_r_x_pos);
          self.brush_path.select('.bottom-border').attr('x', brush_x_pos).attr('width', brush_width).attr('transform', 'translate(0, ' + (self.master_detail_height+5) + ')');
        });
      } else {
        this.brush.on('brushend', () => {
          if (self.is_touch_device) {
            let coordinates = d3.touches(this, self.d3_eventSource().changedTouches)[0];
          } else {
            let coordinates = d3.mouse(this);
          }
          let x = self.x2.invert(coordinates[0]);

          if (self.brush.empty()) {
            let current_x0 = self.extent[0];
            let current_x1 = self.extent[1];

            let distance_x0_x = current_x0 - x;

            let final_extent = [];
            if (distance_x0_x < 0) {
              let start = current_x0 + Math.abs(distance_x0_x);
              let finish = current_x1 + Math.abs(distance_x0_x);
              let max_extent = self.x2.domain()[1];
              if (finish > max_extent) {
                start -= (finish - max_extent);
                finish = max_extent;
                final_extent = [
                  start,
                  finish
                ];
              } else {
                let diff = Math.abs(start - finish);
                final_extent = [
                  start - diff/2,
                  finish - diff/2
                ];
              }
            } else {
              let start = current_x0 - Math.abs(distance_x0_x);
              let finish = current_x1 - Math.abs(distance_x0_x);

              let diff = Math.abs(start - finish);
              let final_start = start - diff/2;
              let final_finish = finish - diff/2;

              let min_extent = self.x2.domain()[0];

              if (final_start < min_extent) {
                final_finish += (min_extent - final_start);
                final_start = min_extent;
              }
              final_extent = [
                final_start,
                final_finish
              ];
            }

            self.extent = final_extent;
            self.brush.extent(self.extent);
            self.brush_path.call(self.brush);
            self._brush();
          }

          let brush_x_pos = self.brush_path.select('.extent').attr('x');
          let brush_width = self.brush_path.select('.extent').attr('width');
          let brush_height = self.brush_path.select('.extent').attr('height');

          self.brush_path.select('.left-extent').attr('height', brush_height).attr('width', brush_x_pos).attr('x', 0);
          let brush_r_x_pos = parseFloat(brush_x_pos)+parseFloat(brush_width);
          self.brush_path.select('.right-extent').attr('height', brush_height).attr('x', brush_r_x_pos).attr('width', self.md_root.attr('width') - brush_r_x_pos);
          self.brush_path.select('.left-border').attr('width', 1).attr('x', brush_x_pos);
          self.brush_path.select('.left-top-border').attr('width', brush_x_pos);
          self.brush_path.select('.right-border').attr('width', 1).attr('x', brush_r_x_pos);
          self.brush_path.select('.right-top-border').attr('x', brush_r_x_pos).attr('width', self.md_root.attr('width') - brush_r_x_pos);
          self.brush_path.select('.bottom-border').attr('x', brush_x_pos).attr('width', brush_width).attr('transform', 'translate(0, ' + (self.master_detail_height+5) + ')');
        });
      }
      this.brush.on('brush', () => {
        let type = self.d3_eventSource().type;
        if (type === 'mousemove' || type === 'touchmove') {
          $(window).trigger('rubix.sidebar.off');
          self._brush(true, 'root');
        }
        let brush_x_pos = self.brush_path.select('.extent').attr('x');
        let brush_width = self.brush_path.select('.extent').attr('width');
        let brush_height = self.brush_path.select('.extent').attr('height');

        self.brush_path.select('.left-extent').attr('height', brush_height).attr('width', brush_x_pos).attr('x', 0);
        let brush_r_x_pos = parseFloat(brush_x_pos)+parseFloat(brush_width);
        self.brush_path.select('.right-extent').attr('height', brush_height).attr('x', brush_r_x_pos).attr('width', self.md_root.attr('width') - brush_r_x_pos);
        self.brush_path.select('.left-border').attr('width', 1).attr('x', brush_x_pos);
        self.brush_path.select('.left-top-border').attr('width', brush_x_pos);
        self.brush_path.select('.right-border').attr('width', 1).attr('x', brush_r_x_pos);
        self.brush_path.select('.right-top-border').attr('x', brush_r_x_pos).attr('width', self.md_root.attr('width') - brush_r_x_pos);
        self.brush_path.select('.bottom-border').attr('x', brush_x_pos).attr('width', brush_width).attr('transform', 'translate(0, ' + (self.master_detail_height+5) + ')');
      });
      if (this.extent.length) {
        this.brush.extent(this.extent);
        if (!this.extent_coordinates.length) {
          if (this.axis.x.type === 'datetime' || this.axis.y.type === 'datetime') {
            this.extent_coordinates = [
              this.x2(+new Date(this.extent[0])),
              this.x2(+new Date(this.extent[1]))
            ];
          } else {
            this.extent_coordinates = [
              this.x2(this.extent[0]),
              this.x2(this.extent[1])
            ];
          }
        }
        this._brush();
      }
    }
  };

  _setupSeries() {
    this.grid_group = this.root.append('g').attr('class', 'grid_group');
    this.axis_group = this.root.append('g').attr('class', 'axis_group');

    if (this.opts.hideGrid) {
      this.grid_group.style('display', 'none');
    }
    if (this.opts.hideAxisAndGrid) {
      this.grid_group.style('display', 'none');
      this.axis_group.style('display', 'none');
    }

    this.root_cb_series = this.root.append('g').attr('class', 'cb_series');
    this.root_stacked_area_series = this.root.append('g').attr('class', 'stacked_area_series');
    this.root_area_series = this.root.append('g').attr('class', 'area_series');
    this.root_line_series = this.root.append('g').attr('class', 'line_series');

    this.focus_line_group = this.root.append('g').attr('class', 'focus_line_group');

    this.symbols_group = this.root.append('g').attr('class', 'symbols');
    this.focus_group = this.root.append('g').attr('class', 'focus_group');

    if (this.master_detail) {
      this.md_root_stacked_area_series = this.md_layers.append('g').attr('class', 'md_stacked_area_series');
      this.md_root_area_series = this.md_layers.append('g').attr('class', 'md_area_series');
      this.md_root_line_series = this.md_layers.append('g').attr('class', 'md_line_series');
    }
  };

  resetExtent() {
    let curr_extent = this.brush.extent();
    if (curr_extent.length) {
      let start = this.extent_coordinates[0];
      let finish = this.extent_coordinates[1];
      if (this.axis.x.type === 'datetime' || this.axis.y.type === 'datetime') {
        this.extent = [this.x2.invert(+new Date(start)), this.x2.invert(+new Date(finish))];
      } else {
        this.extent = [this.x2.invert(start), this.x2.invert(finish)];
      }
      this.brush.extent(this.extent);
      this._brush_nochange();
    }
  };

  _brush_nochange() {
    try {
      this.x.domain(this.extent);
      this.callAxis();
      for(let i in this.charts) {
        this.charts[i].noRedraw(this);
      }
    } catch(e) {
      // do nothing
    }
  };

  _brush(record, type) {
    let extent = this.brush.empty() ? this.x2.domain() : this.brush.extent();
    if (this.axis.x.type === 'datetime' || this.axis.y.type === 'datetime') {
      this.extent = extent;
      if (record && type === 'root') {
        this.extent_coordinates = [
          this.x2(+new Date(this.extent[0])),
          this.x2(+new Date(this.extent[1]))
        ];
      }
    } else {
      this.extent = extent;
      if (record && type === 'root') {
        this.extent_coordinates = [
          this.x2(this.extent[0]),
          this.x2(this.extent[1])
        ];
      }
    }
    this._brush_nochange();
  };

  _setupOrdinalAxis(forced) {
    let data = {}, o_data = {};
    let _data = [], _data1 = [], extentX, extentY, rdata;
    this.crosshair_data = [], _o_data = [];
    let temp = {}, others = {};
    if (this.axis.x.type === 'ordinal' || this.axis.y.type === 'ordinal') {
      for(let series in this.data) {
        rdata = this.data[series];
        let chart = this.charts[series];
        for(let i = 0; i < rdata.length; i++) {
          let x = rdata[i].x;
          let y0 = 0;
          if (this.stacked) {
            if (rdata[i].hasOwnProperty('y0')) {
              let y0 = rdata[i].y0;
            }
            if (rdata[i].hasOwnProperty('y_new')) {
              if (this.grouped && chart.type === 'column_series') {
                let y = rdata[i].y_new;
              } else {
                let y = rdata[i].y_new + y0;
              }
            } else {
              let y = rdata[i].y;
            }
          } else {
            let y = rdata[i].y;
          }
          _data1.push(y);
          if (!data.hasOwnProperty(x)) {
            data[x] = [];
          }
          data[x].push(y);
          if (forced) {
            if (!o_data.hasOwnProperty(y)) {
              o_data[y] = [];
            }
            o_data[y].push(x);
          }

          if (!temp.hasOwnProperty(x)) {
            temp[x] = {};
          }
          temp[x][series] = y;
          if (!others.hasOwnProperty(x)) {
            others[x] = {};
          }
          others[x][series] = {
            y0: y0
          };
        }
      }

      for(let point in data) {
        _data.push(point);
      }
      if (forced) {
        for(let point in o_data) {
          _o_data.push(point);
        }
      }

      if (this.stacked) {
        let _minY = d3.min(_data1, function(d) {
          if (isNaN(d)) {
            return 0;
          }
          return d;
        });

        _minY = _minY < 0 ? _minY : 0;

        let extentY = [_minY, d3.max(_data1, function(d) {
          if (isNaN(d)) {
            return 0;
          }
          return d;
        })];
      } else {
        let extentY = d3.extent(_data1);
      }
      let yMin = extentY[0];
      let yMax = extentY[1];

      if (this.opts.invertAxes) {
        if (this.axis.y.tickFormat.length) {
          for(let i = 0; i < _data.length; i++) {
            _data[i] = +_data[i];
          }
          _data.sort(function(a, b) {
            if (a > b) {
              return 1;
            } else if (a === b) {
              return 0
            } else {
              return -1;
            }
          });
        }

        if (forced) {
          if (this.axis.x.tickFormat.length) {
            for(let i = 0; i < _o_data.length; i++) {
              _o_data[i] = +_o_data[i];
            }
            _o_data.sort(function(a, b) {
              if (a > b) {
                return 1;
              } else if (a === b) {
                return 0
              } else {
                return -1;
              }
            });
          }

          this.x.domain(_o_data);
          this.y.domain(_data.reverse());

          if (this.master_detail) {
            this.x2.domain(_o_data);
            this.y2.domain(_data);
          }
        } else {
          this.x.domain([yMin, yMax]);
          this.y.domain(_data.reverse());

          if (this.master_detail) {
            this.x2.domain([yMin, yMax]);
            this.y2.domain(_data);
          }
        }
      } else {
        if (this.axis.x.tickFormat.length) {
          for(let i = 0; i < _data.length; i++) {
            _data[i] = +_data[i];
          }
          _data.sort(function(a, b) {
            if (a > b) {
              return 1;
            } else if (a === b) {
              return 0
            } else {
              return -1;
            }
          });
        }

        if (forced) {
          if (this.axis.y.tickFormat.length) {
            for(let i = 0; i < _o_data.length; i++) {
              _o_data[i] = +_o_data[i];
            }
            _o_data.sort(function(a, b) {
              if (a > b) {
                return 1;
              } else if (a === b) {
                return 0
              } else {
                return -1;
              }
            });
          }

          this.x.domain(_data);
          this.y.domain(_o_data);

          if (this.master_detail) {
            this.x2.domain(_data);
            this.y2.domain(_o_data);
          }
        } else {
          this.x.domain(_data);
          this.y.domain([yMin, yMax]);

          if (this.master_detail) {
            this.x2.domain(_data);
            this.y2.domain([yMin, yMax]);
          }
        }
      }

      for(let x in temp) {
        if (this.opts.invertAxes) {
          let _x = this.y(x);
          this.crosshair_data.push({
            x: +_x,
            y: temp[x],
            others: others[x]
          });
        } else {
          let _x = this.x(x);
          this.crosshair_data.push({
            x: +_x,
            y: temp[x],
            others: others[x]
          });
        }
      }

      this.crosshair_data.sort(function(a, b) {
        if (a.x > b.x) {
          return 1;
        } else if (a.x === b.x) {
          return 0;
        } else {
          return -1;
        }
      });
    }
  };

  _setupLinearAxis() {
    let xMin=null, xMax=null, yMin=null, yMax=null;
    let data, extentX, extentY;
    this.crosshair_data = [];
    let temp = {}, others = {};
    for(let series in this.data) {
      data = this.data[series];
      extentX = d3.extent(data, function(d) {return d.x});
      if (this.stacked) {
        let _minY = d3.min(data, function(d) {
          let val = d.y0 + d.y_new;
          if (isNaN(val)) {
            if (d.y) return d.y;
            return 0;
          }
          return val;
        });

        _minY = _minY < 0 ? _minY : 0;

        extentY = [_minY, d3.max(data, function(d) {
          let val = d.y0 + d.y_new;
          if (isNaN(val)) {
            if (d.y) return d.y;
            return 0;
          }
          return val;
        })];
      } else {
        extentY = d3.extent(data, function(d) {return d.y;});
      }

      if (xMin === null) {
        xMin = extentX[0];
        xMax = extentX[1];
      } else {
        if (xMin >= extentX[0]) xMin = extentX[0];
        if (xMax <= extentX[1]) xMax = extentX[1];
      }
      if (yMin === null) {
        yMin = extentY[0];
        yMax = extentY[1];
      } else {
        if (yMin >= extentY[0]) yMin = extentY[0];
        if (yMax <= extentY[1]) yMax = extentY[1];
      }

      for(let i = 0; i < data.length; i++) {
        let x = data[i].x;
        let y0 = 0;
        if (this.stacked) {
          if (data[i].hasOwnProperty('y0')) {
            let y0 = data[i].y0;
          }
          if (data[i].hasOwnProperty('y_new')) {
            let y = data[i].y_new + y0;
          } else {
            let y = data[i].y;
          }
        } else {
          let y = data[i].y;
        }

        if (!temp.hasOwnProperty(x)) {
          temp[x] = {};
        }
        temp[x][series] = y;
        if (!others.hasOwnProperty(x)) {
          others[x] = {};
        }
        others[x][series] = {
          y0: y0
        };
      }
    }

    if (this.opts.invertAxes) {
      this.x.domain([yMin, yMax]);
      this.y.domain([xMax, xMin]);
      if (this.master_detail) {
        this.x2.domain([yMin, yMax]);
        this.y2.domain([xMax, xMin]);
      }
    } else {
      this.x.domain([xMin, xMax]);
      this.y.domain([yMin, yMax]);
      if (this.master_detail) {
        this.x2.domain([xMin, xMax]);
        this.y2.domain([yMin, yMax]);
      }
    }

    for(let x in temp) {
      this.crosshair_data.push({
        x: +x,
        y: temp[x],
        others: others[x]
      });
    }

    this.crosshair_data.sort(function(a, b) {
      if (a.x > b.x) {
        return 1;
      } else if (a.x === b.x) {
        return 0;
      } else {
        return -1;
      }
    });
  };

  resetAxis(animate) {
    try {
      if (this.axis.x.type === 'linear' && this.axis.y.type === 'linear') {
        this._setupLinearAxis();
      } else if (
        (this.axis.x.type === 'datetime' && this.axis.y.type === 'linear')
        ||  (this.axis.x.type === 'linear' && this.axis.y.type === 'datetime')
      ) {
        this._setupLinearAxis();
      } else if (this.axis.x.type === 'ordinal' && this.axis.y.type === 'ordinal') {
        this._setupOrdinalAxis(true);
      } else if (this.axis.x.type === 'ordinal' || this.axis.y.type === 'ordinal') {
        this._setupOrdinalAxis();
      }

      this.callAxis(animate);
    } catch(e) {
      // do nothing
    }
  };

  callAxis(animate) {
    if (animate) {
      let t = this.root.transition().duration(this.animationSpeed);
      if (this.master_detail) {
        let z = this.md_root.transition().duration(this.animationSpeed);
      }
    } else {
      let t = this.root;
      if (this.master_detail) {
        let z = this.md_root;
      }
    }

    if (this.hasData) {
      if (this.axis.x.type === 'ordinal') {
        let domain = this.x.domain();
        if ((this.axis.x.tickCount !== undefined) && (domain.length > this.axis.x.tickCount)) {
          let self = this;
          let feed = d3.range(domain.length).map(function(d) {
            if (d % self.axis.x.tickCount === 0)
            return domain[d];
            return null;
          });

          let cleanedFeed = [];
          for(let i = 0; i < feed.length; i++) {
            if (feed[i] === null) continue;
            cleanedFeed.push(feed[i]);
          }
          this.xAxis.tickValues(cleanedFeed);
        }
      } else {
        if (this.axis.x.tickCount !== undefined) {
          this.xAxis.ticks(this.axis.x.tickCount);

          if (this.master_detail) {
            this.xAxis2.ticks(this.axis.x.tickCount);
          }
        }
      }

      if (this.axis.y.type === 'ordinal' || this.axis.x.type === 'linear' || this.axis.x.type === 'datetime') {
        let domain = this.y.domain();
        if ((this.axis.y.tickCount !== undefined) && (domain.length > this.axis.y.tickCount)) {
          let self = this;
          let feed = d3.range(domain.length).map(function(d) {
            if (d % self.axis.y.tickCount === 0) {
              return domain[d];
            }
            return '';
          });

          this.yAxis.tickValues(feed);
        }
      } else {
        if (this.axis.y.tickCount !== undefined) {
          this.yAxis.ticks(this.axis.y.tickCount);
        }
      }

      this.canvas.select('.noData').style('display', 'none');
      try {
        t.selectAll('.x.axis').style('display', null).call(this.xAxis);
        t.selectAll('.y.axis').style('display', null).call(this.yAxis);
        t.selectAll('.x.grid').style('display', null).call(this.xGrid);
        t.selectAll('.y.grid').style('display', null).call(this.yGrid);
      } catch(e) {
        // do nothing
      }
      this.xAxisGroup.selectAll('line').attr('fill', 'none').attr('stroke', this.opts.theme_style_color).style('shape-rendering', 'crispEdges');
      this.yAxisGroup.selectAll('line').attr('fill', 'none').attr('stroke', this.opts.theme_style_color).style('shape-rendering', 'crispEdges');

      if (this.opts.draw.grid) {
        this.xGridGroup.selectAll('path').style('stroke-width', 0);
        this.xGridGroup.selectAll('.tick').style('stroke', this.opts.theme_style_color).style('opacity', 0.7);
        this.yGridGroup.selectAll('path').style('stroke-width', 0);
        this.yGridGroup.selectAll('.tick').style('stroke', this.opts.theme_style_color).style('opacity', 0.7);
      }

      this.xAxisGroup.selectAll('text').style('font', (this.fontSize+1)+'px Lato, "Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif').style('direction', 'ltr').style('fill', this.opts.tickColor).style('color', this.opts.tickColor).style('font-style', '').style('font-variant', '').style('font-weight', '').style('line-height', '');
      this.yAxisGroup.selectAll('text').style('font', (this.fontSize+1)+'px Lato, "Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif').style('direction', 'ltr').style('fill', this.opts.tickColor).style('color', this.opts.tickColor).style('font-style', '').style('font-variant', '').style('font-weight', '').style('line-height', '');
      if (this.opts.theme_style === 'dark') {
        this.xAxisGroup.selectAll('text').style('font-weight', 'bold');
        this.yAxisGroup.selectAll('text').style('font-weight', 'bold');
      }
    } else {
      this.canvas.select('.noData').style('display', null);
      t.selectAll('.x.axis').style('display', 'none');
      t.selectAll('.y.axis').style('display', 'none');
      t.selectAll('.x.grid').style('display', 'none');
      t.selectAll('.y.grid').style('display', 'none');
    }
    if (this.master_detail) {
      if (this.hasData) {
        this.canvas.select('.noData').style('display', 'none');
        z.selectAll('.x.axis').style('display', null).call(this.xAxis2);
        z.selectAll('.x.grid').style('display', null).call(this.xGrid2);
        if (this.xAxisGroup2) {
          this.xAxisGroup2.selectAll('line').attr('fill', 'none').attr('stroke', this.opts.theme_style_color).style('shape-rendering', 'crispEdges');
          this.xGridGroup2.selectAll('path').style('stroke-width', 0);
          this.xGridGroup2.selectAll('.tick').style('stroke', this.opts.theme_style_color).style('opacity', 0.7);
          this.xAxisGroup2.selectAll('text').style('font', (this.fontSize+1)+'px Lato, "Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif').style('direction', 'ltr').style('fill', this.opts.tickColor).style('color', this.opts.tickColor).style('font-style', '').style('font-variant', '').style('font-weight', '').style('line-height', '');
          if (this.opts.theme_style === 'dark') {
            this.xAxisGroup2.selectAll('text').style('font-weight', 'bold');
          }
        }
        if (this.yAxisGroup2) {
          this.yAxisGroup2.selectAll('text').style('font', (this.fontSize+1)+'px Lato, "Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif').style('direction', 'ltr').style('fill', this.opts.tickColor).style('color', this.opts.tickColor).style('font-style', '').style('font-variant', '').style('font-weight', '').style('line-height', '');
          if (this.opts.theme_style === 'dark') {
            this.yAxisGroup.selectAll('text').style('font-weight', 'bold');
          }
        }
      } else {
        this.canvas.select('.noData').style('display', null);
        z.selectAll('.x.axis').style('display', 'none');
        z.selectAll('.y.axis').style('display', 'none');
        z.selectAll('.x.grid').style('display', 'none');
        z.selectAll('.y.grid').style('display', 'none');
      }
    }


    if (this.opts.hideYAxis) {
      this.yAxisGroup.style('display', 'none');
    }
    if (this.opts.hideXAxis) {
      this.xAxisGroup.style('display', 'none');
    }
    if (this.opts.hideXAxisTickLines) {
      this.xGridGroup.style('display', 'none');
    }
    if (this.opts.hideYAxisTickLines) {
      this.yGridGroup.style('display', 'none');
    }
  };

  /** @private */
  setupRedraw() {
    let self = this;

    $(window).on('orientationchange.' +this.masterId, () => {
      self.draw();
    });

    $(window).on('rubix.redraw.' +this.masterId, () => {
      self.draw();
    });

    switch (this.resize) {
      case 'always':
      $(window).on('resize.rubix.' +this.masterId, () => {
        self.draw();
      });
      break;
      case 'debounced':
      $(window).on('debouncedresize.rubix.' +this.masterId, () => {
        self.draw();
      });
      break;
      case 'throttled':
      $(window).on('throttledresize.rubix.' +this.masterId, () => {
        self.draw();
      });
      break;
      default:
      throw new Error('Unknown resize type!');
      break;
    }
  };

  /**
  * @param {number} window_width
  * @param {number} window_height
  * @private
  */
  _draw(window_width, window_height) {
    this._cleanElement();
    this._setSize();
    this._setupCanvas();
    this._setupRoot();
    this._setupSeries();
    this._setupAxis();

    for(let i in this.charts) {
      this.charts[i].redraw(this);
    }
  };

  /** @private */
  _cleanElement() {
    this.elem.children().remove();
  };

  /** @private */
  _setSize() {
    this.outerWidth  = this.elem.width();
    this.outerHeight = this.elem.height();


    if (this.opts.hideYAxis) {
      this.margin.left = 0;
      this.margin.right = 0;
    }

    if (this.opts.hideAxisAndGrid) {
      this.margin.left = 0;
      this.margin.right = 0;
    }

    this.width  = this.outerWidth - this.margin.left - this.margin.right;
    this.height = this.outerHeight - this.margin.top - this.margin.bottom;
  };

  /** @private */
  _setupCanvas() {
    this.elem.html('');
    this.canvas = d3.select(this.elem.get(0)).append('svg');
    this.canvas.attr('width', this.outerWidth);
    this.canvas.attr('height', this.outerHeight);

    this.canvas.append('desc').text("Powered by Rubix");

    this.defs = this.canvas.append('defs');

    this.defs.append('clipPath')
    .attr('id', this.masterId+'-clip')
    .append('rect')
    .attr('width', this.width)
    .attr('height', this.height+20)
    .attr('transform', 'translate(0, -20)');
  };

  /** @private */
  _setupRoot() {
    this.root = this.canvas.append('g');
    this.root.attr('width', this.width);
    this.root.attr('height', this.height);
    if (!this.opts.hideAxisAndGrid) {
      this.root.attr('transform', 'translate(' +this.margin.left+',' +this.margin.top+')');
    } else {
      this.root.attr('transform', 'translate(0,' +this.margin.top+')');
    }

    if (!this.hasData) {
      this.canvas.append('text').attr('class', 'noData').attr('font-size', '30px').attr('text-anchor', 'middle').attr('transform', 'translate(' +this.outerWidth/2+',' +this.outerHeight/2+')').attr('font-family', 'Lato, "Lucida Grande", Arial, Helvetica, sans-serif').text("No Data");
    } else {
      this.canvas.select('.noData').style('display', 'none');
    }

    if (this.master_detail) {
      this.md_root = this.canvas.append('g');
      this.md_root.attr('width', this.width);
      this.md_root.attr('height', this.master_detail_height);
      if (!this.opts.hideAxisAndGrid) {
        this.md_root.attr('transform', 'translate(' +this.margin.left+',' +(this.margin.top+this.height+this.master_detail_margin_bottom)+')');
      }
      let rect = this.md_root.append('rect');
      rect.attr('width', this.md_root.attr('width'));
      rect.attr('height', this.md_root.attr('height'));
      rect.attr('fill', 'none');
      rect.attr('shape-rendering', 'crispEdges');
      this.md_root.append('g').attr('class', 'md-grid').attr('width', this.md_root.attr('width'));
      this.md_layers = this.md_root.append('g').attr('class', 'md-layers').attr('clip-path', 'url(#' +this.masterId+'-clip)');

      this.defs.append('clipPath')
      .attr('id', this.masterId+'-clip-symbols')
      .append('rect')
      .attr('width', this.md_root.attr('width'))
      .attr('height', this.height+20)
      .attr('transform', 'translate(0, -10)');

      this.defs.append('clipPath')
      .attr('id', this.masterId+'-clip-brush')
      .append('rect')
      .attr('width', this.md_root.attr('width')+20)
      .attr('height', this.master_detail_height)
      .attr('transform', 'translate(-10, 1)');
    }
  };

  marginLeft(_left_) {
    if (!arguments.length) return this.margin.left;

    if (10 + _left_ + 10 < this.margin.defaultLeft) {
      this.margin.left = this.margin.defaultLeft;
    } else {
      this.margin.left = 10 + _left_ + 10;
    }
    if (this.axis.x.label.length) {
      if (this.opts.invertAxes) {
        this.margin.left += 15;
      }
    }
    if (this.axis.y.label.length) {
      if (!this.opts.invertAxes) {
        this.margin.left += 15;
      }
    }
    this.draw();
  };

  forceRedraw() {
    try {
      this.hasData = false;
      for(let i in this.charts) {
        this.hasData = true;
        this.charts[i].forceRedraw(this);
      }
      if (this.hasData) {
        this.canvas.select('.noData').style('display', 'none');
        this.root.selectAll('.axis').style('display', null);
      } else {
        this.canvas.select('.noData').style('display', null);
        this.root.selectAll('.axis').style('display', 'none');
      }
    } catch(e) {
      // do nothing
    }
  };

  // flicked from crossfilter
  resizePath(d) {
    let e = +(d == 'e'),
    x = e ? 1 : -1,
    y = this.master_detail_height/2;
    return 'M' + (0.5 * x) + ',' + y
    + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6)
    + 'V' + (2 * y - 6)
    + 'A6,6 0 0 ' + e + ' ' + (.5 * x) + ',' + (2 * y)
    + 'Z'
    + 'M' + (2.5 * x) + ',' + (y + 8)
    + 'V' + (2 * y - 8)
    + 'M' + (4.5 * x) + ',' + (y + 8)
    + 'V' + (2 * y - 8);
  };

  _createBrushPath() {
    let self = this;
    if (this.brush_path) this.brush_path.remove();
    this.brush_path = this.md_root.append('g');
    this.brush_path.attr('height', this.master_detail_height+5);
    this.brush_path.attr('width', this.md_root.attr('width'));
    this.brush_path.attr('class', 'x brush');
    this.brush_path.attr('transform', 'translate(0, -4)');
    // this.brush_path.attr('clip-path', 'url(#' +this.masterId+'-clip-brush)');
    this.brush_path.call(this.brush);

    let color = 'rgb(16, 16, 16)';
    if (this.opts.theme_style === 'light') {
      color = 'white';
    }

    this.brush_path.selectAll('.extent').attr('stroke', 'none').attr('fill-opacity', 0).attr('shape-rendering', 'crispEdges');
    this.brush_path.insert('rect', '.resize').attr('class', 'left-extent').attr('fill-opacity', 0.5).attr('fill', color).style('cursor', 'crosshair');
    this.brush_path.insert('rect', '.resize').attr('class', 'right-extent').attr('fill-opacity', 0.5).attr('fill', color).style('cursor', 'crosshair');
    this.brush_path.insert('rect', '.resize').attr('class', 'left-border').attr('x', 0).style('fill', this.opts.theme_style_color);
    this.brush_path.insert('rect', '.resize').attr('class', 'left-top-border').attr('x', 0).style('fill', this.opts.theme_style_color);
    this.brush_path.insert('rect', '.resize').attr('class', 'right-border').style('fill', this.opts.theme_style_color);
    this.brush_path.insert('rect', '.resize').attr('class', 'right-top-border').style('fill', this.opts.theme_style_color);
    this.brush_path.insert('rect', '.resize').attr('class', 'bottom-border').style('fill', 'rgb(16, 16, 16)').attr('fill-opacity', 0.3);

    let brush_x_pos = this.brush_path.select('.extent').attr('x');
    let brush_width = this.brush_path.select('.extent').attr('width');
    let brush_height = this.brush_path.select('.extent').attr('height');

    this.brush_path.select('.left-extent').attr('height', brush_height).attr('width', brush_x_pos).attr('x', 0);
    let brush_r_x_pos = parseFloat(brush_x_pos)+parseFloat(brush_width);
    this.brush_path.select('.right-extent').attr('height', brush_height).attr('x', brush_r_x_pos).attr('width', this.md_root.attr('width') - brush_r_x_pos);

    this.brush_path.select('.left-border').attr('width', 1).attr('x', brush_x_pos);
    this.brush_path.select('.left-top-border').attr('width', brush_x_pos);
    this.brush_path.select('.right-border').attr('width', 1).attr('x', brush_r_x_pos);
    this.brush_path.select('.right-top-border').attr('x', brush_r_x_pos).attr('width', this.md_root.attr('width') - brush_r_x_pos);
    this.brush_path.select('.bottom-border').attr('x', brush_x_pos).attr('width', brush_width).attr('transform', 'translate(0, ' + (this.master_detail_height+5) + ')');

    this.brush_path.selectAll('.resize').append('path').attr('d', function(d) {
      return self.resizePath(d);
    }).style('fill', '#EEE').style('stroke', '#666').attr('transform', 'translate(0, -' +this.master_detail_height/5+')');

    let inner_rect = this.brush_path.selectAll('rect');
    inner_rect.attr('height', this.master_detail_height+5);

    this.brush_path.select('.left-top-border').attr('height', 1);
    this.brush_path.select('.right-top-border').attr('height', 1);
    this.brush_path.select('.bottom-border').attr('height', 1);

    if (!this.extent.length) {
      this.extent = this.x2.domain();
      this.brush.extent(this.extent);
      this._brush();
    }
  };

  bisectLeft = d3.bisector(function(d) { return d.x; }).left;
  bisectRight = d3.bisector(function(d) { return d.x; }).right;

  move_tooltip_x(dx, ys, points) {
    let dy, mid;
    if (ys.length) {
      dy = d3.mean(ys)/ys.length;
    }

    let copy = dx;
    if (this.axis.x.range === 'column' || this.axis.x.range === 'bar') {
      dx += this.x.rangeBand()/2;
    }

    let _elem = this.root_elem;

    let tooltipPadding = (this.tooltip.outerWidth() - this.tooltip.width())/2;

    let left = dx + this.margin.left + tooltipPadding;
    let top  = dy;

    let elem_far_right = _elem.width();

    let tooltip_far_right = left + this.tooltip.outerWidth();

    if (this.axis.x.range === 'column' || this.axis.x.range === 'bar') {
      dx = copy - this.x.rangeBand()/2;
    }

    if (tooltip_far_right > elem_far_right) {
      left -= (tooltip_far_right  - dx - this.margin.left + tooltipPadding);
    }

    this.tooltip.css('display', 'inline');
    this.tooltip.css('display', useTable);
    this.tooltip.css({
      'left': left,
      'top' : top
    });

    let html = "", formatterX, formatterY;
    if (this.tooltipFormatter.format.x.length) {
      if (this.axis.x.type === 'datetime') {
        formatterX = d3.time.format(this.tooltipFormatter.format.x);
      } else {
        formatterX = d3.format(this.tooltipFormatter.format.x);
      }
    } else {
      formatterX = function(d) { return d; };
    }
    if (this.tooltipFormatter.format.y.length) {
      if (this.axis.y.type === 'datetime') {
        formatterY = d3.time.format(this.tooltipFormatter.format.y);
      } else {
        formatterY = d3.format(this.tooltipFormatter.format.y);
      }
    } else {
      formatterY = function(d) { return d; };
    }
    for(let name in points) {
      let _x, _y;
      if (this.axis.x.type === 'datetime') {
        _x = formatterX(new Date(points[name].x));
      } else {
        if (points[name].invert) {
          _x = formatterX(this.x.invert(points[name].x));
        } else {
          _x = formatterX(points[name].x);
        }
      }
      if (this.axis.y.type === 'datetime') {
        _y = (points[name].y !== null) ? formatterY(new Date(points[name].y)) : null;
      } else {
        if (points[name].invert) {
          _y = (points[name].y !== null) ? formatterY(this.y.invert(points[name].y)) : null;
        } else {
          _y = formatterY(points[name].y);
        }
      }

      _x = this.tooltipFormatter.abs.x ? Math.abs(_x) : _x;
      _y = this.tooltipFormatter.abs.y ? Math.abs(_y) : _y;
      let series = "<div style='color: "+points[name].opts.color+"; margin-bottom: 2px; line-height: 22px;'><b style='position:relative; top: -5px; left: -2px;'><span style='font-size: 22px;'>■ </span><span style='position:relative; top: -3px; left: -2px;'>"+name+"</span></b></div>";
      let x = "<div style='font-size: 10px; margin-top: -10px;'>x : " + _x + " </div>";
      let y = "<div style='font-size: 10px; margin-top: -5px;'>y : " + _y + " </div><br>";
      html = (series+x+y) + html;
    }

    html = html.slice(0, html.length-4);

    this.tooltip.html(html);

    let tooltipHeight = this.tooltip.outerHeight();
    let total_height = tooltipHeight + dy;
    if (total_height >= _elem.height()) {
      top = this.margin.top;
      this.tooltip.css('top', top);
    }
  };


  move_tooltip_y(dy, yx, points) {
    try {
      let dx, mid;
      if (yx.length) {
        dx = d3.max(yx);
      }

      let copy = dx;
      if (this.axis.x.range === 'column' || this.axis.x.range === 'bar') {
        dx += this.y.rangeBand()/2;
      }

      let _elem = $(this.canvas.node());

      let tooltipPadding = (this.tooltip.outerWidth() - this.tooltip.width())/2;

      let left = dx + this.margin.left + tooltipPadding;
      let top  = dy;

      let elem_far_right = _elem.width();

      let tooltip_far_right = left + this.tooltip.outerWidth();

      if (this.axis.x.range === 'column' || this.axis.x.range === 'bar') {
        dx = copy - this.y.rangeBand()/2;
      }

      if (tooltip_far_right > elem_far_right) {
        left -= tooltip_far_right  - dx - this.margin.left + tooltipPadding;
      }

      let elem_far_bottom = _elem.height();
      let tooltip_far_bottom = top + this.tooltip.outerHeight() + this.margin.bottom;

      if (tooltip_far_bottom > elem_far_bottom) {
        top -= (tooltip_far_bottom - elem_far_bottom);
      }

      this.tooltip.css('display', 'inline');
      this.tooltip.css('display', useTable);
      this.tooltip.css({
        'left': left,
        'top' : top
      });


      let html = "", formatterX, formatterY;
      if (this.tooltipFormatter.format.x.length) {
        if (this.axis.x.type === 'datetime') {
          formatterX = d3.time.format(this.tooltipFormatter.format.x);
        } else {
          formatterX = d3.format(this.tooltipFormatter.format.x);
        }
      } else {
        formatterX = function(d) { return d; };
      }
      if (this.tooltipFormatter.format.y.length) {
        if (this.axis.y.type === 'datetime') {
          formatterY = d3.time.format(this.tooltipFormatter.format.y);
        } else {
          formatterY = d3.format(this.tooltipFormatter.format.y);
        }
      } else {
        formatterY = function(d) { return d; };
      }
      for(let name in points) {
        let _x, _y;
        if (this.axis.y.type === 'datetime') {
          _x = formatterY(new Date(points[name].y));
        } else {
          if (points[name].invert) {
            _x = formatterY(this.y.invert(points[name].y));
          } else {
            _x = formatterY(points[name].y);
          }
        }
        if (this.axis.x.type === 'datetime') {
          _y = formatterX(new Date(points[name].x));
        } else {
          if (points[name].invert) {
            _y = formatterX(this.x.invert(points[name].x));
          } else {
            _y = formatterX(points[name].x);
          }
        }

        _x = this.tooltipFormatter.abs.x ? Math.abs(_x) : _x;
        _y = this.tooltipFormatter.abs.y ? Math.abs(_y) : _y;
        let series = "<div style='color: "+points[name].opts.color+"; margin-bottom: 2px'><b style='position:relative; top: -5px; left: -2px;'><span style='font-size: 22px;'>■ </span><span style='position:relative; top: -3px; left: -2px;'>"+name+"</span></b></div>";
        let x = "<div style='font-size: 10px; margin-top: -10px;'>x : " + _x + " </div>";
        let y = "<div style='font-size: 10px; margin-top: -5px;'>y : " + _y + " </div><br>";
        html = (series+x+y) + html;
      }

      html = html.slice(0, html.length-4);

      console.log(html);

      this.tooltip.html(html);
    } catch(e) {
      // do nothing
    }
  };

  overlayX(self, coordinates) {
    let ycord = coordinates[1];
    try {
      if (self.axis.x.type === 'ordinal') {
        let x0 = coordinates[0];
        if (self.axis.x.range === 'column' || self.axis.x.range === 'bar') {
          x0 = x0 - self.x.rangeBand()/2;
        }

        let i  = self.bisectLeft(self.crosshair_data, x0, 1);
      } else {
        let x0 = self.x.invert(coordinates[0]+1);
        let i  = self.bisectLeft(self.crosshair_data, x0, 1);
      }

      let d0 = self.crosshair_data[i - 1],
      d1 = self.crosshair_data[i],
      d  = x0 - d0.x > d1.x - x0 ? d1 : d0;

      let y = d.y;
      let others = d.others;
      let xpos;
      let ys = [];
      let points = {};
      let ok = [];
      for(let name in self.charts) {
        try {
          if (y.hasOwnProperty(name)) {
            if (self.axis.x.type === 'ordinal') {
              if (y[name] !== null && d.others[name].y0 !== null) {
                ok.push(true);
                let dx = d.x;
                let dy = self.y(y[name]);
                if (self.axis.x.range === 'column' || self.axis.x.range === 'bar') {
                  if (self.grouped && self.charts[name].hasOwnProperty('count')) {
                    dx = d.x + ((self.x.rangeBand()/(self.charts[name].layers.length)) * (self.charts[name].count)) + self.x.rangeBand()/(2*self.charts[name].layers.length);
                  } else {
                    dx += self.x.rangeBand()/2;
                  }
                }

                self.charts[name].focus.attr('transform', 'translate(' + dx + ',' + dy +')').style('display', null);

                if (self.axis.x.range === 'column' || self.axis.x.range === 'bar') {
                  if (self.grouped && self.charts[name].hasOwnProperty('count')) {
                    xpos = d.x + self.x.rangeBand()/2;
                  } else {
                    xpos = dx;
                  }
                } else {
                  xpos = dx;
                }
                ys.push(dy);
                points[name] = {
                  x: dx,
                  y: y[name] ? dy : null,
                  opts: self.charts[name].opts,
                  invert: true
                };
              }
            } else {
              ok.push(true);
              let dx = self.x(d.x);
              let dy = self.y(y[name]);
              self.charts[name].focus.attr('transform', 'translate(' + dx + ',' + dy +')').style('display', null);

              xpos = dx;
              ys.push(dy);
              points[name] = {
                x: d.x,
                y: y[name],
                opts: self.charts[name].opts,
                invert: false
              };
            }
            if (ok.length) {
              self.charts[name].onFocus(dx, dy);
            }
          } else {
            self.charts[name].focus.style('display', 'none');
            self.charts[name].offFocus();
          }
        } catch(e) {
          // do nothing
        }
      }
      if (ok.length) {
        if (self.axis.x.type === 'ordinal') {
          let dx = d.x;
          if (self.axis.x.range === 'column' || self.axis.x.range === 'bar') {
            dx += self.x.rangeBand()/2;
          }
          self.focusLine.style('display', null).attr('transform', 'translate(' + dx + ',' + '0)');
        } else {
          self.focusLine.style('display', null).attr('transform', 'translate(' + self.x(d.x) + ',' + '0)');
        }

        self.move_tooltip_x(xpos, ys, points);
      }
    } catch(e) {
      // do nothing
    }
  };

  overlayY(self, coordinates) {
    // here .x is .y and .y should be .x due to axis inversion
    let xcord = coordinates[0];
    let y0 = coordinates[1];

    try {
      let len = 0;
      if (self.axis.y.type === 'ordinal') {
        if (self.axis.y.range === 'column' || self.axis.y.range === 'bar') {
          y0 = y0 - self.y.rangeBand()/2;
        }
      } else {
        y0 = self.y.invert(y0);
      }
      let i = self.bisectRight(self.crosshair_data, y0, 1);

      let d0 = self.crosshair_data[i - 1],
      d1 = self.crosshair_data[i],
      d  = y0 - d0.x > d1.x - y0 ? d1 : d0;

      let y = d.y;
      let others = d.others;
      let xpos;
      let ys = [];
      let points = {};
      let ok = [];
      for(let name in self.charts) {
        try {
          if (y.hasOwnProperty(name)) {
            if (self.axis.y.type === 'ordinal') {
              if (y[name] !== null && d.others[name].y0 !== null) {
                ok.push(true);
                let dx = d.x;
                let dy = self.x(y[name]);
                if (self.axis.y.range === 'column' || self.axis.y.range === 'bar') {
                  if (self.grouped && self.charts[name].hasOwnProperty('count')) {
                    dx = d.x + ((self.y.rangeBand()/(self.charts[name].layers.length)) * (self.charts[name].count)) + self.y.rangeBand()/(2*self.charts[name].layers.length);
                  } else {
                    dx += self.y.rangeBand()/2;
                  }
                }

                self.charts[name].focus.attr('transform', 'translate(' + dy + ',' + dx +')').style('display', null);
                xpos = dx;
                ys.push(dy);
                points[name] = {
                  x: dy,
                  y: dx,
                  opts: self.charts[name].opts,
                  invert: true
                };
              }
            } else {
              ok.push(true);
              let dx = self.y(d.x);
              let dy = self.x(y[name]);
              self.charts[name].focus.attr('transform', 'translate(' + dy + ',' + dx +')').style('display', null);
              xpos = dx;
              ys.push(dy);
              points[name] = {
                x: y[name],
                y: d.x,
                opts: self.charts[name].opts,
                invert: false
              };
            }
            if (ok.length) {
              self.charts[name].onFocus(dy, dx);
            }
          } else {
            self.charts[name].focus.style('display', 'none');
            self.charts[name].offFocus();
          }
        } catch(e) {
          // do nothing
        }
      }
      if (ok.length) {
        if (self.axis.y.type === 'ordinal') {
          let dx = d.x;
          if (self.axis.y.range === 'column' || self.axis.y.range === 'bar') {
            dx += self.y.rangeBand()/2;
          }
          self.focusLine.style('display', null).attr('transform', 'translate(0,' + dx + ')');
        } else {
          self.focusLine.style('display', null).attr('transform', 'translate(0,' +self.y(d.x)+')');
        }

        self.move_tooltip_y(xpos, ys, points);
      }
    } catch(e) {
      // do nothing
    }
  };

  resetFocus(forced) {
    if (!this.width) return;
    if (!this.height) return;

    if (this.focusLine) this.focusLine.remove();
    if (this.symbols) this.symbols.remove();
    if (this.overlay) this.overlay.remove();

    if (this.xlabel) this.xlabel.remove();
    if (this.ylabel) this.ylabel.remove();
    let self = this;

    if (this.axis.x.label.length) {
      this.xlabel = this.root.append('text');
      this.xlabel.style('font-size', '12px');
      this.xlabel.style('font-weight', 'bold');
      this.xlabel.style('font-family', 'Lato, "Lucida Grande", Arial, Helvetica, sans-serif');
      this.xlabel.attr('fill', this.xlabelcolor || 'steelblue');
      this.xlabel.attr('stroke', 'none');
      this.xlabel.style('text-anchor', 'middle');
      if (this.opts.invertAxes) {
        this.xlabel.attr('y', -this.margin.left+20);
        this.xlabel.attr('x', -parseInt(this.root.attr('height'))/2);
        this.xlabel.attr('transform', 'rotate(-90)');
        this.xlabel.text(this.axis.y.label);
      } else {
        this.xlabel.attr('y', (parseInt(this.root.attr('height')) + this.margin.bottom - 15));
        this.xlabel.attr('x', parseInt(this.root.attr('width'))/2);
        this.xlabel.text(this.axis.x.label);
      }
    }

    if (this.axis.y.label.length) {
      this.ylabel = this.root.append('text');
      this.ylabel.style('font-size', '12px');
      this.ylabel.style('font-weight', 'bold');
      this.ylabel.style('font-family', 'Lato, "Lucida Grande", Arial, Helvetica, sans-serif');
      this.ylabel.attr('fill', this.ylabelcolor || 'steelblue');
      this.ylabel.attr('stroke', 'none');
      this.ylabel.style('text-anchor', 'middle');
      if (this.opts.invertAxes) {
        this.ylabel.attr('y', (parseInt(this.root.attr('height')) + this.margin.bottom - 15));
        this.ylabel.attr('x', parseInt(this.root.attr('width'))/2);
        this.ylabel.text(this.axis.x.label);
      } else {
        this.ylabel.attr('y', -this.margin.left+20);
        this.ylabel.attr('x', -parseInt(this.root.attr('height'))/2);
        this.ylabel.attr('transform', 'rotate(-90)');
        this.ylabel.text(this.axis.y.label);
      }
    }

    if (this.opts.invertAxes) {
      this.focusLine = this.focus_line_group.append('line').attr('x1', 0).attr('y1', 0).attr('x2', this.width).attr('y2', 0).attr('stroke', this.opts.theme_focus_line_color).attr('stroke-width', 1).attr('shape-rendering', 'crispEdges').style('display', 'none').attr('class', 'focus-line');
    } else {
      this.focusLine = this.focus_line_group.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', this.height).attr('stroke', this.opts.theme_focus_line_color).attr('stroke-width', 1).attr('shape-rendering', 'crispEdges').style('display', 'none').attr('class', 'focus-line');
    }

    this.symbols = this.symbols_group.append('g');
    for(let name in self.charts) {
      self.charts[name].on_complete_draw();
    }

    let order = [];
    for(let name in self.charts) {
      order.push(name);
    }

    if (this.axis.x.range == 'column' || this.axis.x.range == 'bar') {
      order.reverse();
    }

    for(let i = 0; i < order.length; i++) {
      let name = order[i];
      self.charts[name].setupFocus();
    }

    if (this.master_detail) {
      if (!forced) {
        this._createBrushPath();
      }
    }

    this.overlay = this.root.append('rect');
    this.overlay.attr('class', 'overlay');
    this.overlay.attr('width', this.width);
    this.overlay.attr('height', this.height);
    this.overlay.attr('fill', 'none');
    this.overlay.attr('pointer-events', 'all');

    this.overlay.attr('clip-path', 'url(#' +this.masterId+'-clip)');

    let over = () => {
      $(window).trigger('rubix.sidebar.off');
      d3.event.preventDefault();
      self.focusLine.style('display', null);
      $(this).focus();
    };

    let move = () => {
      $(window).trigger('rubix.sidebar.off');
      d3.event.preventDefault();
      $(this).focus();
      if (!self.hasData) return;
      if (self.is_touch_device) {
        let coordinates = d3.touches(this)[0];
      } else {
        let coordinates = d3.mouse(this);
      }
      if (self.opts.invertAxes) {
        if (coordinates[1] < 0 || coordinates[1] > self.height) return;
        self.overlayY.call(this, self, coordinates);
      } else {
        if (coordinates[0] < 0 || coordinates[0] > self.width) return;
        self.overlayX.call(this, self, coordinates);
      }
    };

    let out = () => {
      $(window).trigger('rubix.sidebar.on');
      d3.event.preventDefault();
      $(this).focus();
      self.tooltip.hide();
      for(let name in self.charts) {
        try {
          self.charts[name].focus.style('display', 'none');
          self.charts[name].offFocus();
        } catch(e) {
          // do nothing
        }
      }
      self.focusLine.style('display', 'none');
    };

    if (self.is_touch_device) {
      if (window.navigator.msPointerEnabled) {
        this.overlay.on('MSPointerDown', over);
        this.overlay.on('MSPointerMove', move);
        this.overlay.on('MSPointerUp' , out);
      } else {
        this.overlay.on('touchstart', over);
        this.overlay.on('touchmove', move);
        this.overlay.on('touchend' , out);
      }
    } else {
      this.overlay.on('mouseover', over);
      this.overlay.on('mousemove', move);
      this.overlay.on('mouseout' , out);
    }
  };

  runCommand(cmd) {
    for(let i in this.charts) {
      try {
        this.charts[i][cmd](this);
      } catch(e) {
        // do nothing
      }
    }
  };

  resetLabelHandlers() {
    let self = this;
    $('.' +this.masterId+'-legend-labels').css({
      'opacity': 0.9
    });

    $('.' +this.masterId+'-legend-labels').off().on({
      'hover': function(e) {
        let hasClass = $(this).hasClass('toggle');

        if (hasClass) return;

        switch (e.type) {
          case 'mouseenter':
          $(this).css({
            'opacity': 1
          });
          break;
          case 'mouseleave':
          $(this).css({
            'opacity': 0.9
          });
          break;
          default:
          break;
        }
      },
      'click': function(e) {
        let hasClass = $(this).hasClass('toggle');
        let name = $(this).attr('data-name');
        let type = $(this).attr('data-type') || '';

        if (!hasClass) {
          $(this).css({
            'opacity': 0.2
          });
          $(this).addClass('toggle');

          let chart = self.charts[name];
          chart.hidden();
          delete self.charts[name];
          self.chart_stack[name] = chart;

          if (type.length) {
            let fetchData = self.column_stack_data;
            let pushData = self.column_stack_data_stack;
            if (type === 'astack') {
              fetchData = self.area_stack_data;
              pushData = self.area_stack_data_stack;
            }
            let rdata, orderKey = 0;
            for(let i = 0; i < fetchData.length; i++) {
              if (!fetchData[i]) continue;
              let fname = fetchData[i].key;
              if (fname === name) {
                orderKey = fetchData[i].orderKey;
                rdata = fetchData[i];
                fetchData.splice(i, 1);
                break;
              }
            }

            pushData.splice(orderKey, 0, rdata);
          }

          let data = self.data[name];
          self.data_stack[name] = data;
          delete self.data[name];
        } else {
          $(this).css({
            'opacity': 1
          });
          $(this).removeClass('toggle');

          let chart = self.chart_stack[name];
          self.charts[name] = chart;
          delete self.chart_stack[name];

          if (type.length) {
            let pushedData = self.column_stack_data_stack;
            let origData = self.column_stack_data;
            if (type === 'astack') {
              pushedData = self.area_stack_data_stack;
              origData = self.area_stack_data;
            }
            let rdata, orderKey = 0;
            for(let i = 0; i < pushedData.length; i++) {
              if (!pushedData[i]) continue;
              let fname = pushedData[i].key;
              if (fname === name) {
                orderKey = pushedData[i].orderKey;
                rdata = pushedData[i];
                pushedData.splice(i, 1);
                break;
              }
            }

            origData.splice(orderKey, 0, rdata);
          }

          let data = self.data_stack[name];
          self.data[name] = data;
          delete self.data_stack[name];
          self.charts[name].show();
        }

        /** TODO: Investigate why draw needs to be called twice */
        self.draw();
        self.draw();
      }
    });
  };

  /**
  * @param {?Object} opts
  * @return {Rubix.LineSeries}
  */
  line_series(opts) {
    opts = opts || {};
    opts.name  = opts.name || this._generate_name();
    if (this.charts.hasOwnProperty(opts.name)) {
      throw new Error("Series exists: " + name);
    }
    let line_series = this.LineSeries(this, opts);
    this.charts[line_series.name] = line_series;
    this.legend.append("<div class='"+this.masterId+"-legend-labels' data-name='"+line_series.name+"' style='cursor: pointer; display: inline-block; font-weight: bold; margin-right: 10px; color: "+line_series.opts.color+"'><span style='font-size: 22px;'>■ </span><span style='font-size: 12px; position:relative; top: -3px; left: -2px;'>"+line_series.name+"</span></div>");
    this.resetLabelHandlers();
    return line_series;
  };

  /**
  * @param {?Object} opts
  * @return {Rubix.AreaSeries}
  */
  area_series(opts) {
    opts = opts || {};
    opts.name  = opts.name || this._generate_name();
    if (this.charts.hasOwnProperty(opts.name)) {
      throw new Error("Series exists: " + name);
    }
    if (this.stacked) {
      let stacked_area_series = this.StackedAreaSeries(this, opts);
      this.charts[stacked_area_series.name] = stacked_area_series;
      this.legend.append("<div class='"+this.masterId+"-legend-labels' data-name='"+stacked_area_series.name+"' data-type='astack' style='cursor: pointer; display: inline-block; font-weight: bold; margin-right: 10px; color: "+stacked_area_series.opts.color+"'><span style='font-size: 22px;'>■ </span><span style='font-size: 12px; position:relative; top: -3px; left: -2px;'>"+stacked_area_series.name+"</span></div>");
      this.resetLabelHandlers();
      return stacked_area_series;
    }
    let area_series = this.AreaSeries(this, opts);
    this.charts[area_series.name] = area_series;
    this.legend.append("<div class='"+this.masterId+"-legend-labels' data-name='"+area_series.name+"' style='cursor: pointer; display: inline-block; font-weight: bold; margin-right: 10px; color: "+area_series.opts.color+"'><span style='font-size: 22px;'>■ </span><span style='font-size: 12px; position:relative; top: -3px; left: -2px;'>"+area_series.name+"</span></div>");
    this.resetLabelHandlers();
    return area_series;
  };

  _generate_name() {
    return 'Series ' + (++this.chart_counter);
  };

  /**
  * @param {?Object} opts
  * @return {Rubix.ColumnSeries}
  */
  column_series(opts) {
    opts = opts || {};
    opts.name  = opts.name || this._generate_name();
    if (this.charts.hasOwnProperty(opts.name)) {
      throw new Error("Series exists: " + name);
    }
    if (this.opts.invertAxes !== false || this.opts.axis.x.range !== 'column') {
      this.opts.invertAxes = false;
      this.opts.axis.x.type = 'ordinal';
      this.opts.axis.x.range = 'column';
      this.setup()
    }
    let column_series = this.ColumnSeries(this, opts);
    this.charts[column_series.name] = column_series;
    this.legend.append("<div class='"+this.masterId+"-legend-labels' data-name='"+column_series.name+"' data-type='cstack' style='cursor: pointer; display: inline-block; font-weight: bold; margin-right: 10px; color: "+column_series.opts.color+"'><span style='font-size: 22px;'>■ </span><span style='font-size: 12px; position:relative; top: -3px; left: -2px;'>"+column_series.name+"</span></div>");
    this.resetLabelHandlers();
    return column_series;
  };

  /**
  * @param {?Object} opts
  * @return {Rubix.ColumnSeries}
  */
  bar_series(opts) {
    opts = opts || {};
    opts.name  = opts.name || this._generate_name();
    if (this.charts.hasOwnProperty(opts.name)) {
      throw new Error("Series exists: " + name);
    }
    if (this.opts.invertAxes !== true || this.opts.axis.x.range !== 'column') {
      this.opts.invertAxes = true;
      this.opts.axis.x.type = 'ordinal';
      this.opts.axis.x.range = 'column';
      this.setup()
    }
    let column_series = this.ColumnSeries(this, opts);
    this.charts[column_series.name] = column_series;
    this.legend.append("<div class='"+this.masterId+"-legend-labels' data-name='"+column_series.name+"' data-type='cstack' style='cursor: pointer; display: inline-block; font-weight: bold; margin-right: 10px; color: "+column_series.opts.color+"'><span style='font-size: 22px;'>■ </span><span style='font-size: 12px; position:relative; top: -3px; left: -2px;'>"+column_series.name+"</span></div>");
    this.resetLabelHandlers();
    return column_series;
  };

  /**
  * @param {string} id
  * @param {Object} opts
  * @return {Rubix.PieDonut}
  */
  Pie(id, opts) {
    return new PieDonut(id, 'pie', opts);
  };

  /**
  * @param {string} id
  * @param {Object} opts
  * @return {Rubix.PieDonut}
  */
  Donut(id, opts) {
    return new PieDonut(id, 'donut', opts);
  };

  Cleanup() {
    let masterId = null;
    for(let i = 0; i < RubixListeners.length; i++) {
      masterId = RubixListeners[i];
      $(window).off('orientationchange.' + masterId);
      $(window).off('rubix.redraw.' + masterId);
      $(window).off('resize.rubix.' + masterId);
      $(window).off('debouncedresize.rubix.' + masterId);
      $(window).off('throttledresize.rubix.' + masterId);
    }
    RubixListeners = [];
  };

  /**
  * Nested Class
  */
  StackedAreaSeries(rubix, opts) {
    return new RubixStackedAreaSeries(rubix, opts);
  }

  /**
  * Nested Class
  */
  PieDonut(id, type, opts) {
    return new RubixPieDonut(id, type, opts);
  }

  /**
  * Nested Class
  */
  LineSeries(rubix, opts) {
    return new RubixLineSeries(rubix, opts);
  }

  /**
  * Nested Class
  */
  ColumnSeries(rubix, opts) {
    return new RubixColumnSeries(rubix, opts);
  }

  /**
  * Nested Class
  */
  AreaSeries(rubix, opts) {
    return new RubixAreaSeries(rubix, opts);
  }
};

/*eslint-disable */
