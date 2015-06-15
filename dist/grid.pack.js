(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Grid = function(options) {

    /**
     *  [options 初始化]
     */
    this.options = options;
    this.options.container = $(this.options.container);
    this.dataList = {};
    var pag;


    /**
     *  [init 初始化]
     */
    this.init = function() {
        // 生成头部
        this._renderHeader(this.options.container, this.options.columns);

        // 绑定事件
        this._bindEvents(this.options.events);

        // 生成分页
        this._createPagination();
    }


    /**
     *  [getRow 获取某行数据]
     *  @param  {[number]} index [行序号]
     *  @return {[object]}      [对应行数据]
     */
    this.getRow = function(index) {
        return this.dataList[index];
    }


    /*
     *  更新方法
     *  params: 更新的搜索条件,string（非必须）
     *  offset: 更新的查询页码,number（非必须）
     * */
    this.update = function(params, offset){
        var params = this._setParams(params, offset);
        this._sendAjax(params);
    }


    /*
     *  trigger对应的方法
     *  functionName: 方法名（required）
     *  callBack: 回调函数（required）
     * */
    this.on = function(functionName, callBack) {
        this.options.container.on(functionName, callBack);
    }


    /*
     *  render
     *  列表内容生成方法
     *  dataList: 列表数据内容(array);
     * */
    this.render = function(dataList) {
        var self = this,
            columns = this.options.columns,
            $Body = this.options.container.find('.J-gridbody');
        $Body.html('');
        for (var i = 0, len = dataList.length; i < len; i ++) {
            $Body.append(this._renderRow(dataList[i], columns, i));
            self.dataList[i] = dataList[i];
        }
    }


    /*
     *  生成分页
     * */
    this._createPagination = function(){
        var that = this;
        if (this.options.pagination) {
            pag = new Pagination(this.options.pagination.target, this.options.pagination.offset);
            pag.on('pageChange', function(e, message) {
                that.update(that.options.query.params, message);
            });
        }
    }


    /*
     *  更新分页
     * */
    this._updatePagination = function(state) {
        if (this.options.pagination) {
            var offset = this.options.pagination.current;
            this.options.pagination.offset = offset;
            pag.update(state, offset);
        }
    }


    /*
     *  处理ajax请求参数
     *  params: 请求的参数(不包括offset和limit)(string)
     *  offset: 页码(number)
     * */
    this._setParams = function(params, offset) {
        // 没有重设params参数就使用当前grid的params
        params = (params !== undefined) ? params : this.options.query.params;
        this.options.query.params = params;
        if (this.options.pagination) {
            var limit = this.options.pagination.limit;
            offset = (offset !== undefined) ? offset : this.options.pagination.offset;
            params = params ? (params + '&') : '';
            params += 'limit=' + limit + '&offset=' + (offset * limit);
            this.options.pagination.current = offset;
        }
        if (params !== undefined && params !== '') {
            params = '?' + params;
        }
        return params;
    }


    /*
     *  发送ajax
     *  params: 请求的参数(包括所有条件)
     * */
    this._sendAjax = function(params) {
        var that = this,
            url;
        if (this.options.query.proxy !== undefined) {
            url = this.options.query.proxy.url + this.options.query.proxy.handle(this.options.query.url + params);
        } else {
            url = this.options.query.url + params;
        }
        $.ajax
        ({
            url: url,
            type: "get",
            dataType: "json",
            async: false,
            success: function(data) {
                that.options.container.trigger('ajaxSuccess', data);
                that._updatePagination(true);
            },
            error: function() {
                that.options.container.trigger('ajaxFailed', {'message': 'failed'});
                that._updatePagination(false);
            }
        });
    }


    /*
     *  绑定复杂事件
     *  events:事件列表
     * */
    this._bindEvents = function(events) {
        if (!events) {
            return;
        }
        for (var i = 0, len = events.length; i < len; i ++) {
            this.options.container.on(events[i]['eventName'], events[i]['selectName'], events[i]['callBack']);
        }
    }


    /*
     *  renderHeader
     * */
    this._renderHeader = function($node, columns) {
        var str = ['<thead><tr class="info">'];
        for (var i = 0, len = columns.length; i < len; i ++) {
            str.push('<th>', columns[i]['label'], '</th>');
        }
        str.push('</tr></thead><tbody class="J-gridbody"></tbody>');
        $node.html(str.join(''));
    }


    /*
     *  renderRow
     * */
    this._renderRow = function(dataRow, columns, index) {
        var self = this,
            tr = $('<tr></tr>').attr('data-index', index);
        $.each(columns, function(i, column) {
            var td = $('<td></td>');
            td.addClass(column.class);
            // str.push('<td ', column.class && ('class="' + column.class + '"'), '>');
            var value = dataRow[column.name] !== undefined ? dataRow[column.name]: '';
            if (column.renderer) {
                value = self._renderer(value, dataRow, index, column.renderer);
            }
            td.append(value);
            tr.append(td);
        });
        return tr;
    }

    this.insertRow = function(dataRow) {
        dataRow = dataRow || {};
        var columns = this.options.columns;
        var container = this.options.container;
        var maxIndex = container.children('.J-gridbody').find('tr').last().attr('data-index') || -1;
        var index = parseInt(maxIndex) + 1;
        var tr = this._renderRow(dataRow, columns, index);
        container.children('.J-gridbody').append(tr);
        this.dataList[maxIndex] = dataRow;
    };

    this.deleteRow = function(index) {
        if (!$.isNumeric(index)) {
            return;
        }
        var container = this.options.container;
        container.children('.J-gridbody').children('tr[data-index=' + index + ']').remove();
        delete this.dataList[index];
    };

    this.getData = function() {
        var result = [];
        $.each(this.dataList, function(record) {
            result.push(record);
        });
        return result;
    };

    /*
     *  renderer
     *  content: 本格数据
     *  renderer: 渲染方法
     * */
    this._renderer = function(content, rowData, index, renderer) {
        var result = [];
        if (Object.prototype.toString.call(renderer) === '[object String]') {
            return $(content);
        }
        if ($.isFunction(renderer)) {
            renderer = renderer.call(this, content, rowData, index);
        }

        if ($.isArray(renderer)) {
            var type, className;
            result = [];
            $.each(renderer, function(index, item) {
                item = item || {};
                type = item.type;
                className = item.class ? item.class : '';
                switch (type) {
                    case 'text': {
                        result.push($('<span>' + item.name + '</span>').addClass(className));
                        break;
                    }
                    case 'input': {
                        var input = $('<input type="text"/>');
                        input.addClass(className);
                        input.val(item.value);
                        result.push(input);
                        // result.push('<input type="text" class="', className, '" value="', item.value, '"/>');
                        break;
                    }
                    case 'button': {
                        var button = $('<button></button>');
                        button.addClass('btn btn-default btn-sm');
                        button.addClass(className);
                        button.text(item.name);
                        result.push(button);
                        // result.push('<button class="btn btn-default btn-sm ', className, '">', item.name, '</button>');
                        break;
                    }
                    case 'a': {
                        var anchor = $('<a></a>');
                        anchor.attr('href', item.url);
                        anchor.attr('target', item.target || '_blank');
                        anchor.addClass('btn btn-default btn-sm');
                        anchor.addClass(className);
                        anchor.html(item.name);
                        result.push(anchor);
                        // result.push('<a type="button" href="', item.url, '" target="_blank" class="btn btn-default btn-sm ', className, '">', item.name, '</a>');
                        break;
                    }
                    case 'html': {
                        result.push($(item.html));
                        break;
                    }
                    default: {
                        result.push(item);
                    }
                }
            });
            return result;
        } else {
            return renderer;
        }
    }


    this.init();
}

window.Grid = Grid;

},{}]},{},[1]);
