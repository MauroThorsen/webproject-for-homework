$(function () {
    $("#signUp").click(() => {
        $("#signHead").text("欢迎注册");
        $("#login").text("注册");
    });
    $("#login").click(() => {
        if ($("#user").val().length == 0) {
            return alert("请输入内容!");
        }
        if ($("#password").val().length == 0) {
            return alert("请输入密码!");
        }
        if ($("#login").text() == "登录") {
            $.ajax({
                url: "http://localhost:3000/login",
                type: "POST",
                data: {
                    username: $("#user").val(),
                    password: $("#password").val()
                },
                success: function (res) {
                    if (res == "0") {
                        $("#signHead").text("管理员 " + $("#user").val() + "登陆成功，请稍后");
                        setTimeout(function (res) {
                            location.href = "search.html?uid=0";
                        }, 1500);
                    }
                    else if (res == "1") {
                        $("#signHead").text("用户 " + $("#user").val() + "登陆成功，请稍后");
                        setTimeout(function (res) {
                            location.href = "search.html?uid=1";
                        }, 1500);
                    }
                    else $("#signHead").text(res);
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }
        else if ($("#login").text() == "注册") {
            $.ajax({
                url: "http://localhost:3000/signUp",
                type: "POST",
                data: {
                    username: $("#user").val(),
                    password: $("#password").val()
                },
                success: function (res) {
                    if (res != 0) {
                        $("#signHead").text(res);
                        setTimeout(function (res) {
                            location.reload();
                        }, 2000);
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }
    });
});
$(() => {
    $("#preview").click(() => {
        $.ajax({

        })
    })
})