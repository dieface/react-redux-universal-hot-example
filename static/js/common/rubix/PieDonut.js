/*eslint-disable */

/**
* @private
* @param {string} id
* @param {Rubix.Pie || Rubix.Donut} type
* @param {Object} opts
* @constructor
*/
export default class PieDonut {
  constructor(id, type, opts) {
    opts = opts || {};
    this.type = type;
    this.is_touch_device = 'ontouchstart' in document.documentElement;

    this.legend_hidden = {};

    this.chart_counter = 0;
    this.masterId = this.uid('masterId');

    this.area_stack_data_stack = [];
    this.column_stack_data_stack = [];

    this.root_elem = $(id);
    this.root_elem.css('position', 'relative');
    this.root_elem.addClass('rubixccnium-main-chart');
    this.root_elem.append('<div class="rubixccnium-tooltip"></div>');
    this.root_elem.append('<div class="rubixccnium-title"></div>');
    this.root_elem.append('<div class="rubixccnium-subtitle"></div>');
    this.root_elem.append('<div class="rubixccnium-chart"><div style="margin-top:5px">Loading...</div></div>');
    this.root_elem.append('<div class="rubixccnium-legend"></div>');

    let width = opts.width || '100%';
    let height = opts.height || 150;
    this.elem_width = width, this.elem_height = height;
    this.root_elem.width(width).height(height);

    this.elem = this.root_elem.find('.rubixccnium-chart');

    this.tooltip = this.root_elem.find('.rubixccnium-tooltip');
    this.tooltip.hide();
    this.tooltip.html("");

    opts.tooltip = opts.tooltip || {};

    this.tooltip.css({
      'font-family': 'Lato, "Lucida Grande", Arial, Helvetica, sans-serif',
      'font-size': '12px',
      'position': 'absolute',
      'background': 'white',
      'color': '#89949B',
      'display': 'none',
      'padding': '5px 15px',
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

    this.legend = this.root_elem.find('.rubixccnium-legend');
    this.legend.css({
      'font-family': "Lato, 'Lucida Grande', Arial, Helvetica, sans-serif",
      'text-align': 'center',
      'margin-top': opts.legend.top || '-10px',
      'margin-bottom': opts.legend.bottom || '5px',
      'user-select': 'none',
      'display': opts.hideLegend ? 'none' : 'block'
    });

    this.title = this.root_elem.find('.rubixccnium-title');
    this.subtitle = this.root_elem.find('.rubixccnium-subtitle');

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
      'font-size': '10px',
      'color': 'steelblue',
      'margin-top': '10px',
      'cursor': 'default',
      'opacity': 0.8
    });

    let self = this;

    this.elem.css({
      'width': '100%',
      'height': parseInt(this.root_elem.get(0).style.height),
      'user-select': 'none',
      'cursor': 'default'
    });
    this.root_elem.css('height', '100%');
    this.opts = opts || {};

    this.data = [];
    this.is_touch_device = 'ontouchstart' in document.documentElement;
    this.d3_eventSource = function () {
      let e = d3.event, s;
      while (s = e.sourceEvent) e = s;
      return e;
    }

    this.last_render = null;
    this.data_changed = false;
    this.setup();
  };

  setup() {
    this.setupOpts();
    this.setupOnce();
    this.setupRedraw();

    this.draw();
  };

