/*eslint-disable */

/**
* @param {Rubix} rubix
* @param {Object} opts
* @constructor
*/
export default class ColumnSeries {
  constructor(rubix, opts) {
    this.type = 'column_series';
    this.opts = opts;
    this.opts.color = this.opts.color || 'steelblue';
    this.opts.marker = this.opts.marker || 'circle';
    this.opts.nostroke = this.opts.nostroke || '';
    this.opts.fillopacity = this.opts.fillopacity || 0.85;
    this.show_markers = this.opts.show_markers;

    if (!this.opts.hasOwnProperty('name')) throw new Error('ColumnSeries should have a \'name\' property');

    this.name = this.opts.name;

    this.chart_hidden = false;
    this.temp_stack = [];

    this.setup = false;
    this.last_stack = [];
    this.last_stack_name = '';
    this.last_stack_added = false;

    this.count = 0;

    this._setup(rubix);
  };

  /**
  * @param {Rubix} rubix
  * @private
  */
  _setup(rubix) {
    this.rubix = rubix;
    this.rubix.stacked = true;

    this.root   = this.rubix.root;
    this.data   = this.rubix.data;
    this.width  = this.rubix.width;
    this.height = this.rubix.height;
    this.stack  = this.rubix.column_stack;
    this.offset = this.rubix.column_offset;
    this.cb_series = this.rubix.root_cb_series;
    this.column_stack = this.rubix.column_stack_data;
    this.show_markers = (this.show_markers === undefined) ? this.rubix.show_markers : this.show_markers;

    this.grouped = this.rubix.grouped;

    if (!this.id) {
      this.id = this.rubix.uid('stacked-column');
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

    let maxLen = 0, columns = [];
    for(let i in this.data) {
      let len = this.data[i].length;
      if (len > maxLen) {
        maxLen = len;
        columns = [];
        for(let k=0; k<maxLen; k++) {
          columns.push(this.data[i][k].x);
        }
      }
    }

    this.rubix.maxLen = maxLen;

    this.data[this.name] = data;

    for(let i in this.data) {
      let len = this.data[i].length;
      if (len < maxLen) {
        let dup_columns = columns.concat();
        for(let j=0; j<this.data[i].length; j++) {
          let column_index = dup_columns.indexOf(this.data[i][j].x);
          dup_columns.splice(column_index, 1);
        }
        for(let j=0; j<dup_columns.length; j++) {
          this.rubix.charts[i].addPoint({
            x: dup_columns[j],
            y: null
          });
        }
      }
    }

    this.column_stack.push({
      key: this.name,
      color: this.opts.color,
      marker: this.opts.marker,
      values: this.data[this.name],
      orderKey: this.column_stack.length
    });

    this.rubix.resetAxis();
    this.rubix.forceRedraw();
    this._animate_draw();
  };

  _createRect() {
    let self = this;
    let strokecolor = 'white';
    if (this.opts.nostroke) strokecolor = 'none';
    let rect = this.columnGroup.selectAll('rect').data(function(d) { return d.values; }).enter().append('rect').attr('stroke', strokecolor);
    if (this.grouped) {
      if (this.rubix.opts.invertAxes) {
        rect.attr('x', function(d, i, j) {
          let val = self.rubix.x(0);
          if (isNaN(val)) {
            return null;
          }
          return val;
        });
        rect.attr('y', function(d, i, j) {
          return self.rubix.y(d.x) + self.rubix.y.rangeBand() / self.layers.length * j;
        });
        rect.attr('class', function(d, i, j) {
          return 'column-' + ((self.rubix.y(d.x) + (self.rubix.y.rangeBand()/self.layers.length) * (self.layers.length-1)) + self.rubix.y.rangeBand()/(2*self.layers.length));
        });
        rect.attr("width", function(d) {
          let val = Math.abs(self.rubix.x(d.y) - self.rubix.x(0));
          if (isNaN(val)) {
            return null;
          }
          return val;
        });
        rect.attr('height', self.rubix.y.rangeBand() / self.layers.length);
        rect.attr('transform', function(d) {
          let val = self.rubix.x(d.y_new) - self.rubix.x(0);
          if (d.y < 0) {
            return 'translate(' +(-Math.abs(val))+',0)';
          } else {
            return 'translate(0,0)';
          }
        });
      } else {
        rect.attr('x', function(d, i, j) {
          return self.rubix.x(d.x) + self.rubix.x.rangeBand() / self.layers.length * j;
        });
        rect.attr('y', function(d) {
          let val = self.rubix.y(0);
          if (isNaN(val)) {
            return null;
          }
          return val;
        });
        rect.attr('class', function(d, i, j) {
          return 'column-' + ((self.rubix.x(d.x) + (self.rubix.x.rangeBand()/self.layers.length) * (self.layers.length-1)) + self.rubix.x.rangeBand()/(2*self.layers.length));
        });
        rect.attr("width", self.rubix.x.rangeBand() / self.layers.length)
        rect.attr('height', function(d) {
          let val = Math.abs(self.rubix.y(d.y) - self.rubix.y(0));
          if (isNaN(val)) {
            return null;
          }
          return val;
        });
        rect.attr('transform', function(d) {
          let val = self.rubix.y(d.y_new) - self.rubix.y(0);
          if (d.y > 0) {
            return 'translate(0,' +(-Math.abs(val))+')';
          } else {
            return 'translate(0,0)';
          }
        });
      }
    } else {
      if (this.rubix.opts.invertAxes) {
        rect.attr('x', function(d) {
          let val = self.rubix.x(d.y0);
          if (isNaN(val)) {
            return null;
          }
          return val;
        });
        rect.attr('y', function(d) {
          return self.rubix.y(d.x) || 0;
        });
        rect.attr('class', function(d) {
          return 'column-' + (self.rubix.y(d.x) + self.rubix.y.rangeBand()/2);
        });
        rect.attr("width", function(d) {
          let val = Math.abs(self.rubix.x(d.y0)-self.rubix.x(d.y+d.y0));
          if (isNaN(val)) {
            return null;
          }
          return val;
        });
        rect.attr('height', self.rubix.y.rangeBand());
        rect.attr('transform', function(d) {
          if (d.y < 0) {
            let val = Math.abs(self.rubix.x(d.y0)-self.rubix.x(d.y+d.y0));
            return 'translate(' +(-val)+',0)';
          }
          return null;
        });
      } else {
        rect.attr('x', function(d) {
          return self.rubix.x(d.x);
        });
        rect.attr('y', function(d) {
          let val = self.rubix.y(d.y0);
          if (isNaN(val)) {
            return null;
          }
          return val;
        });
        rect.attr('class', function(d) {
          return 'column-' + ((self.rubix.x(d.x) + self.rubix.x.rangeBand()/2));
        });
        rect.attr("width", self.rubix.x.rangeBand())
        rect.attr('height', function(d) {
          let val = Math.abs(self.rubix.y(d.y0)-self.rubix.y(d.y+d.y0));
          if (isNaN(val)) {
            return null;
          }
          return val;
        });
        rect.attr('transform', function(d) {
          if (d.y > 0) {
            let val = Math.abs(self.rubix.y(d.y0)-self.rubix.y(d.y+d.y0));
            return 'translate(0,' +(-val)+')';
          }
          return null;
        });
      }
    }
  };

  draw(forced) {
    try {
      if (!this.name) return;
      if (!this.data) return;
      if (!this.data.hasOwnProperty(this.name)) return;
      if (!this.data[this.name].length) return;

      let oldLayers = this.layers;

      try {
        this.layers = this.stack(this.column_stack);
      } catch(e) {
        // data un-available. retaining old layer.
        this.layers = oldLayers;
      }

      if (!this.grouped) {
        let max = this.rubix.maxLen;
        for(let i = 0; i < max; i++) {
          let x = this.layers[0].values[i].x;
          let ceiling = null;
          for(let j=0; j<this.layers.length; j++) {
            for(let k=0; k<max; k++) {
              try {
                if (this.layers[j].values[k].x === x) {
                  if (this.layers[j].values[k].y >= 0) {
                    if (this.layers[j].values[k].y === null) {
                      this.layers[j].values[k].y0 = null;
                    } else {
                      if (ceiling === null) ceiling = 0;
                      this.layers[j].values[k].y0 = ceiling;
                      ceiling += this.layers[j].values[k].y;
                    }
                  }
                  break;
                }
              } catch(e) {
                this.layers[j].values.push({
                  x: x,
                  y: null,
                  y0: null,
                  y_new: null
                });
              }
            }
          }
          ceiling = null;
          for(let j=this.layers.length-1; j>=0; j--) {
            for(let k=0; k<max; k++) {
              try {
                if (this.layers[j].values[k].x === x) {
                  if (this.layers[j].values[k].y < 0) {
                    if (this.layers[j].values[k].y === null) {
                      this.layers[j].values[k].y0 = null;
                    } else {
                      if (ceiling === null) ceiling = 0;
                      this.layers[j].values[k].y0 = -ceiling;
                      ceiling += Math.abs(this.layers[j].values[k].y);
                    }
                  }
                  break;
                }
              } catch(e) {
                this.layers[j].values.push({
                  x: x,
                  y: null,
                  y0: null,
                  y_new: null
                });
              }
            }
          }
        }
      }

      let self = this;
      let isConstructed = this.cb_series.selectAll('.' +this.id)[0].length;
      if (!isConstructed) {
        try {
          this.cb_series.selectAll('.column-layer').remove();
          let p = this.cb_series.selectAll('.column-layer').data(this.layers, function(d, i) {
            if (d.key === self.name) {
              self.count = i;
            }
            return d.key;
          });

          this.columnGroup = p.enter().append('g');
          this.columnGroup.attr('class', 'column-layer')
          .attr('fill', function(d) { return d.color; }).attr('fill-opacity', this.opts.fillopacity);

          this._createRect();

          p.exit().remove();
        } catch(e) {
          // do nothing
        }
        this.setup = true;
      } else {
        this.rubix.runCommand('globalRedraw');
      }

      this.rubix.resetFocus(forced);
    } catch(e) {
      // do nothing
    }
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
      this.rubix.resetAxis(true);
      this.rubix.forceRedraw();
    }
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
        this.data[this.name][i].y0 = null;
        this.data[this.name][i].y_new = null;
        pos = i;
        removed = true;
        break;
      }
    }

    if (!removed) return;

    let found = false;
    for(let i = 0; i < this.column_stack.length; i++) {
      let st = this.column_stack[i];
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
      for(let i = 0; i < this.column_stack.length; i++) {
        this.column_stack[i].values.splice(pos, 1);
      }
    }

    let maxLen = 0;
    for(let i in this.data) {
      let len = this.data[i].length;
      if (len > maxLen) {
        maxLen = len;
      }
    }

    this.rubix.maxLen = maxLen;

    if (noRedraw) return;

    this.rubix.resetAxis();
    this.rubix.forceRedraw();
    this._animate_draw();
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

    added = false;
    for(let i = 0; i < this.column_stack.length; i++) {
      if (this.column_stack[i].key === this.name) {
        added = true;
        break;
      }
    }

    if (this.rubix.opts.interval) {
      if (this.rubix.opts.interval < this.data[this.name].length) {
        this.data[this.name].shift();
      }
    } else {
      if (shift) {
        this.data[this.name].shift();
      }
    }

    let maxLen = 0, columns = [];
    for(let i in this.data) {
      let len = this.data[i].length;
      if (len > maxLen) {
        maxLen = len;
        columns = [];
        for(let k=0; k<maxLen; k++) {
          columns.push(this.data[i][k].x);
        }
      }
    }

    this.rubix.maxLen = maxLen;

    for(let i in this.data) {
      let len = this.data[i].length;
      if (len < maxLen) {
        let dup_columns = columns.concat();
        for(let j=0; j<this.data[i].length; j++) {
          let column_index = dup_columns.indexOf(this.data[i][j].x);
          dup_columns.splice(column_index, 1);
        }
        for(let j=0; j<dup_columns.length; j++) {
          this.rubix.charts[i].addPoint({
            x: dup_columns[j],
            y: null
          });
        }
      }
    }

    if (noRedraw) return;

    this.rubix.resetAxis();
    this.rubix.forceRedraw();
    this._animate_draw();
  };

  _animate_draw() {
    try {
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
    } catch(e) {
      // do nothing
    }
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
    // do nothing
  };

  forceRedraw(rubix) {
    this.redraw(rubix);
  };

  on_complete_draw() {
    if (!this.setup) return;
    let strokecolor = 'white';
    let self = this;
    if (this.opts.marker !== undefined && this.show_markers) {
      this.markers = this.rubix.symbols;

      this.markers.selectAll('.column-symbols').remove();
      let p = this.markers.selectAll('.column-symbols').data(this.layers, function(d) {
        return d.key;
      });

      let symbolGroup = p.enter().append('g');
      symbolGroup.attr('class', 'column-symbols');

      switch (this.opts.marker) {
        case 'circle':
        case 'cross':
        case 'square':
        case 'diamond':
        case 'triangle-up':
        case 'triangle-down':
        let symbolPath = symbolGroup.selectAll('path').data(function(d) {
          for(let i = 0; i < d.values.length; i++) {
            d.values[i].marker = d.marker;
            d.values[i].color = d.color;
          }
          return d.values;
        }).enter().append('path');
        symbolPath
        .attr('d', function(d) {
          let symbol = d3.svg.symbol();
          symbol.type(d.marker);
          return symbol();
        })
        .attr('fill', function(d) {
          return d.color;
        })
        .style('display', function(d) {
          if (self.rubix.column_offset === 'expand') {
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
        .attr('stroke', strokecolor)
        if (this.rubix.opts.invertAxes) {
          symbolPath.attr('transform', function(d, i, j) {
            let val = d.y0 + d.y_new;
            if (isNaN(val)) {
              val = 0;
            }
            let _y = self.rubix.x(val);
            if (self.grouped) {
              _y = self.rubix.x(d.y_new);
            }
            let _x = self.rubix.y(d.x) + self.rubix.y.rangeBand()/2;
            if (self.grouped) {
              _x = (self.rubix.y(d.x) + (self.rubix.y.rangeBand()/self.layers.length) * j) + self.rubix.y.rangeBand()/(2*self.layers.length);
            }
            return 'translate(' +_y+',' +_x+')';
          });
        } else {
          symbolPath.attr('transform', function(d, i, j) {
            let val = d.y0 + d.y_new;
            if (isNaN(val)) {
              val = 0;
            }
            let _y = self.rubix.y(val);
            if (self.grouped) {
              _y = self.rubix.y(d.y_new);
            }
            let _x = self.rubix.x(d.x) + self.rubix.x.rangeBand()/2;
            if (self.grouped) {
              _x = (self.rubix.x(d.x) + (self.rubix.x.rangeBand()/self.layers.length) * j) + self.rubix.x.rangeBand()/(2*self.layers.length);
            }
            return 'translate(' +_x+',' +_y+')';
          });
        }
        p.exit().remove();
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
    let strokecolor = 'white';
    switch (this.opts.marker) {
      case 'circle':
      case 'cross':
      case 'square':
      case 'diamond':
      case 'triangle-up':
      case 'triangle-down':
      let symbol = d3.svg.symbol();
      symbol.type(this.opts.marker);
      this.focus.append('path').attr('d', symbol).attr('fill', this.opts.color).attr('stroke', strokecolor).attr('stroke-width', 2);
      break;
      default:
      throw new Error('Unknown marker type : ' + this.opts.marker);
      break;
    }
  };

  onFocus(dx, dy) {
    if (!this.setup) return;
    this.offFocus();
    if (this.rubix.opts.invertAxes) {
      dy = dy.toString().replace('.', '\\\.');
      let rects = this.cb_series.selectAll('.column-' +dy);
    } else {
      dx = dx.toString().replace('.', '\\\.');
      let rects = this.cb_series.selectAll('.column-' +dx);
    }
    rects.classed('filled', true);
    rects.attr('fill-opacity', 1);
    rects.attr('stroke-width', 2);
  };

  offFocus() {
    if (!this.setup) return;
    let rects = this.cb_series.selectAll('.filled');
    rects.classed('filled', false);
    rects.attr('fill-opacity', 0.85);
    rects.attr('stroke-width', 1);
  };
}
/*eslint-disable */
