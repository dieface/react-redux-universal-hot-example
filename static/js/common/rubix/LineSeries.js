/* eslint-disable */

/**
* @param {Rubix} rubix
* @param {Object} opts
* @constructor
*/
export default class LineSeries {
  constructor(rubix, opts) {
    this.opts = opts;
    this.opts.color = this.opts.color || 'steelblue';
    this.opts.marker = this.opts.marker || 'circle';
    this.opts.scatter = this.opts.scatter || false;
    this.opts.noshadow = this.opts.noshadow || false;
    this.show_markers = this.opts.show_markers;
    this.opts.strokewidth = this.opts.strokewidth || 1;

    if (!this.opts.hasOwnProperty('name')) throw new Error('LineSeries should have a \'name\' property');

    this.name = this.opts.name;

    this.chart_hidden = false;
    this.temp_stack = [];

    this.setup = false;
    this._setup(rubix);
  };

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
    this.line_series = this.rubix.root_line_series;
    this.show_markers = (this.show_markers === undefined) ? this.rubix.show_markers : this.show_markers;

    this.master_detail = this.rubix.master_detail;

    if (this.master_detail) {
      this.md_root = this.rubix.md_root;
    }

    if (!this.id) {
      this.id = this.rubix.uid('line');
    }

    /** separator */
    let self = this;
    this.line = d3.svg.line();
    this.line.defined(function(d) {
      return d.x !== null && d.y !== null;
    });
    this.line.x(function(d) {
      if (self.rubix.opts.invertAxes) {
        return self.rubix.x(d.y);
      }

      if (self.rubix.axis.x.range === 'column' || self.rubix.axis.x.range === 'bar') {
        return self.rubix.x(d.x) + self.rubix.x.rangeBand()/2;
      }
      return self.rubix.x(d.x);
    });
    this.line.y(function(d) {
      if (self.rubix.opts.invertAxes) {
        if (self.rubix.axis.y.range === 'column' || self.rubix.axis.y.range === 'bar') {
          return self.rubix.y(d.x) + self.rubix.y.rangeBand()/2;
        }
        return self.rubix.y(d.x);
      }
      return self.rubix.y(d.y);
    });
    this.line.interpolate(this.rubix.interpolate);

