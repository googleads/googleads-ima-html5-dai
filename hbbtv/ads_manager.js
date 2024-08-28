/*
 Copyright 2024 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

var POD_DURATION = 90000; // Ad pod duration in millisecond.

/**
 * Wraps IMA SDK ad stream manager.
 * @param {!VideoPlayer} videoPlayer Reference an instance of the wrapper from
 * video_player.js.
 */
var AdManager = function(videoPlayer) {
  this.streamData = null;
  this.videoPlayer = videoPlayer;
  // Ad UI is not supported for HBBTV, so no 'adUiElement' is passed in the
  // StreamManager constructor.
  this.streamManager = new google.ima.dai.api.StreamManager(
      this.videoPlayer.videoElement);
  this.streamManager.addEventListener(
      [
        google.ima.dai.api.StreamEvent.Type.STREAM_INITIALIZED,
        google.ima.dai.api.StreamEvent.Type.ERROR,
        google.ima.dai.api.StreamEvent.Type.CLICK,
        google.ima.dai.api.StreamEvent.Type.STARTED,
        google.ima.dai.api.StreamEvent.Type.FIRST_QUARTILE,
        google.ima.dai.api.StreamEvent.Type.MIDPOINT,
        google.ima.dai.api.StreamEvent.Type.THIRD_QUARTILE,
        google.ima.dai.api.StreamEvent.Type.COMPLETE,
        google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED,
        google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED,
        google.ima.dai.api.StreamEvent.Type.AD_PROGRESS,
        google.ima.dai.api.StreamEvent.Type.PAUSED,
        google.ima.dai.api.StreamEvent.Type.RESUMED
      ],
      this.onStreamEvent.bind(this),
      false);

  this.videoPlayer.setEmsgEventHandler(this.onEmsgEvent, this);
};

/**
 * Makes a pod stream request.
 * @param {string} networkCode The network code.
 * @param {string} customAssetKey The custom asset key.
 */
AdManager.prototype.requestStream = function(networkCode, customAssetKey) {
  var streamRequest = new google.ima.dai.api.PodStreamRequest();
  streamRequest.networkCode = networkCode;
  streamRequest.customAssetKey = customAssetKey;
  debugView.log('AdsManager: make PodStreamRequest');
  this.streamManager.requestStream(streamRequest);
};

/**
 * Handles IMA playback events.
 * @param {!Event} event The event object.
 */
AdManager.prototype.onStreamEvent = function(event) {
  switch (event.type) {
    // Once the stream response data is received, generate pod manifest url
    // for the video stream.
    case google.ima.dai.api.StreamEvent.Type.STREAM_INITIALIZED:
      debugView.log('IMA SDK: stream initialized');
      this.streamData = event.getStreamData();
      break;
    case google.ima.dai.api.StreamEvent.Type.ERROR:
      break;
    // Hide video controls while ad is playing.
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:
      debugView.log('IMA SDK: ad break started');
      this.adPlaying = true;
      this.adBreakStarted = true;
      break;
    // Show video controls when ad ends.
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
      debugView.log('IMA SDK: ad break ended');
      this.adPlaying = false;
      this.adBreakStarted = false;
      break;
    // Update ad countdown timers.
    case google.ima.dai.api.StreamEvent.Type.AD_PROGRESS:
      break;
    default:
      debugView.log('IMA SDK: ' + event.type);
      break;
  }
};

/**
 * Callback on Emsg event.
 * Instructs IMA SDK to fire back VAST events accordingly.
 * @param {!Event} event The event object.
 */
AdManager.prototype.onEmsgEvent = function(event) {
  var data = event.event.messageData;
  var pts = event.event.calculatedPresentationTime;
  if ((data instanceof Uint8Array) && data.byteLength > 0) {
    this.streamManager.processMetadata('ID3', data, pts);
  }
};

/**
 * Creates DAI pod url and instructs video player to load manifest.
 */
AdManager.prototype.loadAdPodManifest = function() {
  if (!this.streamData) {
    debugView.log('IMA SDK: No DAI pod session registered.');
    return;
  }

  var manifestUrl = this.streamData.getStandalonePodManifestUrl(
      this.getPodId(), POD_DURATION);
  this.videoPlayer.preload(manifestUrl);
};

/**
 * Helper Function to get an unused pod ID.
 * In production the pod ID is determined by an Early Break Notification Call.
 * @return {string} The ad pod ID.
 */
AdManager.prototype.getPodId = function() {
  return Math.trunc(new Date().getTime() / 60000);
};