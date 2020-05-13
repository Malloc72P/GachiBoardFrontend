import {Injectable} from '@angular/core';
import {WebsocketManagerService} from "../../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service";
import {Socket} from "ngx-socket-io";
import {VideoChatPanelManagerService} from "../video-chat-panel-manager/video-chat-panel-manager.service";
import {HttpHelper} from "../../../Helper/http-helper/http-helper";
import {WebsocketPacketActionEnum} from "../../../../DTO/WebsocketPacketDto/WebsocketPacketActionEnum";
import {Producer} from "mediasoup-client/lib/Producer";
import {Consumer} from "mediasoup-client/lib/Consumer";
import {WebsocketPacketDto} from "../../../../DTO/WebsocketPacketDto/WebsocketPacketDto";
import {DtlsParameters, IceCandidate, IceParameters, Transport} from "mediasoup-client/lib/Transport";
import {Device} from "mediasoup-client";
import {MediaKind, RtpCapabilities} from "mediasoup-client/lib/RtpParameters";

export class TransportParams {
  userId: string;
  id: string;
  iceParameters: IceParameters;
  iceCandidate: Array<IceCandidate>;
  dtlsParameters: DtlsParameters;
  type: string;

  constructor(userId: string, id: string, iceParameters: IceParameters, iceCandidate: Array<IceCandidate>, dtlsParameters: DtlsParameters, type: string) {
    this.userId = userId;
    this.id = id;
    this.iceParameters = iceParameters;
    this.iceCandidate = iceCandidate;
    this.dtlsParameters = dtlsParameters;
    this.type = type;
  }
}

@Injectable({
  providedIn: 'root'
})
export class VideoChatService {
  private roomId: string;
  private userList: Array<string>;
  private type: string;
  private isChangingVideoSource = false;
  private webCams: Array<string>;
  private webCam: string;

  private device: Device;

  private producerVideo: Producer;
  private producerAudio: Producer;

  private producerTransport: Transport;
  private consumerTransport: Transport;

  private producerVideoStream: MediaStream;
  private producerAudioStream: MediaStream;

  private consumersVideo: Map<string, Consumer> = new Map<string, Consumer>();
  private consumersAudio: Map<string, Consumer> = new Map<string, Consumer>();

  private consumersVideoStream: Map<string, MediaStream> = new Map<string, MediaStream>();
  private consumersAudioStream: Map<string, MediaStream> = new Map<string, MediaStream>();

  constructor(
    public websocketManager: WebsocketManagerService,
    private panel: VideoChatPanelManagerService,
  ) {
    this.userList = new Array<string>();
    this.webCams = new Array<string>();
  }

  public async joinVideoChat(type: 'cam' | 'screen') {
    try {
      await this.joinRoom();
      await this.deviceLoad(type);
      this.showProducerVideo();
    } catch (e) {
      console.error(e.message, e.stack);
    }
  }

  public async leaveVideoChat() {
    await this.leaveRoom();
  }

  public async changeVideoSource(type: 'cam' | 'screen') {
    this.isChangingVideoSource = true;
    this.stopVideoStream();
    this.producerVideoStart(type);
  }

