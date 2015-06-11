'use strict';

var $ = require('jquery'),
    Pagination = require('../lib/pagination');

var Grid = function(options) {

    /*
     *  options
     * */
    this.options = options;
    this.options.container = $(this.options.container);
    var pag;


    /*
     *  初始化
     * */
    this.init = function() {
        // 生成头部
        this._renderHeader(this.options.container, this.options.columns);

        // 绑定事件
        this._bindEvents(this.options.events);

        // 生成分页
        this._createPagination();
    }


    /*
     *  返回某一行数据
     *  index: 行数(requied)
     * */
    this.getRow = function(index) {
        return this.datalist[index];
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
     *  data_list: 列表数据内容(array);
     * */
    this.render = function(data_list) {
        this.datalist = data_list;
        var columns = this.options.columns,
            str = '',
            $Body = this.options.container.find('.J-gridbody');
        for (var i = 0, len = data_list.length; i < len; i ++) {
            str += this._renderRow(data_list[i], columns, i);
        }
        $Body.html(str);
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
            params += 'limit=' + limit + '&offset=' + offset;
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
        $node.html(str.join(''));;
    }


    /*
     *  renderRow
     * */
    this._renderRow = function(data_tr, columns, index) {
        var content,
            self = this,
            str = ['<tr>'];
        $.each(columns, function(i, column) {
            str.push('<td ', column.class && ('class="' + column.class + '"'), '>');
            content = data_tr[column.name] !== undefined ? data_tr[column.name] : '';
            if (column.renderer) {
                content = self._renderer(content, data_tr, index, column.renderer);
            }
            str.push(content);
            str.push('</td>');
        });
        str.push('</tr>');
        return str.join('');
    }


    /*
     *  renderer
     *  content: 本格数据
     *  renderer: 渲染方法
     * */
    this._renderer = function(content, rowData, index, renderer) {
        var result = [];
        if ($.isFunction(renderer)) {
            content = renderer(content, rowData, index);
            if (!$.isArray(content)) {
                return content;
            } else {
                renderer = content;
            }
        }

        var type, className;
        content = [];
        $.each(renderer, function(index, item) {
            type = item.type || {};
            className = item.class ? item.class : '';
            switch (type) {
                case 'text': {
                    content.push(item.name); // TODO: 如果需要给这段文字设置样式, 需要外围嵌套一个tag
                    break;
                }
                case 'input': {
                    content.push('<input type="text" class="', className, '" />');
                    break;
                }
                case 'button': {
                    content.push('<button class="btn btn-default btn-sm ', className, '">', item.name, '</button>');
                    break;
                }
                case 'a': {
                    content.push('<a type="button" href="', item.url, '" target="_blank" class="btn btn-default btn-sm ', className, '">', item.name, '</a>');
                    break;
                }
                case 'html': {
                    content.push(item.name);
                    break;
                }
            }
        });
        return content.join('');
    }


    this.init();
}

window.Grid = Grid;
