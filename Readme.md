@mtfe/grid

组件化使用直接require('@mtfe/grid');
非组件化script标签使用./dist/grid.min.js

相关wiki:http://wiki.sankuai.com/pages/viewpage.action?pageId=221681737


一共暴露5个方法,用户需要自己定义renderer的内容

* grid.render()

请将需要处理的数据数组传回。

* grid.getRow(index)

请传回行序号，将会返回所在行的所有数据

* grid.update()

更新，如果没有传入参数，将会使用之前一个请求或者默认的参数，也可以传入params和offset

* grid.on('ajaxSuccess')

暴露监听事件，在ajax成功的时候触发

* grid.on('ajaxFailed')

5XX的情况下触发


 * @example
    // 配置项
    // 主要项目:
    // container\query\pagination\columns
    var gridOptions = {

        // 目标容器（string，required）
        'container': '#list',

        // ajax url（required）需要代理的情况下要配置代理的地址和处理方式
        'query': {
            proxy: {
                url: PROXY_URL + "?source=",
                handle: encodeURIComponent
            },
            url: HOST_URL + '/mbox/admin/zjb/cinema.json',
            params: 'match=0',
        },

        // 分页配置（非必须，每页加载数量、页码（从0开始计）、目标容器）
        'pagination': {
            limit: 200,
            offset: 0,
            target: '#pagination'
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
