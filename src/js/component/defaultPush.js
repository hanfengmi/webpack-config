/*
 * @Author: Yonyou
 * @Date: 2020-01-18 09:51:21
 * @LastEditTime : 2020-01-18 10:10:20
 * @LastEditors  : hanfengmi
 * @Description: 
 */
import ClassChat from '../chatClient';

const DefaultPush = {
    init(){
        $.ajax({
            url: ClassChat.defineUrl + '/ServerApi/workcircle/index.php?r=service_im/knowpush/DefaultPush',
            data: {
                appid: ClassChat.initData.mainappid,
                circle_app_id: ClassChat.initData.circle_app_id
            },
            type: 'POST',
            dataType: 'JSON',
            success: function (data) {
                // 存在默认推送数据才进行推送
                if(data.Success){
                    ClassChat.defaultPush = data.Data;
                    var pushData = [];
                    for(var i=0; i<data.Data.length; i++){
                        pushData.push({
                            "id": data.Data[i].kb_id,
                            "text": data.Data[i].kb_caption,
                            "type": 3
                        });
                    }

                    var message = {
                        "avatar": addDomain(user_info["avatar"]),
                        "content": JSON.stringify(pushData),
                        "fromid": user_info["id"],
                        "haveFindKnowledge": "",
                        "system": false,
                        "timestamp": new Date().getTime(),
                        "username": user_info["username"],
                        "transfer": true
                    };

                    var html ='<div class="transfer-css">猜你想问：</div>';
                    var aCnt = '';
                    var aElement
                    var cnt = "";
                    var saveText = "";  // 存数据库
                    var saveIds = "";

                    aElement = $.parseJSON(message.content);
                    for (var i = 0;i < aElement.length; i++) {
                        // aCnt+= '<a href="'+aElement[i].url+ '" target="_blank"><b></b>'+aElement[i].text+'</a><br>'
                        aCnt+= '<a href="javascript:void(0)" class="question-default" data-question='+ aElement[i].id + '><b></b>' + aElement[i].text + '</a>'

                        if(i > 0){
                            saveText += "\n";
                            saveIds += ",";
                        }
                        saveText += (i + 1) + "." + aElement[i].text;
                        saveIds += aElement[i].id;
                    }

                    // 添加聊天记录
                    var addData = {
                        "appid": ClassChat.initData.mainappid,
                        "from": 'xiaoyou',          // 小友
                        "to": ClassChat.initData.memberIdx,   // 聊天用户id
                        "content": saveText,
                        "ids": saveIds,
                        "source": "chat_default_kb",                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
                        "push_type": 2
                    };

                    chatlog.addChatRecord(addData);
                    
                    cnt = html + aCnt;
                    // console.log('tempMsgid',tempMsgid)
                    var obj = { // 更换信息成功的时候，人工客服推送的信息，要更改
                        username: message.username
                        ,avatar: addDomain(message.avatar)
                        ,id: message.fromid
                        ,type: 'friend'
                        ,content: cnt
                        ,timestamp:message.timestamp
                        ,transfer:message.transfer
                        ,system:message.system
                        ,isGuessAsk:true // 是猜你想问模块
                    };
                    ClassChat.layim.getMessage(obj); // 默认推送的5条消息
                    ClassChat.layim.setChatStatus('<span style="color:#FBD7D7;">Hi，我是'+message.username+'，24小时为您解答问题</span>');
                }
            },
            error: function () {
                console.log("查询默认推送发生错误");
            }
        });
    }
}

export default DefaultPush;
