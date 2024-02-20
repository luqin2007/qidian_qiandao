// 初始化
console.show();
auto.waitFor();
let textView;

// 启动起点
app.launchPackage('com.qidian.QDReader');
waitForPackage('com.qidian.QDReader');
waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity');
waitView("书架").click();
log("应用已识别");

// #region 签到
log("签到 开始");
while (textContains("登录领奖").exists()) {
    log("  等待登录状态...");
    sleep(500);
}
if (textView = findView("签到")) {
    clickButton(textView);
    back();
}
log("签到 结束");
// #endregion

// 我 - 福利中心
clickButton(findView("我"));
clickButton(waitView("福利中心"));
waitForActivity("com.qidian.QDReader.ui.activity.QDBrowserActivity");
waitView("限时彩蛋");

// #region 每日福利
log("每日福利 开始");
while ((textView = findView("看第\\d+个视频", "match")) 
 || (textView = findView("看视频领福利")) 
 || (textView = findView("看视频开宝箱"))) {
    clickButton(textView);
    watchAds();
}
log("每日福利 结束");
// #endregion

// #region 限时彩蛋
log("限时彩蛋 开始");
while(textView = findView("看视频")) {
    clickButton(textView);
    watchAds();
    sleep(1000);
}
log("限时彩蛋 结束");
// #endregion


// 玩游戏
// log("玩游戏 开始");
// if ((textView = findView("当日玩游戏\\d+分钟", "match"))) {
//     let layout = textView.parent();
//     textView = layout.findOne(text("去完成"));
//     if (textView) {
//         // 计算剩余时间
//         let text = layout.findOne(textMatches("\\d+/\\d+分钟"));
//         if (text) {
//             text = text.text();
//             let result = text.match("(\\d+)/(\\d+)分钟");
//             let gameTimes = parseInt(result[1]);
//             let allTime = parseInt(result[2]);
//             let playMinutes = Math.max(allTime - gameTimes, 1);
//             // 玩游戏
//             clickButton(findView("去完成"));
//             waitForActivity("com.qidian.QDReader.ui.activity.QDBrowserActivity");
//             clickButton(waitView("新游"));
//             waitForActivity("com.qidian.QDReader.ui.activity.GameBrowserActivity");
//             clickButton(waitView("在线玩"));
//             sleep(1000);
//             log("保持屏幕常亮");
//             device.keepScreenDim();
//             for (let i = playMinutes + 1; i > 0; --i) {
//                 log(`剩余 ${i}min`);
//                 sleep(66000);
//                 device.wakeUpIfNeeded();
//             }
//             log("停止屏幕常亮，游戏挂机结束");
//             device.cancelKeepingAwake();
//             device.vibrate(500);
//             // 游戏页(无标题) - 新游 - 游戏中心 - 福利中心
//             while (true) {
//                 if (findView("福利中心")) {
//                     break;
//                 }
//                 back();
//                 sleep(1000);
//             }
//         }
//     }
// }
// log("玩游戏 结束");

// 领奖励
log("领奖励 开始");
while(textView = findView("领奖励")) {
    clickButton(textView);
    sleep(1000);
    if (textView = findView("我知道了")) {
        clickButton(textView);
    }
}
log("领奖励 结束");

// 结束
log("返回书架");
back();
waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity');
clickButton(waitView("书架"));

log("运行结束");
sleep(5000);
console.hide();

// region 

/**
 * 查找带有某个文本的控件
 * @param {string} content 查找文本
 * @param {string} mode 查找方式，详见 findViewBy
 * @returns 第一个符合条件的控件，不存在返回 undefined
 */
function findView(content, mode) {
    log(`查找控件 ${content}`);
    let find = findViewBy(content, mode);
    return find && find.exists() ? find.findOnce() : undefined;
}

/**
 * 查找带有某个文本的控件
 * @param {string} content 查找文本
 * @param {string} mode 查找方式，详见 findViewBy
 * @returns 第一个符合条件的控件
 */
function waitView(content, mode) {
    log(`等待控件 ${content}`);
    let view = findViewBy(content, mode);
    view.waitFor();
    return view.findOnce();
}

/**
 * 查找控件
 * @param {string} content 查找文本 
 * @param {string} mode 查找方式，默认 text，可选 match，id
 * @returns selector 
 */
function findViewBy(content, mode) {
    let find;
    if (mode === 'match') {
        find = textMatches(content);
    } else if (mode === 'id') {
        find = id(content)
    } else {
        find = text(content);
    }
    return find;
}

/**
 * 根据文字查找按钮并点击
 * @param {UiObject} view 按钮上的文字所在 view
 * @returns 是否成功点击
 */
function clickButton(view) {
    log("点击 " + view.text());
    // 查找按钮所在控件
    let btn = view;
    while (btn && !btn.clickable()) {
        btn = btn.parent();
    }
    // 点击
    if (btn) {
        btn.click();
        return true;
    }
    return false;
}

/**
 * 看广告，等待广告结束并关闭广告
 * @returns 是否播放完成
 */
function watchAds() {
    const regex = /观看视频(\d+)秒后，可获得奖励/

    className("ImageView").waitFor();
    id("android:id/navigationBarBackground").waitFor();
    sleep(5000);
    if (textView = findView("观看视频\\d+秒后，可获得奖励", 'match')) {
        let adTime = 45; // 应该不会有比 45s 更长的广告了吧
        let m = regex.exec(textView.text());
        if (m && m.length > 1) {
            adTime = m[1];
        }
        log(`广告时间：${adTime}+1s`);
        sleep(adTime * 1000);
        sleep(1000); // 额外休眠 1s
    } else if (textView = findView("观看完视频，可获得奖励")) {
        while (findView("跳过广告")) {
            sleep(1000);
        }
    } else if (textView = findView("跳过视频")) {
        clickButton(textView);
    }
    // 结束
    if (textView = findView("跳过广告")) {
        clickButton(textView);
    } else {
        let closeButton = className("ImageView").filter(o => o.clickable()).findOnce();
        if (closeButton) closeButton.click();
        else return false;
    }
    log("广告已结束")
    return true;
}

// #region Debug

/**
 * 在控制台输出某个视图及所有子视图
 * @param {UiObject} view 视图
 * @param {number} level 空格等级
 */
function logView(view, level) {
    let s = "";
    for (let i = 0; i < level; ++i) s += " ";
    log(`${s}${view}`);
    view.children().forEach(v => logView(v, level + 2));
}

/**
 * 在控制台输出当前屏幕所有视图的内容
 * @param {UiObject} child 内部任意一个子视图
 */
function logRootView(child) {
    if (!child) {
        child = classNameContains("").findOnce()
    }

    let pl = 0;
    let pv = child.parent();
    while (pv) {
        pl++;
        child = pv;
        pv = child.parent();
    }
    log(pl);
    logView(child, 0);
}

// #endregion
