var http = require("http");
var url = require("url");
var fs = require('fs');
var qs = require("querystring");
var mysql = require('mysql');
var Str = require('./models/str');
const iconv = require('iconv-lite');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'web'
});
connection.connect();


http.createServer(function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    var result = "";
    //获取前端代码发来的路由地址
    var pathName = url.parse(req.url).pathname;
    req.addListener("data", (chunk) => {
        result += chunk;
    });
    console.log(pathName);
    switch (pathName) {
        case "/login":
            req.on("end", function () {
                var user = qs.parse(result);
                var sql = "SELECT uname,password,type FROM user WHERE uname='" + user.username + "' AND password='" + user.password + "'";
                connection.query(sql, function (err, out) {
                    if (err) {
                        console.error('[SELECT ERROR] - ', err.message);
                        res.end("用户名或密码错误,请重试");
                        return;
                    }
                    if (out[0] == undefined) {
                        res.end("用户名或密码错误");
                        return;
                    }
                    if (out[0].type == 0)
                        res.end("0");
                    else res.end("1");
                });
            });
            break;
        case "/signUp":
            req.on("end", () => {
                var user = qs.parse(result);
                var uid;
                var getuid = "SELECT uid FROM user";
                connection.query(getuid, (err, out) => {
                    if (err)
                        console.error('[SELECT ERROR] - ', err.message);
                    else uid = out[out.length - 1].uid + 1;
                    let sql = "INSERT INTO user(uid,uname,password,type) VALUES(" + uid + ",'" + user.username + "','" + user.password + "',0)";
                    connection.query(sql);
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(user.username + "，注册成功，待页面刷新之后重新登录");
                });
            });
            break;
        case "/insertGym":
            req.on("end", () => {
                var user = qs.parse(result);
                console.log(user);
                var gid;
                var getgid = "SELECT gid FROM gym";
                connection.query(getgid, (err, out) => {
                    console.log(out);
                    if (err)
                        console.error('[SELECT ERROR] - ', err.message);
                    else gid = out[out.length - 1].gid + 1;
                    let sql = "INSERT INTO gym(gid,gname,address,temp,open,close,price,sum,summary,type,howtogo) VALUES(" + gid + ",'" + user.gname + "','" + user.address + "',23,'09:00:00','23:00:00'," + user.price + "," + user.sum + ",'" + user.summary + "','" + user.type + "','左转一百米再转一百米再转再转')";
                    connection.query(sql, (err) => {
                        if (err)
                            console.log(err);
                    });
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(gid.toString());
                });
            });
            break;
        case "/delGym":
            var search = url.parse(req.url).search;
            console.log(search);
            var gid = search.slice(search.indexOf("?") + 5, search.indexOf("?") + 6);
            var sql = "DELETE FROM gym WHERE gid =" + gid;
            console.log(sql);
            connection.query(sql, (err) => {
                if (!err)
                    console.log(err);
            });
            res.end("ok");
            break;
        case "/search-list":
            res.writeHead(200, { "Content-Type": "application/json" });
            var user = qs.parse(result);
            var json;
            var sql = "SELECT pic,gname,summary,gid FROM gym";
            connection.query(sql, (err, out) => {
                json = JSON.stringify({
                    pic1: out[0].pic,
                    pic2: out[1].pic,
                    pic3: out[2].pic,
                    H1: out[0].gname,
                    H2: out[1].gname,
                    H3: out[2].gname,
                    int1: out[0].summary,
                    int2: out[1].summary,
                    int3: out[2].summary,
                    gid1: out[0].gid,
                    gid2: out[1].gid,
                    gid3: out[2].gid
                });
                res.end("success_jsonpCallback(" + json + ")");
            });
            break;
        case "/search":
            res.writeHead(200, { "Content-Type": "application/json" });
            var search = url.parse(req.url).search;
            var str = decodeURIComponent(search);
            var type = str.slice(6, str.indexOf("&"));
            var keyword = str.slice(str.indexOf("&") + 1, Str.find(str, '&', 1));
            console.log(type, keyword);
            switch (type) {
                case "price":
                    var json;
                    var sql = "SELECT price,gid,close,open,summary,address,gname,type FROM gym WHERE price<=" + keyword;
                    connection.query(sql, (err, out) => {
                        var obj = {};
                        for (let i = 0; i < out.length; i++) {
                            obj["gid" + i] = out[i].gid;
                            obj["gname" + i] = out[i].gname;
                            obj["price" + i] = out[i].price;
                            obj["close" + i] = out[i].close;
                            obj["type" + i] = out[i].type;
                            obj["open" + i] = out[i].open;
                            obj["summary" + i] = out[i].summary;
                            obj["address" + i] = out[i].address;
                        }
                        obj.num = out.length;
                        json = JSON.stringify(obj);
                        res.end("success_jsonpCallback(" + json + ")");
                    });
                    break;
                case "type":
                    str = keyword.split("").join("%");
                    str = "%" + str + "%";
                    var json;
                    var sql = "SELECT price,gid,close,open,summary,address,gname,type FROM gym WHERE type LIKE '" + str + "'";
                    connection.query(sql, (err, out) => {
                        if (err)
                            console.log(err);
                        var obj = {};
                        for (let i = 0; i < out.length; i++) {
                            obj["gid" + i] = out[i].gid;
                            obj["gname" + i] = out[i].gname;
                            obj["price" + i] = out[i].price;
                            obj["close" + i] = out[i].close;
                            obj["type" + i] = out[i].type;
                            obj["open" + i] = out[i].open;
                            obj["summary" + i] = out[i].summary;
                            obj["address" + i] = out[i].address;
                        }
                        obj.num = out.length;
                        json = JSON.stringify(obj);
                        res.end("success_jsonpCallback(" + json + ")");
                    });
                    str = "";
                    break;
                case "place":
                    str = keyword.split("").join("%");
                    str = "%" + str + "%";
                    console.log(str);
                    var json;
                    var sql = "SELECT price,gid,close,open,summary,address,gname,type,address FROM gym WHERE address LIKE ‘" + str + "'";
                    connection.query(sql, (err, out) => {
                        if (err)
                            console.log(err);
                        var obj = {};
                        for (let i = 0; i < out.length; i++) {
                            obj["gid" + i] = out[i].gid;
                            obj["gname" + i] = out[i].gname;
                            obj["price" + i] = out[i].price;
                            obj["close" + i] = out[i].close;
                            obj["type" + i] = out[i].type;
                            obj["open" + i] = out[i].open;
                            obj["summary" + i] = out[i].summary;
                            obj["address" + i] = out[i].address;
                        }
                        obj.num = out.length;
                        json = JSON.stringify(obj);
                        res.end("success_jsonpCallback(" + json + ")");
                    });
                    str = "";
                    break;
                case "name":
                    str = keyword.split("").join("%");
                    str = "%" + str + "%";
                    var json;
                    var sql = "SELECT price,gid,close,open,summary,address,gname,type FROM gym WHERE gname LIKE '" + str + "'";
                    connection.query(sql, (err, out) => {
                        if (err)
                            console.log(err);
                        var obj = {};
                        for (let i = 0; i < out.length; i++) {
                            obj["gid" + i] = out[i].gid;
                            obj["gname" + i] = out[i].gname;
                            obj["price" + i] = out[i].price;
                            obj["close" + i] = out[i].close;
                            obj["type" + i] = out[i].type;
                            obj["open" + i] = out[i].open;
                            obj["summary" + i] = out[i].summary;
                            obj["address" + i] = out[i].address;
                        }
                        obj.num = out.length;
                        json = JSON.stringify(obj);
                        res.end("success_jsonpCallback(" + json + ")");
                    });
                    str = "";
                    break;
            }
            break;
        case "/gym-list":
            var search = url.parse(req.url).search;
            var gid = search.slice(4, search.indexOf("&"));
            res.writeHead(200, { "Content-Type": "application/json" });
            var json;
            var sql = "SELECT pic,gname,summary,address,open,close,sum,price,temp,type,howtogo FROM gym WHERE gid=" + gid;
            connection.query(sql, (err, out) => {
                var rand = "SELECT pic,gname,summary,gid FROM gym WHERE gid in(1 , 2, 3)";
                connection.query(rand, (err, out1) => {
                    var order = "SELECT cid,time,price FROM cell WHERE gid=" + gid + " AND status=1";
                    connection.query(order, (err, out2) => {
                        var obj = {};
                        obj.pic1 = out1[0].pic;
                        obj.pic2 = out1[1].pic;
                        obj.H1 = out1[0].gname;
                        obj.H2 = out1[1].gname;
                        obj.int1 = out1[0].summary;
                        obj.int2 = out1[1].summary;
                        obj.gid1 = out1[0].gid;
                        obj.gid2 = out1[1].gid;
                        obj.pic = out[0].pic;
                        obj.gname = out[0].gname;
                        obj.address = out[0].address;
                        obj.summary = out[0].summary;
                        obj.open = out[0].open;
                        obj.close = out[0].close;
                        obj.price = out[0].price;
                        obj.temp = out[0].temp;
                        obj.type = out[0].type;
                        obj.howtogo = out[0].howtogo;
                        obj.type = out[0].type;
                        obj.sum = out[0].sum;
                        for (let i = 0; i < out2.length; i++) {
                            obj["cid" + i] = out2[i].cid;
                            obj["price" + i] = out2[i].price;
                            obj["time" + i] = out2[i].time;
                        }
                        obj.num = out2.length;
                        json = JSON.stringify(obj);
                        console.log(json);
                        res.end("success_jsonpCallback(" + json + ")");
                    })
                })
            });
            break;
        case "/orderin":
            var search = url.parse(req.url).search;
            console.log(search);
            var gid = search.slice(search.indexOf("?") + 5, search.indexOf("&"));
            var cid = search.slice(search.indexOf("&") + 5, Str.find(search, "&", 1));
            var uid = search.slice(Str.find(search, "&", 1) + 5)+1;
            var order = "INSERT INTO record(cid,uid,time,status) VALUES(" + cid + "," + uid + ",'01:00:00',1)";
            var row;
            connection.query("SELECT * FROM cell", (err, out) => {
                if (!err)
                    console.log(err);
                row = out.length;
                var sql = "UPDATE cell SET status=0,deadline='2020-01-01 00:00:00',uid="+uid+" WHERE gid="+gid+" AND cid="+cid;
                connection.query(order);
                connection.query(sql);
                res.end("success");
            })

            console.log(gid, cid, uid);
            break;

        case "/getdata":
            var sql = "SELECT * from gym";
            connection.query(sql, (err, out) => {
                var s = {};
                var json;
                for (let i = 0; i < out.length; i++) {
                    s["gid" + i] = out[i].gid;
                    s["gname" + i] = out[i].gname;
                    s["place" + i] = out[i].address;
                    s["price" + i] = out[i].price;
                }
                s.num = out.length;
                json = JSON.stringify(s);
                res.end("success_jsonpCallback(" + json + ")");
            })

    }
}).listen(3000, (err) => {
    if (!err)
        console.log("服务器启动成功，正在监听port3000...");
});


