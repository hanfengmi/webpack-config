/*
 * @Author: Yonyou
 * @Date: 2020-01-17 15:16:10
 * @LastEditTime : 2020-01-18 09:50:37
 * @LastEditors  : hanfengmi
 * @Description: 
 */
import ClassChat from '../chatClient';

const Chatlog = {
    addChatRecord(content,type) {
        var addData = {
            fromavator:layui.layim.cache().friend[0].list[0].avatar,
            fromuserid:layui.layim.cache().friend[0].list[0].id,
            fromname:layui.layim.cache().friend[0].list[0].username,
            toavator:layui.layim.cache().mine.avatar,
            touserid:layui.layim.cache().mine.id,
            toname:layui.layim.cache().mine.contact,
            content:content,
            type:'friend',
            skey:ClassChat.initData.skey,
            appiddes:ClassChat.initData.appiddes,
            SESSIONKEY:ClassChat.initData.SESSIONKEY,
            circle_app_id:ClassChat.initData.circle_app_id,
            circle_app_name:ClassChat.initData.circle_app_name,
            othertype:'text',
            auto:ClassChat.isAuto,
            msgtype:type || 'default',// default默认 noUserSpace猜你想问（无头像，与上条消息无间距） center居中显示（类似系统消息）
        };
        var def_msgid = 0;
        $.ajax({
            url: ClassChat.defineUrl + '/yychat/im/index.php?r=msgapi/ClientSendChat',
            type: "POST",
            dataType: "json",
            data: JSON.stringify([addData]),
            async: false,   // 同步，先获取记录id才能使用
            success: function (data) {
                if(data.Success){
                    def_msgid = data.Data;
                }
            }
        });
        return def_msgid;
    },

    getRecord(data, systemMessage) { // 获取未存储到本地的历史记录
        $.ajax({
            url: defineUrl + '/yychat/im/index.php?r=Msgapi/AjaxChatBySessionkey',
            type: 'POST',
            dataType: 'JSON',
            data: data,
            success: function (res) {
                var content = res.Data[data['SESSIONKEY']].content || []
                for (var i = 0; i < content.length; i++) {
                    if (content[i].id === data['userid']) {
                        content[i].mine = true
                    }
                    if (content[i].othertype === '1') {
                        content[i].content = 'img[' + content[i].content + ']'
                    }
                    content[i].avatar = addDomain(content[i].avatar)
                    content[i].timestamp = Number(content[i].timestamp) * 1000
                    content[i].type = 'friend'
                    layim.getMessage(content[i]);// 获取之前聊天记录
                }
                layim.getMessage(systemMessage);// 接入提醒
            }
        });
    },
    getMoreRecord() {
        // 点击加载更多聊天记录
        $(document).off('click','.layui-layer-record-btn').on('click','.layui-layer-record-btn',function(){
            var recordData = {
                sendtime: $('.layim-chat-main ul').find('li').eq(0).attr('data-time'),
                userid: initData.memberIdx,
                SESSIONKEY: initData.SESSIONKEY,
                chatkey: initData.appiddes
            }
            $.ajax({
                url: defineUrl + '/yychat/im/index.php?r=Msgapi/AjaxChatBySessionkey',
                type: 'POST',
                dataType: 'JSON',
                data: recordData,
                success: function (res) {
                    // var content = res.Data[data['SESSIONKEY']].content || []
                    // console.log('contentcontentcontent',res)
                    // for (var i = 0; i < content.length; i++) {
                    //     if (content[i].id === data['userid']) {
                    //         content[i].mine = true
                    //     }
                    //     if (content[i].othertype === '1') {
                    //         content[i].content = 'img[' + content[i].content + ']'
                    //     }
                    //     content[i].avatar = addDomain(content[i].avatar)
                    //     content[i].timestamp = Number(content[i].timestamp) * 1000
                    //     content[i].type = 'friend'
                    //     // layim.getMessage(content[i]);// 获取之前聊天记录
                    //     console.log()
                    // }
                }
            });
        })
    }
}

export default Chatlog;