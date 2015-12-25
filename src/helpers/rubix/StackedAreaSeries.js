/*eslint-disable */

/**
* @param {Rubix} rubix
* @param {Object} opts
* @constructor
*/
export default class StackedAreaSeries {
  constructor(rubix, opts) {
    this.opts = opts;
    this.opts.color = this.opts.color || 'steelblue';
    this.opts.marker = this.opts.marker || 'circle';
    this.opts.fillopacity = this.opts.fillopacity || 0.5;
    this.opts.strokewidth = this.opts.strokewidth || 1;
    this.opts.noshadow = this.opts.noshadow || false;
    this.show_markers = this.opts.show_markers;

    if (!this.opts.hasOwnProperty('name')) throw new Error('StackedAreaSeries should have a \'name\' property');

    this.name = this.opts.name;

    this.chart_hidden = false;
    this.temp_stack = [];

    this.setup = false;
    this.last_stack = [];
    this.last_stack_name = '';
    this.last_stack_added = false;

    this._setup(rubix);
  }


  /**
  * @param {Rubix} rubix
  * @private
  */
  _setup(rubix) {
    this.rubix = rubix;

    this.root   = this.rubix.root;
    this.data   = this.rubix.data;
    this.width  = this.rubix.width;
    this.height = this.rubix.height;
    this.stack  = this.rubix.area_stack;
    this.offset = this.rubix.area_offset;
    this.area_stack_data = this.rubix.area_stack_data;
    this.stacked_area_series = this.rubix.root_stacked_area_series;
    this.show_markers = (this.show_markers === undefined) ? this.rubix.show_markers : this.show_markers;

    this.master_detail = this.rubix.master_detail;

    if (this.master_detail) {
      this.md_root = this.rubix.md_root;
    }

    if (!this.id) {
      this.id = this.rubix.uid('stacked-area');
    }

    /** separator */
    let self = this;
    this.line = d3.svg.line();
    this.line.defined(function(d) {
      if (self.rubix.offset === 'expand') {
        if (d.y_new === 0 && d.y0 === 1) {
          return false;
        }
        return true;
      }

      return d.y_new !== null && d.x !== null;
    });
    if (this.rubix.opts.invertAxes) {
      this.line.x(function(d) {
        let val = d.y0 + d.y_new;
        if (isNaN(val)) {
          return 0;
        }
        return self.rubix.x(val);
      });
      this.line.y(function(d) {
        if (self.rubix.axis.y.range === 'column' || self.rubix.axis.y.range === 'bar') {
          return self.rubix.y(d.x) + self.rubix.y.rangeBand()/2;
        }
        return self.rubix.y(d.x);
      });
      this.line.interpolate(this.rubix.interpolate);
    } else {
      this.line.x(function(d) {
        if (self.rubix.axis.x.range === 'column' || self.rubix.axis.x.range === 'bar') {
          return self.rubix.x(d.x) + self.rubix.x.rangeBand()/2;
        }
        return self.rubix.x(d.x);
      });
      this.line.y(function(d) {
        let val = d.y0 + d.y_new;
        if (isNaN(val)) {
          return 0;
        }
        return self.rubix.y(val);
      });
      this.line.interpolate(this.rubix.interpolate);
    }

    this.area = d3.svg.area();
    this.area.defined(this.line.defined());

    if (this.rubix.opts.invertAxes) {
      this.area.x0(function(d) {
        let val = d.y0;
        if (isNaN(val)) {
          return 0;
        }
        return self.rubix.x(val);
      });
      this.area.x1(function(d) {
        let val = d.y0 + d.y_new;
        if (isNaN(val)) {
          return 0;
        }
        return self.rubix.x(val);
      });
      this.area.y(function(d) {
        if (self.rubix.axis.y.range === 'column' || self.rubix.axis.y.range === 'bar') {
          return self.rubix.y(d.x) + self.rubix.y.rangeBand()/2;
        }
        return self.rubix.y(d.x);
      });
      this.area.interpolate(this.rubix.interpolate);
    } else {
      this.area.x(function(d) {
        if (self.rubix.axis.x.range === 'column' || self.rubix.axis.x.range === 'bar') {
          return self.rubix.x(d.x) + self.rubix.x.rangeBand()/2;
        }
        return self.rubix.x(d.x);
      });
      this.area.y0(function(d) {
        let val = d.y0;
        if (isNaN(val)) {
          return 0;
        }
        return self.rubix.y(val);
      });
      this.area.y1(function(d) {
        let val = d.y0 + d.y_new;
        if (isNaN(val)) {
          return 0;
        }
        return self.rubix.y(val);
      });
      this.area.interpolate(this.rubix.interpolate);
    }

    if (this.master_detail) {
      this.master_line = d3.svg.line();
      this.master_line.defined(function(d) {
        if (self.rubix.area_offset === 'expand') {
          if (d.y_new === 0 && d.y0 === 1) {
            return false;
          }
          return true;
        }

        return d.y_new !== null && d.x !== null;
      });
      this.master_line.x(function(d) {
        return self.rubix.x2(d.x);
      });
      this.master_line.y(function(d) {
        let val = d.y0 + d.y_new;
        if (isNaN(val)) {
          return 0;
        }
        return self.rubix.y2(val);
      });
      this.master_line.interpolate(this.rubix.interpolate);

      this.master_area = d3.svg.area();
      this.master_area.defined(this.master_line.defined());
      this.master_area.x(function(d) {
        return self.rubix.x2(d.x);
      });
      this.master_area.y0(function(d) {
        let val = d.y0;
        if (isNaN(val)) {
          return 0;
        }
        return self.rubix.y2(val);
      });
      this.master_area.y1(function(d) {
        let val = d.y0 + d.y_new;
        if (isNaN(val)) {
          return 0;
        }
        return self.rubix.y2(val);
      });
      this.master_area.interpolate(this.rubix.interpolate);
    }
  };

