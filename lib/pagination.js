'use strict';
var $ = require('jquery');

var Pagination = function($node, offset) {
    this.current = this.offset = offset;
    this.isActive = false;

    /*
     *  初始化
     * */
    this.init = function() {
        var p_str = '<li class="disabled"><a href="#" class="J-page J-prev" data-page="-1"><span>&larr;</span></a></li>'
                   +'<li><a>第<span class="pagination_current">' + (this.offset + 1) + '</span>页</a></li>'
                   +'<li><a href="#" class="J-page" data-page="1"><span>&rarr;</span></a></li>'
                   +'<li><input type="text" name="page_jump"/></li>'
                   +'<li><button class="btn btn-primary btn-sm J-page">跳转</button></li>';
        $node.html(p_str);
        this._bindEvent();
    }


    /*
     *  事件绑定
     * */
    this._bindEvent = function() {
        var that = this;

        $node.on('click', '.J-page', function(e) {
            //e.preventDefault();
            if ($(this).parent().hasClass('disabled') || that.isActive) {
                return;
            }
            if ($(this).data('page')) {
                that.current = that.offset + $(this).data('page');
                that._pageRender();
            } else {
                var page = $node.find('input[name=page_jump]').val();
                checkInput(page);
            }
        });

        $node.on('keydown', 'input[name=page_jump]', function(e) {
            if (e.keyCode === 13 && !that.isActive) {
                var page = $(this).val();
                checkInput(page);
            }
        });

        // 输入验证
        function checkInput(page) {
            if (!page || !/^\d+$/.test(page)) {
                alert('输入正整数');
                return;
            }
            that.current = parseInt(page) < 1 ? 0 : parseInt(page) - 1;       
            that._pageRender();
        }
    }


    /*
     *  对外输出
     * */
    this._pageRender = function() {
        this.isActive = true;
        $node.trigger('pageChange', this.current);
    }

    this.on = function(functionName, callBack) {
        $node.on(functionName, callBack);
    }

    /*
     *  分页更新
     *  state:是否更新, true则更新，false不更新;
     *  newset:新的页码
     * */
    this.update = function(state, newset) {
        this.isActive = false;
        if (state) {
            this.offset = this.current = newset;
            if (this.offset !== 0) {
                $node.find('.J-prev').parent().removeClass('disabled');
            } else {
                $node.find('.J-prev').parent().addClass('disabled');
            }
            $node.find('.pagination_current').html(this.offset + 1);
        }
    }

    this.init();
}

module.exports = Pagination;
