/*
 * @Author: Yonyou
 * @Date: 2020-01-16 14:24:21
 * @LastEditTime : 2020-01-17 10:06:36
 * @LastEditors  : hanfengmi
 * @Description: 功能函数
 */

/**
 *@MethodAuthor:  Han Fengmi
 *@Date: 2020-01-16 14:41:17
 *@Description: 检查浏览器是否支持websocket
 *@param 
 *@returns
*/
export function checkWebSocket(){
    if (typeof (WebSocket) !== "function" || typeof WebSocket == 'undefined') {
        layer.msg('您的浏览器不支持 Web Sockets 通信协议 请升级到现代浏览器', {
            time: 60000,
            success: function () {
                setTimeout(function () {
                    closeWebPage();
                }, 60000)
            }
        });
        return false;
    }
}

/**
 *@MethodAuthor:  Han Fengmi
 *@Date: 2020-01-16 14:41:41
 *@Description: 获取浏览器cookie
 *@param cookie属性名
 *@returns
*/
export function getCookie (name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
        return unescape(arr[2]);
    } else {
        return null;
    }
}

/**
 *@MethodAuthor:  Han Fengmi
 *@Date: 2020-01-17 10:05:21
 *@Description: 自动补全http
 *@param url地址
 *@returns
*/
export function addDomain(url, defineUrl) {
    if(url.substr(0,7).toLowerCase() == "http://" || url.substr(0,8).toLowerCase() == "https://"){
         return url;
    }else{
         return defineUrl + url;
    }
}