  // Alias for draw
  redraw(rubix) {
    this._setup(rubix);
    this.draw();
  };

  noRedraw(rubix) {
    this._setup(rubix);
    this.draw(true);
  };

  /**
  * @param {Array|Object} data
  */
  addData(data) {
    this.rubix.data_changed = true;
    if (!(data instanceof Array)) {
      if (!(data instanceof Object)) {
        throw new Error("Data must be an array or object");
      } else {
        if (!(data.hasOwnProperty('x') || data.hasOwnProperty('y'))) {
          throw new Error("Object must be in the form: {x: ..., y: ...}");
        }

        data = [data];
      }
    }

    if (!data.length) return;

    if (!this.rubix.opts.noSort) {
      data.sort(function(a, b) {
        if (a.x > b.x) {
          return 1;
        } else if (a.x === b.x) {
          return 0;
        } else {
          return -1;
        }
      });
    }

    this.data[this.name] = data;

    this.area_stack_data.push({
      key: this.name,
      color: this.opts.color,
      values: this.data[this.name],
      fillopacity: this.opts.fillopacity,
      strokewidth: this.opts.strokewidth,
      orderKey: this.area_stack_data.length
    });

    this.rubix.resetAxis(true);
    this.rubix.forceRedraw();
    this._animate_draw();
  };