  public async changeWebCam() {
    let updateTargetCam = this.webCams[0];

    for(let i = 0; i < this.webCams.length; i++) {
      if(this.webCam === this.webCams[i]) {
        updateTargetCam = this.webCams[i + 1 < this.webCams.length ? i + 1 : 0];
        break;
      }
    }

    const videoStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: updateTargetCam }}
    });

    const videoTrack = videoStream.getVideoTracks()[0];
    this.webCam = videoTrack.getCapabilities().deviceId;

    if(videoTrack) {
      await this.producerVideo.replaceTrack({track: videoTrack});
    }

    let previousStream = this.producerVideoStream;
    this.producerVideoStream = videoStream;
    this.attachVideo(this.userId, videoStream);

    if(!!previousStream) {
      previousStream.getTracks().forEach(track => {
        track.stop();
      });
    }
  }

  // ##########################################
  // ############# Private Method #############
  // ##########################################

  // ############# Video Chat Room #############

  private async joinRoom(): Promise<void> {
    return new Promise<void>(async resolve => {
      let wsPacket = this.websocketManager.createWbSessionScopePacket(null, WebsocketPacketActionEnum.JOIN);
      wsPacket.wsPacketSeq = this.websocketManager.wsPacketSeq;

      let ackPacket = await this.request(HttpHelper.websocketApi.videoChat.join.event, wsPacket);

      this.roomId = ackPacket.namespaceValue;
      this.eventSubscribe();
      this.addUser(this.userId);

      let userIdList = ackPacket.additionalData as Array<string>;
      userIdList.forEach(value => {
        if(this.userId !== value) {
          this.addUser(value);
        }
      });

      resolve();
    });
  }

  private async leaveRoom() {
    let wsPacket = this.websocketManager.createWbSessionScopePacket(null, WebsocketPacketActionEnum.LEAVE);

    try {
      await this.request(HttpHelper.websocketApi.videoChat.leave.event, wsPacket);
      this.roomId = undefined;
      this.clearUserList();
      this.stopMediaStream();
      this.removeSocketSubscribeVideoChat();
      this.mediaClose();
    } catch (e) {
      console.error(e.message, e.stack);
    }
  }

  private addUser(userName: string) {
    this.userList.push(userName);
    this.panel.addPanel(userName);
  }

  private removeUser(userName: string) {
    this.panel.removePanel(userName);
  }

  private clearUserList() {
    if(!this.userIsEmpty) {
      this.userList.splice(0, this.userList.length);
    }
    this.panel.clearPanel();
  }

  // ############# Video Chat Load #############

  private async deviceLoad(type: 'cam' | 'screen'): Promise<void> {
    try {
      this.device = new Device();
      if(!this.device.loaded) {
        const wsPacket = this.websocketManager.createWbSessionScopePacket(null, WebsocketPacketActionEnum.READ);
        wsPacket.wsPacketSeq = this.websocketManager.wsPacketSeq;

        let ackPacket = await this.request(HttpHelper.websocketApi.videoChat.getRouterRtpCapabilities.event, wsPacket);
        let data  = ackPacket.additionalData as RtpCapabilities;

        await this.device.load({ routerRtpCapabilities: data});
        this.connectTransport(await this.createTransport());
        await this.producerVideoStart(type);
        await this.producerAudioStart();

        wsPacket.wsPacketSeq = this.websocketManager.wsPacketSeq;

        wsPacket.additionalData = 'video';
        let videoProducerIds = (await this.request(HttpHelper.websocketApi.videoChat.getProducerIds.event, wsPacket)).additionalData as Array<string>;
        for(const userId of videoProducerIds) {
          await this.consumerVideoStart(userId);
        }
        wsPacket.additionalData = 'audio';
        let audioProducerIds = (await this.request(HttpHelper.websocketApi.videoChat.getProducerIds.event, wsPacket)).additionalData as Array<string>;
        for(const userId of audioProducerIds) {
          await this.consumerAudioStart(userId);
        }
      }
    } catch (e) {
      if(e.name === 'UnsupportedError') {
        console.error("VideoChatService >> constructor >> browser not supported : ", );
      } else {
        console.error(e.message, e.track);
      }
    }
  }

  private async createTransport(): Promise<Array<TransportParams>> {
    try {
      const wsPacket = this.websocketManager.createWbSessionScopePacket(null, WebsocketPacketActionEnum.CREATE);
      let ackPacket = await this.request(HttpHelper.websocketApi.videoChat.createTransport.event, wsPacket);
      return ackPacket.additionalData as Array<TransportParams>;
    } catch (e) {
      console.error(`Transport creation failed`);
    }
  }

  private connectTransport(transportParams: Array<TransportParams>) {
    this.connectProducerTransport(transportParams[0]);
    this.connectConsumerTransport(transportParams[1]);
  }

  private connectProducerTransport(transportParam: TransportParams) {
    this.producerTransport = this.device.createSendTransport({
      id: transportParam.id,
      iceParameters: transportParam.iceParameters,
      iceCandidates: transportParam.iceCandidate,
      dtlsParameters: transportParam.dtlsParameters,
    });

    this.producerTransport.on('connect', async ({ dtlsParameters }, callback, errorBack) => {
      let wsPacket = this.websocketManager.createWbSessionScopePacket(null, WebsocketPacketActionEnum.CONNECT);
      wsPacket.wsPacketSeq = this.websocketManager.wsPacketSeq;
      wsPacket.additionalData = { dtlsParameters: dtlsParameters, type: 'producer' };


      await this.request(HttpHelper.websocketApi.videoChat.connectTransport.event, wsPacket).then(callback).catch(errorBack);
    });

    this.producerTransport.on('produce', async ({ kind, rtpParameters }, callback, errorBack) => {
      let wsPacket = this.websocketManager.createWbSessionScopePacket(null, WebsocketPacketActionEnum.PRODUCE);
      wsPacket.wsPacketSeq = this.websocketManager.wsPacketSeq;
      wsPacket.additionalData = { rtpParameters, kind };

      await this.request(HttpHelper.websocketApi.videoChat.produce.event, wsPacket)
        .then(({ senderIdToken }) => callback({ senderIdToken }))
        .catch(errorBack);
    });

    this.producerTransport.on('connectionstatechange', async (state: RTCPeerConnectionState) => {
      switch (state) {
        case "failed":
          this.producerTransport.close();
          break;
        default:
          break;
      }
    });
  }

  private connectConsumerTransport(transportParam: TransportParams) {
    this.consumerTransport = this.device.createRecvTransport({
      id: transportParam.id,
      iceParameters: transportParam.iceParameters,
      iceCandidates: transportParam.iceCandidate,
      dtlsParameters: transportParam.dtlsParameters,
    });

    this.consumerTransport.on('connect',  async ({ dtlsParameters }, callback, errorBack) => {
      let wsPacket = this.websocketManager.createWbSessionScopePacket(null, WebsocketPacketActionEnum.CONNECT);
      wsPacket.wsPacketSeq = this.websocketManager.wsPacketSeq;
      wsPacket.additionalData = { dtlsParameters: dtlsParameters, type: 'consumer' };

      await this.request(HttpHelper.websocketApi.videoChat.connectTransport.event, wsPacket)
        .then(callback).catch(errorBack);
    });

    this.consumerTransport.on('connectionstatechange', async (state: RTCPeerConnectionState) => {
      switch (state) {
        case "failed":
          this.consumerTransport.close();
          break;
        default:
          break;
      }
    });
  }

  // ############# Start Video Chat #############

  private showProducerVideo() {
    if(this.panel.videoPanels.has(this.userId)) {
      this.panel.videoPanels.get(this.userId).videoElement.nativeElement.srcObject = this.producerVideoStream;
    }
  }

  private async producerVideoStart(type: 'cam' | 'screen'): Promise<void> {
    try {
      if(this.device.canProduce('video')) {
        let videoStream;
        switch (type) {
          case "cam":
            videoStream = await navigator.mediaDevices.getUserMedia({ video: true });

            const devices = await navigator.mediaDevices.enumerateDevices();

            for (let device of devices) {
              if(device.kind === "videoinput") {
                this.webCams.push(device.deviceId);
              }
            }

            break;
          case "screen":
            // @ts-ignore
            videoStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            videoStream.oninactive = () => {
              console.log("VideoChatService >> oninactive >> this.isChangingVideoSource : ", this.isChangingVideoSource);
              if(!this.isChangingVideoSource) {
                this.leaveVideoChat();
              }
            };
            this.isChangingVideoSource = false;
            break;
        }

        const videoTrack = videoStream.getVideoTracks()[0];
        this.webCam = videoTrack.getCapabilities().deviceId;

        if(videoTrack) {
          if(this.producerTransport && !this.producerTransport.closed) {
            this.producerVideo = await this.producerTransport.produce({ track: videoTrack })
          }
        }

        let previousStream = this.producerVideoStream;
        this.producerVideoStream = videoStream;
        this.attachVideo(this.userId, videoStream);
        this.type = type;

        if(!!previousStream) {
          previousStream.getTracks().forEach(track => {
            track.stop();
          });
        }
      }
    } catch (e) {
      if(e.name === "NotFoundError") {
        // TODO : 캠 없음
        this.type = type;
        alert(`You have not cam. Sound only`);
      } else {
        console.error(e.message, e.stack);
      }
    }
  }

  private async producerAudioStart(): Promise<void> {
    try {
      if(this.device.canProduce('audio')) {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTrack = audioStream.getAudioTracks()[0];

        if(audioTrack) {
          if(this.producerTransport && !this.producerTransport.closed) {
            this.producerAudio = await this.producerTransport.produce({ track: audioTrack });
          }
        }
        this.producerAudioStream = audioStream;
      }
    } catch (e) {
      if(e.name === "NotFoundError") {
        // TODO : 마이크 없음
      } else {
        console.error(e.message, e.stack);
      }
    }
  }

  private async consumerVideoStart(userId: string): Promise<void> {
    try {
      const {rtpCapabilities} = this.device;
      const wsPacket = this.websocketManager.createWbSessionScopePacket(null, WebsocketPacketActionEnum.CREATE);
      wsPacket.additionalData = {rtpCapabilities, userId, kind: 'video'};

      const packetDto = await this.request(HttpHelper.websocketApi.videoChat.consume.event, wsPacket);
      const consumeData = packetDto.additionalData as { id: string, producerId: string, kind: MediaKind, rtpParameters: RTCRtpParameters };
      const consumer = await this.consumerTransport.consume(consumeData);

      consumer.on('transportclose', async () => {
        this.consumersVideoStream.delete(userId);
        this.consumersVideo.delete(userId);
      });

      this.consumersVideo.set(userId, consumer);

      const stream = new MediaStream();
      stream.addTrack(consumer.track);

      this.consumersVideoStream.set(userId, stream);
      this.attachVideo(userId, stream);

    } catch (e) {
      console.error(e.message, e.stack);
    }
  }

  private async consumerAudioStart(userId: string): Promise<void> {
    try {
      const { rtpCapabilities } = this.device;
      const wsPacket = this.websocketManager.createWbSessionScopePacket(null, WebsocketPacketActionEnum.CREATE);
      wsPacket.additionalData = { rtpCapabilities, userId, kind: 'audio' };

      const packetDto = await this.request(HttpHelper.websocketApi.videoChat.consume.event, wsPacket);
      const consumeData = packetDto.additionalData as { id: string, producerId: string, kind: MediaKind, rtpParameters: RTCRtpParameters };
      const consumer = await this.consumerTransport.consume(consumeData);

      consumer.on('transportclose', async () => {
        this.consumersAudioStream.delete(userId);
        this.consumersAudio.delete(userId);
      });

      this.consumersAudio.set(userId, consumer);

      const stream = new MediaStream();

      stream.addTrack(consumer.track);
      this.consumersAudioStream.set(userId, stream);

      this.attachAudio(userId, stream);
    } catch (e) {
      console.error(e.message, e.stack);
    }
  }

  private attachVideo(targetUserId: string, stream: MediaStream) {
    if(this.panel.videoPanels.has(targetUserId)) {
      this.panel.videoPanels.get(targetUserId).videoElement.nativeElement.srcObject = stream;
    }
  }

  private attachAudio(targetUserId: string, stream: MediaStream) {
    if(this.panel.videoPanels.has(targetUserId)) {
      this.panel.videoPanels.get(targetUserId).audioElement.nativeElement.srcObject = stream;
    }
  }

  // ############# Event Subscriber #############

  private eventSubscribe() {
    this.subscribeUserJoined();
    this.subscribeUserLeaved();
    this.subscribeMediaProduce();
  }

  private subscribeUserJoined() {
    this.websocketManager.socket.on(HttpHelper.websocketApi.videoChat.join.event, async (packetDto: WebsocketPacketDto) => {
      this.addUser(packetDto.senderIdToken);
    });
  }

  private subscribeUserLeaved() {
    this.websocketManager.socket.on(HttpHelper.websocketApi.videoChat.leave.event, (userId: string) => {
      try {
        this.removeUser(userId);
      } catch (e) {
        console.error(e.message, e.stack);
      }
    });
  }

  private subscribeMediaProduce() {
    this.socket.on(HttpHelper.websocketApi.videoChat.mediaProduce.event, async (socketDto: WebsocketPacketDto) => {
      let kind = socketDto.additionalData as MediaKind;

      if(socketDto.senderIdToken !== this.userId) {
        try {
          switch (kind) {
            case "video":
              await this.consumerVideoStart(socketDto.senderIdToken);
              break;
            case "audio":
              await this.consumerAudioStart(socketDto.senderIdToken);
              break;
          }
        } catch (e) {
          console.error(e.message, e.stack);
        }
      }
    });
  }

  // ############# Video Chat Closer #############

  private mediaClose() {
    if(!!this.producerTransport) this.producerTransport.close();
    this.producerTransport = undefined;
    if(!!this.consumerTransport)  this.consumerTransport.close();
    this.consumerTransport = undefined;
    this.producerVideo = undefined;
    this.producerAudio = undefined;
  }

  private stopMediaStream() {
    this.stopVideoStream();
    this.stopAudioStream();
  }

  private stopVideoStream() {
    if(!!this.producerVideoStream) {
      this.producerVideoStream.getTracks().forEach(track => {
        track.stop();
      });
      this.producerVideoStream = undefined;
    }
  }

  private stopAudioStream() {
    if(!!this.producerAudioStream) {
      this.producerAudioStream.getTracks().forEach(track => {
        track.stop();
      });
      this.producerAudioStream = undefined;
    }
  }

  private removeSocketSubscribeVideoChat() {
    this.socket.removeListener(HttpHelper.websocketApi.videoChat.join.event);
    this.socket.removeListener(HttpHelper.websocketApi.videoChat.leave.event);
    this.socket.removeListener(HttpHelper.websocketApi.videoChat.mediaProduce.event);
  }

  // ############# Socket Requester #############

  private async request(event: string, socketDto?: WebsocketPacketDto): Promise<WebsocketPacketDto> {
    return new Promise<WebsocketPacketDto>((resolve, reject) => {
      this.socket.emit(event, socketDto);
      // console.log(`${event} : emitted`);
      this.socket.once(event, (ackSocketDto: WebsocketPacketDto) => {
        // console.log(`${event} : received`);
        switch (ackSocketDto.action) {
          case WebsocketPacketActionEnum.ACK:
            resolve(ackSocketDto);
            // console.log(`${event} : socket request resolved`);
            // console.log("Resolved data : ", ackSocketDto);
            break;
          case WebsocketPacketActionEnum.NAK:
            reject(`Request failed - ${event}`);
            break;
        }
      });
    });
  }


  // ###########################################
  // ############# Getter & Setter #############
  // ###########################################

  get isJoined(): boolean {
    return !!this.roomId;
  }

  get isCam(): boolean {
    return this.type === 'cam';
  }

  get isScreen(): boolean {
    return this.type === 'screen';
  }

  get userIsEmpty(): boolean {
    return this.userList.length === 0;
  }

  get numberOfUser(): number {
    return this.userList.length;
  }

  get numberOfWebCams(): number {
    return this.webCams.length === undefined ? 0 : this.webCams.length;
  }

  // ##########################################
  // ######### Private Getter & Setter #########
  // ##########################################

  private get userId(): string {
    return this.websocketManager.userInfo.idToken;
  }

  private get socket(): Socket {
    return this.websocketManager.socket;
  }
}