  /** @private */
  setupOpts() {
    this.opts.theme_style = this.opts.theme_style || 'light';
    this.opts.theme_style_color = (this.opts.theme_style === 'light') ? '#C0D0E0' : '#555';
    this.opts.theme_focus_line_color = (this.opts.theme_style === 'light') ? '#C0D0E0' : '#888';

    this.opts.legend_color_brightness = this.opts.legend_color_brightness || 0.5;
    this.opts.global_legend_color = this.opts.global_legend_color || false;

    this.opts.titleColor = this.opts.titleColor || 'steelblue';
    this.opts.subtitleColor = this.opts.subtitleColor || 'steelblue';

    this.title.css('color', this.opts.titleColor);
    this.subtitle.css('color', this.opts.subtitleColor);

    if (this.opts.theme_style === 'dark') {
      this.tooltip.css({
        "color": "#aaa",
        "font-weight": "bold",
        "border": "1px solid #222",
        "background-color": "#303030"
      });
    }

    this.opts.margin = this.opts.margin || {};
    this.margin = {
      top    : this.opts.margin.top    || 25,
      left   : this.opts.margin.left   || 25,
      right  : this.opts.margin.right  || 25,
      bottom : this.opts.margin.bottom || 25
    };

    this.opts.tooltip = this.opts.tooltip || {};
    this.opts.tooltip.format = this.opts.tooltip.format || {};
    this.tooltipFormatter = {
      format: {
        x: this.opts.tooltip.format.x || '',
        y: this.opts.tooltip.format.y || ''
      }
    }

    this.resize = this.opts.resize || 'throttled';

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
    // Add Pie Stack data here.
  };

  setupRedraw() {
    let self = this;

    $(window).on('orientationchange', () => {
      self.draw();
    });

    $(window).on('rubix.redraw.' +this.masterId, () => {
      self.draw();
    });

    switch (this.resize) {
      case 'always':
      $(window).on('resize', () => {
        self.draw();
      });
      break;
      case 'debounced':
      $(window).on('debouncedresize', () => {
        self.draw();
      });
      break;
      case 'throttled':
      $(window).on('throttledresize', () => {
        self.draw();
      });
      break;
      default:
      throw new Error('Unknown resize type!');
      break;
    }
  };

  draw() {
    this._draw($(window).width(), $(window).height());
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
    this.final_draw();
  };

  /** @private */
  _cleanElement() {
    this.elem.children().remove();
  };

  /** @private */
  _setSize() {
    this.outerWidth  = this.elem.width();
    this.outerHeight = this.elem.height();

    this.width  = this.outerWidth - this.margin.left - this.margin.right;
    this.height = this.outerHeight - this.margin.top - this.margin.bottom;

    this.innerRadius = 0;
    this.outerRadius = (Math.min(this.width, this.height) * .5) - 10;

    if (this.type === 'donut') {
      this.innerRadius = this.outerRadius * .6;
    }
  };

  /** @private */
  _setupCanvas() {
    this.elem.html('');
    this.canvas = d3.select(this.elem.get(0)).append('svg');
    this.canvas.attr('width', this.outerWidth);
    this.canvas.attr('height', this.outerHeight);

    this.canvas.append('desc').text("Powered by RubixÆžium");
  };

  /** @private */
  _setupRoot() {
    this.root = this.canvas.append('g');
    this.root.attr('width', this.width);
    this.root.attr('height', this.height);
    this.root.attr('transform', 'translate(' +this.margin.left+',' +this.margin.top+')');

    if (!this.hasData) {
      this.canvas.append('text').attr('class', 'noData').attr('font-size', '30px').attr('text-anchor', 'middle').attr('transform', 'translate(' +this.outerWidth/2+',' +this.outerHeight/2+')').attr('font-family', 'Lato, "Lucida Grande", Arial, Helvetica, sans-serif').text("No Data");
    } else {
      this.canvas.select('.noData').style('display', 'none');
    }
  };

  _setupSeries() {
    this.root_piedonut_series = this.root.append('g').attr('class', 'piedonut_series').attr('transform', "translate(" + this.width / 2 + "," + this.height / 2 + ")");
  };

  uid(type) {
    return 'rubixcc-pie-donut-' + type +'-' + Math.floor(2147483648*Math.random()).toString(36);
  };

  addData(data) {
    this.data_changed = true;
    data.forEach(function(d) {
      d.value = +d.value;
    });

    this.data = data;

    this._setupLegend();
    this.final_draw('launch');
  };