  draw(forced) {
    if (!this.name) return;
    if (!this.data) return;
    if (!this.data.hasOwnProperty(this.name)) return;
    if (!this.data[this.name].length) return;

    let oldLayers = this.layers;
    try {
      this.layers = this.stack(this.area_stack_data);
    } catch(e) {
      // data un-available. retaining old layer.
      this.layers = oldLayers;
    }

    let self = this;

    let isConstructed = this.stacked_area_series.selectAll('.' +this.id)[0].length;

    if (!isConstructed) {
      try {
        this.stacked_area_series.selectAll('.layer').remove();
        this.stacked_area_series.selectAll('.' + this.id + '-line').remove();

        let p = this.stacked_area_series.selectAll('.layer').data(this.layers, function(d) {
          return d.key;
        });

        let createdPath = p.enter().append('path');
        createdPath.attr('class', 'layer')
        .attr('d', function(d) { return self.area(d.values); })
        .attr('fill', function(d) { return d.color; })
        .attr('fill-opacity', function(d) {
          return d.fillopacity
        })
        .attr('stroke', 'none');

        p.exit().remove();

        if (this.master_detail) {
          createdPath.attr('clip-path', 'url(#' +self.rubix.masterId+'-clip)');
          createdPath.classed('clipped', true);

          if (!forced) {
            let md_p = this.md_root.select('.md-layers > .md_stacked_area_series').selectAll('.layer').data(this.layers, function(d) {
              return d.key;
            });

            let createdMdPath = md_p.enter().append('path');
            createdMdPath.attr('class', 'layer')
            .attr('d', function(d) { return self.master_area(d.values); })
            .attr('fill', function(d) { return d.color; })
            .attr('fill-opacity', function(d) {
              return d.fillopacity;
            })
            .attr('stroke', 'none');

            createdMdPath.attr('clip-path', 'url(#' +self.rubix.masterId+'-clip)');

            createdMdPath.classed('clipped', true);

            md_p.exit().remove();
          }
        }

        for(let i = 0; i < this.layers.length; i++) {
          let name = this.layers[i].key;
          if (this.name === name) {
            let datum = this.layers[i].values;
            if (!this.opts.noshadow) {
              this.strokePath1 = this.stacked_area_series.append('path').attr('class', this.id+'-line').datum(datum).attr('d', this.line).attr('stroke', 'black').attr('fill', 'none').attr('stroke-linecap', 'round').attr('stroke-width', 5 * this.opts.strokewidth).attr('stroke-opacity', 0.05000000000000001).attr('transform', 'translate(1,1)');
              this.strokePath2 = this.stacked_area_series.append('path').attr('class', this.id+'-line').datum(datum).attr('d', this.line).attr('stroke', 'black').attr('fill', 'none').attr('stroke-linecap', 'round').attr('stroke-width', 3 * this.opts.strokewidth).attr('stroke-opacity', 0.1).attr('transform', 'translate(1,1)');
              this.strokePath3 = this.stacked_area_series.append('path').attr('class', this.id+'-line').datum(datum).attr('d', this.line).attr('stroke', 'black').attr('fill', 'none').attr('stroke-linecap', 'round').attr('stroke-width', 1 * this.opts.strokewidth).attr('stroke-opacity', 0.15000000000000002).attr('transform', 'translate(1,1)');
            }
            this.linePath = this.stacked_area_series.append('path').datum(datum).attr('class', this.id+'-line').attr('stroke', this.opts.color).attr('fill', 'none').attr('stroke-linecap', 'round').attr('d', this.line).attr('stroke-width', 2 * this.opts.strokewidth);

            if (this.master_detail) {
              if (!forced) {
                this.md_root.select('.md-layers > .md_stacked_area_series').selectAll('.' + this.id + '-line').remove();
                this.masterLinePath = this.md_root.select('.md-layers > .md_stacked_area_series').append('path').datum(datum).attr('class', this.id+'-line').attr('stroke', this.opts.color).attr('fill', 'none').attr('stroke-linecap', 'round').attr('d', this.master_line).attr('stroke-width', 2 * this.opts.strokewidth);
                this.masterLinePath.attr('clip-path', 'url(#' +self.rubix.masterId+'-clip)');
                this.masterLinePath.classed('clipped', true);

                if (this.dataChanged) {
                  this.rubix.resetExtent();
                  this.dataChanged = false;
                }
              }

              if (!this.opts.noshadow) {
                this.strokePath1.attr('clip-path', 'url(#' +self.rubix.masterId+'-clip)');
                this.strokePath2.attr('clip-path', 'url(#' +self.rubix.masterId+'-clip)');
                this.strokePath3.attr('clip-path', 'url(#' +self.rubix.masterId+'-clip)');
              }
              this.linePath.attr('clip-path', 'url(#' +self.rubix.masterId+'-clip)');

              if (!this.opts.noshadow) {
                this.strokePath1.classed('clipped', true);
                this.strokePath2.classed('clipped', true);
                this.strokePath3.classed('clipped', true);
              }
              this.linePath.classed('clipped', true);
            }
            break;
          }
        }
      } catch(e) {
        // do nothing
      }
      this.setup = true;
    } else {
      this.rubix.runCommand('globalRedraw');
    }

    this.rubix.resetFocus(forced);
  };

  /**
  * @param {Object} data
  * @param {?Boolean} shift
  * @param {?Boolean} noRedraw
  */
  updatePoint(data, shift, noRedraw) {
    this.addPoint(data, shift, noRedraw);
  };