    if (this.master_detail) {
      this.master_line = d3.svg.line();
      this.master_line.defined(function(d) {
        return d.x !== null && d.y !== null;
      });
      this.master_line.x(function(d) {
        if (self.rubix.opts.invertAxes) {
          return self.rubix.x2(d.y);
        }
        return self.rubix.x2(d.x);
      });
      this.master_line.y(function(d) {
        if (self.rubix.opts.invertAxes) {
          return self.rubix.y2(d.x);
        }
        return self.rubix.y2(d.y);
      });
      this.master_line.interpolate(this.rubix.interpolate);
    }
  };

  // Alias for draw
  redraw(rubix) {
    this._setup(rubix);
    this.draw();
  };

  // Alias for draw
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

    this.rubix.resetAxis(false);
    this.rubix.forceRedraw();
    this._animate_draw();
  };

  draw(forced) {
    if (!this.name) return;
    if (!this.data) return;
    if (!this.data.hasOwnProperty(this.name)) return;
    if (!this.data[this.name].length) return;

    let self = this;

    let isConstructed = this.line_series.selectAll('.' +this.id)[0].length;

    if (!isConstructed) {
      this.line_series.selectAll('.' +this.id+'.clipped').remove();
      if (!this.opts.scatter) {
        if (!this.opts.noshadow) {
          this.strokePath1 = this.line_series.append('path').attr('class', this.id+' line').datum(this.data[this.name]).attr('d', this.line).attr('stroke', 'black').attr('fill', 'none').attr('stroke-linecap', 'round').attr('stroke-width', 5 * this.opts.strokewidth).attr('stroke-opacity', 0.05000000000000001).attr('transform', 'translate(1,1)');
          this.strokePath2 = this.line_series.append('path').attr('class', this.id+' line').datum(this.data[this.name]).attr('d', this.line).attr('stroke', 'black').attr('fill', 'none').attr('stroke-linecap', 'round').attr('stroke-width', 3 * this.opts.strokewidth).attr('stroke-opacity', 0.1).attr('transform', 'translate(1,1)');
          this.strokePath3 = this.line_series.append('path').attr('class', this.id+' line').datum(this.data[this.name]).attr('d', this.line).attr('stroke', 'black').attr('fill', 'none').attr('stroke-linecap', 'round').attr('stroke-width', 1 * this.opts.strokewidth).attr('stroke-opacity', 0.15000000000000002).attr('transform', 'translate(1,1)');
        }
        this.linePath = this.line_series.append('path').datum(this.data[this.name]).attr('class', this.id+' line').attr('stroke', this.opts.color).attr('fill', 'none').attr('stroke-linecap', 'round').attr('d', this.line).attr('stroke-width', 2 * this.opts.strokewidth);
      }

      if (this.master_detail) {
        if (!this.opts.scatter) {
          this.md_root.select('.md-layers > .md_line_series').selectAll('.' +this.id+'.clipped').remove();
          this.masterLinePath = this.md_root.select('.md-layers > .md_line_series').append('path').datum(this.data[this.name]).attr('class', this.id+' line').attr('stroke', this.opts.color).attr('fill', 'none').attr('stroke-linecap', 'round').attr('d', this.master_line).attr('stroke-width', 2 * this.opts.strokewidth);
          this.masterLinePath.attr('clip-path', 'url(#' +self.rubix.masterId+'-clip)');
          this.masterLinePath.classed('clipped', true);
        } else {
          this.md_root.select('.md-layers > .md_line_series').attr('clip-path', 'url(#' +self.rubix.masterId+'-clip)');
          let self = this;
          let datum = this.data[this.name];
          this.markers_master = this.md_root.select('.md-layers > .md_line_series').selectAll('.' +this.id+'-marker');
          switch (this.opts.marker) {
            case 'circle':
            case 'cross':
            case 'square':
            case 'diamond':
            case 'triangle-up':
            case 'triangle-down':
            let symbol = d3.svg.symbol();
            symbol.type(this.opts.marker);

            let symbolType = this.markers_master.data(datum);
            symbolType.enter().append('path')
            .attr('d', symbol)
            .attr('class', this.id + '-marker')
            .attr('fill', this.opts.color)
            .style('display', function(d) {
              if (d.y === null) {
                return 'none';
              }
              return null;
            })
            .attr('stroke', 'none')
            .attr('transform', function(d) {
              let val = d.y;
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
                let _y = self.rubix.y2(val);
                let _x = self.rubix.x2(d.x);
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

        if (this.dataChanged) {
          this.rubix.resetExtent();
          this.dataChanged = false;
        }

        if (!this.opts.scatter) {
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
      }

      this.setup = true;
    } else {
      this.rubix.runCommand('globalRedraw');
    }

    this.rubix.resetFocus(forced);
  };

  /**
  * @param {Array|Object} data
  */
  update(data) {
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

    if (this.setup) {
      this._animate_draw();
    } else {
      this.rubix.resetAxis(false);
      this.rubix.forceRedraw();
    }
  };

  /**
  * Alias for addPoint
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

    let removed = false;
    for(let i = 0; i < this.data[this.name].length; i++) {
      if (this.data[this.name][i].x === ref) {
        this.data[this.name].splice(i, 1);
        removed = true;
        break;
      }
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
    this.line_series.selectAll('.' +this.id+'.line').attr('d', this.line);
  };

  forceRedraw(rubix) {
    this.redraw(rubix);
  };

  on_complete_draw() {
    if (!this.setup) return;
    let self = this;
    let datum = this.data[this.name];
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
        let symbol = d3.svg.symbol();
        symbol.type(this.opts.marker);

        let symbolType = this.markers.data(datum);
        symbolType.enter().append('path')
        .attr('d', symbol)
        .attr('class', this.id + '-marker')
        .attr('fill', this.opts.color)
        .style('display', function(d) {
          if (d.y === null) {
            return 'none';
          }
          return null;
        })
        .attr('stroke', 'white')
        .attr('transform', function(d) {
          let val = d.y;
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
}

/* eslint-disable */
