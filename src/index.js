/*
 * @Author: Yonyou
 * @Date: 2020-01-15 14:59:40
 * @LastEditTime : 2020-01-17 15:50:50
 * @LastEditors  : hanfengmi
 * @Description: 入口文件
 */
import '../dist/lib/layui/layui.js';
import '../dist/lib/layui/css/layui.css';
import './css/global.css';
import ClassChat from './js/chatClient'
// import moment from 'moment';
import { 
    initPopDialog,// 初始化客服图标
    hidePopDialog// 隐藏图标
 } from './js/popDialog.js'

window.initPop = (app_key, baseInfo, winConfig, defWindow=true)=>{
    window.IAppKey = app_key;
    window.IBaseInfo = baseInfo;
    window.app_key = app_key;
    window.baseInfo = baseInfo;

    window.intset = '1';// 1是嵌入到其他页面中
    window.IbasewindowOff = true; // 其他平台引用？？？
    
    initPopDialog(defWindow);

    ClassChat.init();
}

window.hidePopDialog = hidePopDialog(); // 隐藏或者退出登录删除页面元素

initPop(
    "CFCAEB07EA91D18B3E55D4C72684DE729D6EEE8A6517BD2049776D0E457CDC212448DCC94E4015978E9F6D7B4764454C9C548261A42FCB2D",
    {
        "userId":"956c73dc-c44e-4a49-94a8-34615d276c37",
        "tantentId":"h16bhlkq",
        "serviceNum":"XTXIANGMU"
    },
    "", // 默认图标的自定义样式
    true
)