  /**
  * @param {*} ref
  * @param {?Boolean} noRedraw
  */
  removePoint(ref, noRedraw) {
    if (this.chart_hidden) {
      this.temp_stack.push({
        type: 'removePoint',
        ref: ref
      });
      return;
    }

    if (!this.data[this.name]) {
      this.data[this.name] = [];
    }

    let removed = false, pos = 0;
    for(let i = 0; i < this.data[this.name].length; i++) {
      if (this.data[this.name][i].x === ref) {
        this.data[this.name][i].y = null;
        pos = i;
        removed = true;
        break;
      }
    }

    if (!removed) return;

    let found = false;
    for(let i = 0; i < this.area_stack_data.length; i++) {
      let st = this.area_stack_data[i];
      try {
        if (st.values[pos].x === ref) {
          if (st.values[pos].y !== null) {
            found = true;
            break;
          }
        }
      } catch(e) {
        // do nothing
      }
    }

    if (!found) {
      for(let i = 0; i < this.area_stack_data.length; i++) {
        this.area_stack_data[i].values.splice(pos, 1);
      }
    }

    let oldLayers = this.layers;
    try {
      this.layers = this.stack(this.area_stack_data);
    } catch(e) {
      // data un-available. retaining old layer.
      this.layers = oldLayers;
    }

    if (this.master_detail) {
      this.dataChanged = true;
    }

    if (noRedraw) return;

    if (this.setup) {
      this._animate_draw();
    } else {
      this.rubix.resetAxis(true);
      this.rubix.forceRedraw();
    }
  };

  /**
  * @param {Object} data
  * @param {?Boolean} shift
  * @param {?Boolean} noRedraw
  */
  addPoint(data, shift, noRedraw) {
    this.rubix.data_changed = true;
    if (!(data instanceof Object) || (data instanceof Array)) {
      throw new Error("Object required for addPoint");
    }
    if (!(data.hasOwnProperty('x') || data.hasOwnProperty('y'))) {
      throw new Error("Object must be in the form: {x: ..., y: ...}");
    }

    if (this.chart_hidden) {
      this.temp_stack.push({
        type: 'addPoint',
        data: data,
        shift: shift
      });
      return;
    }

    if (!this.data[this.name]) {
      this.data[this.name] = [];
    }

    let added = false;
    for(let i = 0; i < this.data[this.name].length; i++) {
      if (this.data[this.name][i].x === data.x) {
        this.data[this.name][i].y = data.y;
        added = true;
        break;
      }
    }

    if (!added) {
      this.data[this.name].push(data);
    }

    this.data[this.name].sort(function(a, b) {
      if (a.x > b.x) {
        return 1;
      } else if (a.x === b.x) {
        return 0;
      } else {
        return -1;
      }
    });

    if (this.rubix.opts.interval) {
      if (this.rubix.opts.interval < this.data[this.name].length) {
        this.data[this.name].shift();
      }
    } else {
      if (shift) {
        this.data[this.name].shift();
      }
    }

    let max_elems = d3.max(this.area_stack_data, function(d) {
      return d.values.length;
    });

    for(let i = 0; i < this.area_stack_data.length; i++) {
      let st = this.area_stack_data[i];
      if (st.values.length < max_elems) {
        st.values.push({
          x: data.x,
          y: null
        });
      }
    }

    let oldLayers = this.layers;
    try {
      this.layers = this.stack(this.area_stack_data);
    } catch(e) {
      // data un-available. retaining old layer.
      this.layers = oldLayers;
    }

    if (this.master_detail) {
      this.dataChanged = true;
    }

    if (noRedraw) return;

    if (this.setup) {
      this._animate_draw();
    } else {
      this.rubix.resetAxis(true);
      this.rubix.forceRedraw();
    }
  };

  _animate_draw() {
    let text = this.root.selectAll('.y.axis').selectAll('text')[0];
    let width = [];
    for(let i = 0; i < text.length; i++) {
      width.push(text[i].getBBox().width);
    }
    let origMaxWidth = d3.max(width);

    this.rubix.resetAxis(true);

    this.rubix.runCommand('globalRedraw');

    text = this.root.selectAll('.y.axis').selectAll('text')[0];
    width = [];
    for(let i = 0; i < text.length; i++) {
      width.push(text[i].getBBox().width);
    }

    let maxWidth = d3.max(width);

    this.rubix.marginLeft(maxWidth);
    this.rubix.resetFocus();
  };

