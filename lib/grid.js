'use strict';

/*
 * @example
    // 配置项
    var gridOptions = {

        // 目标容器（string，required）
        'container': '#list',

        // ajax url（required）
        'url': HOST_URL + '/mbox/admin/zjb/cinema.json',

        // 默认参数（非必须）
        'params': 'match=0',

        // 分页配置（非必须，每页加载数量、页码（从0开始计）、目标容器）
        'pagination': {
            limit: 200,
            offset: 0,
            target: $('#pagination')
        },

        // 表格列配置（required）
        'columns': [
            {label:'影院编码', name:'code'},
            {label:'影院名称', name:'name', class:'col-red'},
            {label:'发现日期', name:'createTime', renderer:timeFormatRenderer},
            {label:'匹配日期', name:'matchTime', renderer:timeFormatRenderer},
            {label:'操作', renderer: [
                {type:'button', name:'匹配', class:'J-grid_match'},
            ]},
        ],

        // 自定义绑定时间(非必须，事件名、绑定目标、回调函数)
        'events': [
            {
                eventName: 'click',
                selectName: '.J-grid_match',
                callBack: cinemaMatch
            }
        ]
    };

    // 注册grid
    grid = new Grid(gridOptions);   


    //  为grid的ajax事件绑定处理方式,因为不同情况下数据格式不同
    grid.on('ajaxSuccess', function(e, data) {
        if (!data.data && data.error) {
            toastr.error(data.error.message);
        } else {
            grid.render(data.data);
        }
    });
    grid.on('ajaxFailed', function(e, message) {
        toastr.error(message.message);
    });

    // 触发生成表格，update没有参数，缺省则使用当前设定，也可以传入params和offset
    grid.update();


    // 自定义内容处理函数
    function timeFormatRenderer(content) {
        if (content) {
            content = new Date(content);
            content = content.getFullYear() + '-' + (content.getMonth() < 9 ? '0' : '')+ (content.getMonth() + 1) + '-' + (content.getDate() < 10 ? '0' : '') + content.getDate();
        }
        return content;
    }
    // 自定义绑定功能函数
    function cinemaMatch() {
        var data = grid.getRow($(this).parents('tr').index()),
        ...
    }
*/

var $ = require('jquery'),
    Pagination = require('./pagination');

var Grid = function(options) {

    /*
     *  options
     * */
    this['options'] = options;
    this['options']['container'] = $(this['options']['container']);
    var pag;


    /*
     *  初始化
     * */
    this.init = function() {
        // 生成头部
        this._renderHeader(this['options']['container'], this['options']['columns']);

        // 绑定事件
        this._bindEvents(this['options']['events']);

        // 生成分页
        this._createPagination();
    }


    /*
     *  返回某一行数据
     *  index: 行数(requied)
     * */
    this.getRow = function(index) {
        return this['datalist'][index];
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
        this['options']['container'].on(functionName, callBack);
    }


    /*
     *  render
     *  列表内容生成方法
     *  data_list: 列表数据内容(array);
     * */
    this.render = function(data_list) {
        this.datalist = data_list;
        var columns = this['options']['columns'],
            str = '',
            $Body = this['options']['container'].find('.J-gridbody');
        for (var i = 0, len = data_list.length; i < len; i ++) {
            str += this._renderColumn(data_list[i], columns);
        }
        $Body.html(str);
    }


    /*
     *  生成分页
     * */
    this._createPagination = function(){
        var that = this;
        if (this['options']['pagination']) {
            pag = new Pagination(this['options']['pagination']['target'], this['options']['pagination']['offset']);
            pag.on('pageChange', function(e, message) {
                that.update(that['options']['params'], message);
            });
        }   
    }


    /*
     *  更新分页
     * */
    this._updatePagination = function(state) {
        if (this['options']['pagination']) {
            var offset = this['options']['pagination']['current'];
            this['options']['pagination']['offset'] = offset;
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
        params = (params !== undefined) ? params : this['options']['params'];
        this['options']['params'] = params;
        if (this['options']['pagination']) {
            var limit = this['options']['pagination']['limit'];
            offset = (offset !== undefined) ? offset : this['options']['pagination']['offset'];
            params = params ? (params + '&') : '';
            params += 'limit=' + limit + '&offset=' + offset;
            this['options']['pagination']['current'] = offset;
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
        var that = this;
        $.ajax
        ({
            url: PROXY_URL + "?source=" + encodeURIComponent(this['options']['url'] + params),
            type: "get",
            dataType: "json",
            async: false,
            success: function(data) {
                that['options']['container'].trigger('ajaxSuccess', data);
                that._updatePagination(true);
            },
            error: function() {
                that['options']['container'].trigger('ajaxFailed', {'message': 'failed'});
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
            this['options']['container'].on(events[i]['eventName'], events[i]['selectName'], events[i]['callBack']);
        }
    }


    /*
     *  renderHeader
     * */
    this._renderHeader = function($node, columns) {
        var str = '<thead><tr class="info">';
        for (var i = 0, len = columns.length; i < len; i ++) {
            str += '<th>' + columns[i]['label'] + '</th>';
        }
        str += '</tr></thead><tbody class="J-gridbody"></tbody>';
        $node.html(str);;
    }


    /*
     *  renderColumn
     * */
    this._renderColumn = function(data_tr, columns) {
        var content,
            str = '<tr>';
        for (var i = 0, len = columns.length; i < len; i ++) {
            str += '<td ' + (columns[i]['class'] ? ('class="' + columns[i]['class'] + '"') : '') + '>';
            content = data_tr[columns[i]['name']] !== undefined ? data_tr[columns[i]['name']] : '';
            if (columns[i]['renderer']) {
                content = this._renderer(content, columns[i]['renderer']);
            }
            str += content;
            str += '</td>';
        }
        str += '</tr>';
        return str;
    }


    /*
     *  renderer
     *  content: 本格数据,renderer: 渲染方法
     * */
    this._renderer = function(content, renderer) {
        if ($.isFunction(renderer)) {
            content = renderer(content);
        } else {
            var type, className;
            for (var i = 0, len = renderer.length; i < len; i ++) {
                type = renderer[i]['type'];
                className = renderer[i]['class'] ? renderer[i]['class'] : '';
                switch (type) {
                    case 'text':
                        content += renderer[i]['name'];
                        break;
                    case 'input':
                        content += '<input type="text" class="' + className + '" />';
                        break;
                    case 'button':
                        content += '<button class="btn btn-default btn-sm ' + className + '">' + renderer[i]['name'] + '</button>';
                        break;
                    case 'a':
                        content += '<a type="button" href="' + renderer[i]['url'] + '" target="_blank" class="btn btn-default btn-sm ' + className + '">' + renderer[i]['name'] + '</a>';
                        break;
                }
            }
        }
        return content;
    }


    this.init();
}

module.exports = Grid;
