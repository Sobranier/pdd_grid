@mtfe/grid

##Remind

* 组件化使用直接require('@mtfe/grid');
* 非组件化script标签使用./dist/grid.min.js
* 相关 [wiki](http://wiki.sankuai.com/pages/viewpage.action?pageId=221681737)
* 相关 [git仓库](http://git.sankuai.com/projects/MYFE/repos/mtfe_grid/browse)

##方法

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

##关于自定义renderer

存才三种使用方式，请注意renderer仅仅产生dom，不会绑定事件，绑定事件需要在events当中自定义

* renderer对数据进行处理，直接传回内容

```
function abcRenderer(content, rowdata, index) {
	...
	return something;	//something可能是一个字符串，在renderer中是可以直接获取到本行数据以及行序号的
}
```
* renderer返回特定格式的内容，目前我们允许设定button、a（标签）、input（输入框）、text（文字）

```
[
	{type: 'html', name: '<h3>输入一段话</h3>'},	//将会生成一段文本内容
	{type: 'button', name:'匹配', class:'J-grid_match'},	//将会生成类名为“J-grid_match”，内容为“匹配”的按钮
	{type: 'a', name: '链接', class:'a-link', url: 'http://www.meituan.com'},	//将会生成类名为“a-link”，内容为“链接”,url内容设定为url，的链接
	{type:'input', class: 'form-control'}	//将会生成一个类名“form-control”的input输入框
]

```
* renderer函数可以返回处理过的数组，格式如上方

```
function abcRenderer(content, rowdata, index) {
	...
	return [
		...
	]
}
```


##demo

```
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
```


## 开发

1、主文件是lib/grid.js，为了非模块化打包，复制至dist/grid.js，并且修改

```
module.exports = Grid;
```

为

```
window.Grid = Grid;
```

以及修改require pagination路径

2、在dist文件下运行（实现需要安装browerify）

```
browserify grid.js > grid.pack.js
```

3、在dist文件下运行（实现需要安装uglifyjs）

```
uglifyjs grid.pack.js > grid.min.js
```
