/*
 * @Author: Yonyou
 * @Date: 2020-01-15 09:20:40
 * @LastEditTime : 2020-01-15 14:45:18
 * @LastEditors  : hanfengmi
 * @Description: 
 */

import '../dist/lib/layui/layui.js';
import '../dist/lib/layui/css/layui.css';
import moment from 'moment';

layui.config({
    dir:'./lib/layui/'
})

console.log('layuilayui',layui)
console.log('moment',moment("20111031", "YYYYMMDD").fromNow())
layui.use('layer',function(){
    var layer  = layui.layer;
    layer.msg('hello');
})