  _setupLegend() {
    let self = this;
    this.legend.children().remove();
    for(let i = 0; i < this.data.length; i++) {
      let color = this.opts.global_legend_color || this.data[i].color;
      this.legend.append("<div class='"+this.masterId+"-legend-labels' data-name='"+this.data[i].name+"' style='cursor: pointer; display: inline-block; font-weight: bold; margin-right: 10px; color: "+color+"'><span style='font-size: 22px;'>■ </span><span style='font-size: 12px; position:relative; top: -3px; left: -2px;'>"+this.data[i].name+"</span></div>");
    }

    $('.' +this.masterId+'-legend-labels').css({
      'opacity': 0.9
    });

    for(let id in this.legend_hidden) {
      let name = this.legend_hidden[id];
      $('[data-name=' +name+']').css({
        'opacity': 0.2
      }).addClass('toggle');
    }

    $('.' +this.masterId+'-legend-labels').off().on({
      'hover': function(e) {
        let hasClass = $(this).hasClass('toggle');
        let name = $(this).attr('data-name');
        let id = '#' +self.masterId+'-' +slugify(name);

        if (hasClass) return;

        switch (e.type) {
          case 'mouseenter':
          $(this).css({
            'opacity': 1
          });
          d3.select(id).node().__onmouseover(e);
          break;
          case 'mouseleave':
          $(this).css({
            'opacity': 0.9
          });
          d3.select(id).node().__onmouseout(e)
          break;
          default:
          break;
        }
      },
      'click': function(e) {
        let hasClass = $(this).hasClass('toggle');
        let name = $(this).attr('data-name');
        let id = '#' +self.masterId+'-' +slugify(name);

        if (!hasClass) {
          $(this).css({
            'opacity': 0.2
          });
          $(this).addClass('toggle');
          $(id).fadeOut();
          self.legend_hidden[id] = name;
        } else {
          $(this).css({
            'opacity': 1
          });
          $(this).removeClass('toggle');
          $(id).fadeIn();
          delete self.legend_hidden[id];
        }
      }
    });
  };