  hidden() {
    this.chart_hidden = true;
  };

  show() {
    this.chart_hidden = false;
    while(this.temp_stack.length>1) {
      let rawData = this.temp_stack.shift();
      if (rawData.type === 'addPoint') {
        this.addPoint(rawData.data, rawData.shift, true);
      } else {
        this.removePoint(rawData.ref);
      }
    }
    if (this.temp_stack.length) {
      let rawData = this.temp_stack.shift();
      if (rawData.type === 'addPoint') {
        this.addPoint(rawData.data, rawData.shift, true);
      } else {
        this.removePoint(rawData.ref);
      }
    }
  };

  globalRedraw(rubix) {
    this.stacked_area_series.select('.' +this.id+'-line').attr('d', this.line);
  };

  forceRedraw(rubix) {
    this.redraw(rubix);
  };

  on_complete_draw() {
    if (!this.setup) return;
    let self = this;
    if (this.opts.marker !== undefined && this.show_markers) {
      if (this.master_detail) {
        this.rubix.symbols.attr('clip-path', 'url(#' +self.rubix.masterId+'-clip-symbols)');
      }
      this.markers = this.rubix.symbols.selectAll('.' +this.id+'-marker');
      switch (this.opts.marker) {
        case 'circle':
        case 'cross':
        case 'square':
        case 'diamond':
        case 'triangle-up':
        case 'triangle-down':
        const symbol = d3.svg.symbol();
        symbol.type(this.opts.marker);

        let symbolType = this.markers.data(this.data[this.name]);
        let symbolPath = symbolType.enter().append('path');
        symbolPath.attr('d', symbol)
        .attr('class', this.id + '-marker')
        .attr('fill', this.opts.color)
        .style('display', function(d) {
          if (self.rubix.area_offset === 'expand') {
            if (d.y_new === 0 && d.y0 === 1) {
              return 'none';
            }
            return null;
          }
          if (d.y_new === null) {
            return 'none';
          }
          return null;
        })
        .attr('stroke', 'white')
        .attr('transform', function(d) {
          let val = d.y0 + d.y_new;
          if (isNaN(val)) {
            val = 0;
          }
          if (self.rubix.opts.invertAxes) {
            let _y = self.rubix.y(d.x);
            let _x = self.rubix.x(val);
            if (self.rubix.axis.y.range === 'column' || self.rubix.axis.y.range === 'bar') {
              _y += self.rubix.y.rangeBand()/2;
            }
          } else {
            let _y = self.rubix.y(val);
            let _x = self.rubix.x(d.x);
            if (self.rubix.axis.x.range === 'column' || self.rubix.axis.x.range === 'bar') {
              _x += self.rubix.x.rangeBand()/2;
            }
          }
          return 'translate(' +_x+',' +_y+')';
        });
        symbolType.exit().remove();
        break;
        default:
        throw new Error('Unknown marker type : ' + this.opts.marker);
        break;
      }
    }
  };

  setupFocus() {
    if (!this.setup) return;
    if (this.focus) this.focus.remove();
    this.focus = this.rubix.focus_group.append('g');
    this.focus.attr('class', 'focus');
    this.focus.style('display', 'none');
    switch (this.opts.marker) {
      case 'circle':
      case 'cross':
      case 'square':
      case 'diamond':
      case 'triangle-up':
      case 'triangle-down':
      let symbol = d3.svg.symbol();
      symbol.type(this.opts.marker);
      let path = this.focus.append('path').attr('d', symbol).attr('fill', this.opts.color).attr('stroke', 'white').attr('stroke-width', 2);
      break;
      default:
      throw new Error('Unknown marker type : ' + this.opts.marker);
      break;
    }
  };

  onFocus() {
    if (!this.setup) return;
    this.linePath.attr('stroke-width', 2 * this.opts.strokewidth);
  };

  offFocus() {
    if (!this.setup) return;
    this.linePath.attr('stroke-width', 2 * this.opts.strokewidth);
  };

  slugify(text) {
    text = text.replace(/[^-a-zA-Z0-9,&\s]+/ig, '');
    text = text.replace(/-/gi, "_");
    text = text.replace(/\s/gi, "-");
    return text;
  };
}

// export default StackedAreaSeries;
/*eslint-disable */
