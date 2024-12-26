class ListenerVideo {
  private videoEle: HTMLVideoElement | null | any = null;
  constructor() {}
  initVideoInfo(ele: any) {
    this.videoEle = ele;
  }
  init() {
    this.videoEle.addEventListener('loadedmetadata', () => {
      //加载数据
      //视频的总长度
      console.log('视频的总长度---', this.videoEle.duration);
    });
    this.videoEle.addEventListener('play', function () {
      //播放
      console.log('开始播放');
    });
    // this.videoEle.addEventListener('playing', function () {
    //   //播放中
    //   console.log('播放中');
    // });

    // this.videoEle.addEventListener('pause', function () {
    //   //暂停
    //   console.log('暂停');
    // });
    //结束
    this.videoEle.addEventListener(
      'ended',
      function () {
        //播放
        console.log('播放结束');
        return true;
      },
      false
    );
  }
  videoPlay() {
    this.videoEle.play();
  }
}
export default new ListenerVideo();
