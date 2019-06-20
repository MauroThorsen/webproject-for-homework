var http = require('http');
var url = require("url");
http.createServer(function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    var result = "";
    //获取前端代码发来的路由地址
    var pathName = url.parse(req.url).pathname;
    req.addListener("data", (chunk) => {
        result += chunk;
    });
    if(pathName=="/photo"){
        console.lgo(qs.parse(result));
    }
}).listen(4000, (err) => {
    if (!err)
        console.log("服务器启动成功，正在监听port3000...");
});