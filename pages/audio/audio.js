// pages/audio/audio.js
const innerAudioContext = wx.createInnerAudioContext();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    audiolist: [
      {
        audiosrc: 'https://mifbb-upload-image.oss-cn-hangzhou.aliyuncs.com/mifbb_test_app/business_college/audio/20200418/341446f3178b8f989f687e220bcd3cd3.mp3',
        coverimg: "https://goss.veer.com/creative/vcg/veer/800water/veer-146156021.jpg"
      }
    ],
    isPlayAudio: false,
    audioSeek: 0,
    audioDuration: 0,
    showTime1: '00:00',
    showTime2: '00:00',
    audioTime: 0,
    showProgess: false,
    hide: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(this)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.Initialization();
    if (this.data.hide) {
      innerAudioContext.play();
      this.setData({
        hide: false,
      })
    }
  },

  // 初始化播放器，获取duration
  Initialization() {
    var t = this;
    if (this.data.audiolist[0].audiosrc.length != 0) {
      innerAudioContext.title = '此时此刻'
      innerAudioContext.epname = '此时此刻'

      // 设置src
      innerAudioContext.src = this.data.audiolist[0].audiosrc;
      // 运行一次
      innerAudioContext.play();
      innerAudioContext.pause();
      innerAudioContext.onCanplay(() => {
        // 初始化duration
        innerAudioContext.duration
        setTimeout(function () {
          // 延时获取音频真正的duration
          var duration = innerAudioContext.duration;
          var min = parseInt(duration / 60);
          var sec = parseInt(duration % 60);
          if (min.toString().length == 1) {
            min = `0${min}`;
          }
          if (sec.toString().length == 1) {
            sec = `0${sec}`;
          }
          t.setData({ audioDuration: innerAudioContext.duration, showTime2: `${min}:${sec}` });
        }, 1000)
      })
    }
  },
  // 拖动进度条事件
  sliderChange(e) {
    // innerAudioContext.title = '此时此刻'
    // innerAudioContext.epname = '此时此刻'
    // innerAudioContext.src = this.data.audiolist[0].audiosrc;
    // 获取进度条百分比
    var value = e.detail.value;
    console.log(value)
    this.setData({ audioTime: value });
    var duration = this.data.audioDuration;
    // 根据进度条百分比及歌曲总时间，计算拖动位置的时间
    value = parseInt(value * duration / 100);
    // 更改状态
    this.setData({ audioSeek: value, isPlayAudio: true });
    // 调用seek方法跳转歌曲时间
    innerAudioContext.seek(value);
    // 播放歌曲
    innerAudioContext.play();
  },
  // 播放、暂停按钮
  playAudio() {
    this.setData({
      showProgess: true
    })
    // 获取播放状态和当前播放时间
    var isPlayAudio = this.data.isPlayAudio;
    var seek = this.data.audioSeek;
    innerAudioContext.pause();
    // 更改播放状态
    this.setData({ isPlayAudio: !isPlayAudio })
    if (isPlayAudio) {
      // 如果在播放则记录播放的时间seek，暂停
      this.setData({ audioSeek: innerAudioContext.currentTime });
      // 文案为-暂停，清除计步器
      clearInterval(this.data.durationIntval);
    } else {
      // 如果在暂停，获取播放时间并继续播放
      innerAudioContext.src = this.data.audiolist[0].audiosrc;
      if (innerAudioContext.duration != 0) {
        this.setData({ audioDuration: innerAudioContext.duration });
      }
      // 跳转到指定时间播放
      innerAudioContext.seek(seek);
      innerAudioContext.play();
      // 文案为-播放，开启计步器
      this.loadaudio();
    }
  },
  loadaudio() {
    var that = this;
    // 设置一个计步器
    this.data.durationIntval = setInterval(function () {
      console.log(1)
      // 当歌曲在播放时执行
      if (that.data.isPlayAudio == true) {
        // 获取歌曲的播放时间，进度百分比
        var seek = that.data.audioSeek;
        var duration = innerAudioContext.duration;
        var time = that.data.audioTime;
        time = parseInt(100 * seek / duration);
        // 当歌曲在播放时，每隔一秒歌曲播放时间+1，并计算分钟数与秒数
        var min = parseInt((seek + 1) / 60);
        var sec = parseInt((seek + 1) % 60);
        // 填充字符串，使3:1这种呈现出 03：01 的样式
        if (min.toString().length == 1) {
          min = `0${min}`;
        }
        if (sec.toString().length == 1) {
          sec = `0${sec}`;
        }
        var min1 = parseInt(duration / 60);
        var sec1 = parseInt(duration % 60);
        if (min1.toString().length == 1) {
          min1 = `0${min1}`;
        }
        if (sec1.toString().length == 1) {
          sec1 = `0${sec1}`;
        }
        // 当进度条完成，停止播放，并重设播放时间和进度条
        // console.log(time)
        if (time >= 99) {
          innerAudioContext.stop();
          that.setData({ audioSeek: 0, audioTime: 0, audioDuration: duration, isPlayAudio: false, showTime1: `00:00`, dd: 2 });
          return false;
        }
        // 正常播放，更改进度信息，更改播放时间信息
        that.setData({ audioSeek: seek + 1, audioTime: time, audioDuration: duration, showTime1: `${min}:${sec}`, showTime2: `${min1}:${sec1}` });
      }
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // 隐藏页面，清除计步器
    clearInterval(this.data.durationIntval);
    innerAudioContext.stop()
    this.setData({
      hide: true
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // 卸载页面，清除计步器
    clearInterval(this.data.durationIntval);
    innerAudioContext.stop()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      num: 2
    })
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})