  final_draw(animate) {
    let self = this;
    if (this.data.length) {
      this.canvas.select('.noData').style('display', 'none');
    }
    let arc = d3.svg.arc();
    arc.innerRadius(this.innerRadius);
    arc.outerRadius(this.outerRadius);

    let pie = d3.layout.pie();
    pie.sort(null);
    pie.value(function(d) {
      return d.value;
    });

    let main = this.root_piedonut_series.selectAll('.arc')
    .data(pie(this.data), function(d) {
      return d.data.name;
    });

    let g = main.enter().append('g')
    .attr('class', 'arc').style('position', 'relative');

    let color = d3.scale.category20();
    let path = g.attr('id', function(d) {
      return self.masterId+'-' +slugify(d.data.name);
    }).style("fill", function(d, i) { return d.data.color; }).style('stroke', 'white').append("path").attr("d", function(d) {
      return arc({
        startAngle: 0,
        endAngle: 0
      });
    })

    if (animate === 'launch') {
      this.old_pie_data = pie(this.data);
      setTimeout(() => {
        path.transition().attrTween('d', function(d) {
          let i = d3.interpolate({
            startAngle: 0,
            endAngle: 0
          }, {
            startAngle: d.startAngle,
            endAngle: d.endAngle
          });
          return function(t) {
            return arc(i(t));
          }
        }).duration(500);
      }, 15);
    } else if (animate === 'add') {
      let t = main.transition().duration(500).each('end', () => {
        self.old_pie_data = pie(self.data);
      });
      t.select('path').attrTween('d', function(d, k) {
        let startAngle = 0;
        let endAngle = 0;
        try {
          startAngle = self.old_pie_data[k].startAngle;
          endAngle = self.old_pie_data[k].endAngle;
        } catch(e) {
          startAngle = self.old_pie_data[self.old_pie_data.length-1].startAngle;
          endAngle = self.old_pie_data[self.old_pie_data.length-1].endAngle;
          // do nothing
        }
        let i = d3.interpolate({
          startAngle: startAngle,
          endAngle: endAngle
        }, {
          startAngle: d.startAngle,
          endAngle: d.endAngle
        });

        if (d.data.hasOwnProperty('_remove')) {
          self.data.splice(k, 1);
        }
        self._setupLegend();
        return function(t) {
          return arc(i(t));
        }
      });
    } else {
      this.old_pie_data = pie(this.data);
      path.attr('d', function(d) {
        return arc(d);
      });
    }

    let mouseover = 'mouseover',
    mousemove = 'mousemove',
    mouseout  = 'mouseout';
    if (this.is_touch_device) {
      mouseover = 'touchstart';
      mousemove = 'touchstart';
      mouseout  = 'touchend';
    }

    let timer;

    g.on(mouseover, function(d) {
      clearTimeout(timer);
      let centroid = arc.centroid(d);
      let h = Math.sqrt(Math.pow(centroid[0], 2) + Math.pow(centroid[1], 2));

      let x = centroid[0]/h * 8;
      let y = centroid[1]/h * 8;
      if (!self.is_touch_device) {
        d3.select(this).transition().duration(150).attr('transform', "translate(" + [x, y] + ")");
      }
    });

    g.on(mousemove, function(d, i) {
      clearTimeout(timer);
      if (self.is_touch_device) {
        let coordinates = d3.touches(this, self.d3_eventSource().changedTouches)[0];
      } else {
        let coordinates = d3.mouse(this);
      }
      self.tooltip.css('display', useTable);
      self.tooltip.css({
        'left': (self.width/2 - self.margin.left/2) + coordinates[0],
        'top' : (self.height/2 - self.margin.top/2) + coordinates[1]
      });

      if (self.opts.tooltip.customPlaceholder) {
        let tip = self.opts.tooltip.customPlaceholder.replace("%n", d.data.name);
        tip = tip.replace("%v", d.data.value);
        tip = tip.replace("%c", d.data.color);
        self.tooltip.html(tip);
      } else {
        self.tooltip.html("<div style='color: "+d.data.color+";'><b><span style='font-size: 22px;'>■ </span><span style='position:relative; top: -3px; left: -2px;'>"+d.data.name+" :</span></b> <span style='position:relative; top: -3px; left: -2px;'>"+d.data.value+"</span></div>");
      }

      d3.select(this).style('fill', d.data.color);
    });

    g.on(mouseout, function(d, i) {
      let $this = this;
      if (self.is_touch_device) {
        timer = setTimeout(() => {
          self.tooltip.hide();
        }, 3000);

        setTimeout(() => {
          d3.select($this).style('fill', d.data.color);
        }, 3000);
      } else {
        self.tooltip.hide();
        d3.select($this).style('fill', d.data.color);
        d3.select($this).transition().duration(150).attr('transform', 'translate(0, 0)');
      }
    });

    main.exit().remove();

    for(let i in this.legend_hidden) {
      $(i).hide();
    }
  };

  removePoint(ref) {
    let removed = false;
    for(let i = 0; i < this.data.length; i++) {
      if (this.data[i].name === ref) {
        removed = true;
        this.data[i].value = 0;
        this.data[i]._remove = true;
        break;
      }
    }

    if (!removed) return;

    this.final_draw('add');
  };

  updatePoint(data) {
    this.addPoint(data);
  };

  addPoint(data) {
    this.data_changed = true;
    let updated = false;
    for(let i = 0; i < this.data.length; i++) {
      if (this.data[i].name === data.name) {
        updated = true;
        this.data[i].value = +data.value;
        break;
      }
    }

    if (!updated) {
      this.data.push(data);
    }

    this.final_draw('add');
  };
}

/*eslint-disable */
