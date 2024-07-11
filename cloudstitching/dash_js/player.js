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

// FILL IN THESE VARIABLES
// For livestream requests:
const LIVE_STREAM_EVENT_ID = '';
const CUSTOM_ASSET_KEY = '';

// For VOD stream requests:
const VOD_CONFIG_ID = '';
const AD_TAG_URL = ''; // Not used when 'VOD_CONFIG_ID' is set.
const CONTENT_SOURCE_URL = ''; // Not used when 'VOD_CONFIG_ID' is set.

// For both live and VOD stream requests:
const REGION = '';
const PROJECT_NUMBER = '';
const NETWORK_CODE = '';
const STREAM_FORMAT = 'dash';
// Replace 'TOKEN' with the output of gcloud auth print-access-token.
const TOKEN = '';
// FILL IN THESE VARIABLES

const BACKUP_STREAM = 'https://storage.googleapis.com/interactive-media-ads/' +
'media/tears-of-steel-DASH.mpd';
let dashPlayer;
let streamManager;
let videoElement;
let adUiElement;
let isAdBreak;

/**
 * Initializes stream manager and attaches event listeners.
 **/
function initPlayer() {
  const requestButton = document.getElementById('request-stream');
  const liveStreamButton = document.getElementById('livestream-request');

  videoElement = document.getElementById('video');
  adUiElement = document.getElementById('ad-ui');

  dashPlayer = dashjs.MediaPlayer().create();
  dashPlayer.initialize(videoElement);

  videoElement.addEventListener('pause', onStreamPause);
  videoElement.addEventListener('play', onStreamPlay);

  // Timed metadata is only used for LIVE streams.
  dashPlayer.on('urn:google:dai:2018', (payload) => {
    const mediaId = payload.event.messageData;
    const pts = payload.event.calculatedPresentationTime;
    streamManager.processMetadata('urn:google:dai:2018', mediaId, pts);
  });

  const manifestLoadedListener = () => {
    console.log('Stream manifest loaded to video player. Ready to play the stream.');
    // This listener must be removed, otherwise it triggers as additional
    // manifests are loaded. The manifest is loaded once for the content,
    // but additional manifests are loaded for upcoming ad breaks.
    dashPlayer.off(dashjs.MediaPlayer.events.MANIFEST_LOADED, manifestLoadedListener);
    dashPlayer.play();
    videoElement.controls = true;
  };
  dashPlayer.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, manifestLoadedListener);

  requestButton.onclick = (e) => {
    e.preventDefault();
    initiateStreamManager();
    if (liveStreamButton.checked) {
      console.log('Requesting Cloud Stitching livestream');
      requestLiveStream();
    } else {
      console.log('Requesting Cloud Stitching VOD stream');
      requestVODStream();
    }
  };
}

/**
 * Creates the IMA StreamManager and sets ad event listeners.
 */
function initiateStreamManager() {
  // Create a StreamManager before making the first stream request.
  // The StreamManager is used for this instance and subsequent stream requests.
  if (!streamManager) {
    streamManager =
        new google.ima.dai.api.StreamManager(videoElement, adUiElement);
    // Add event listeners
    streamManager.addEventListener(
        [
          google.ima.dai.api.StreamEvent.Type.LOADED,
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
        onStreamEvent, false);
  }
}

/**
 * Creates the video stitcher live stream request and passes it to the stream
 * manager.
 **/
function requestLiveStream() {
  const streamRequest = new google.ima.dai.api.VideoStitcherLiveStreamRequest();
  // The Event ID for the live stream, as setup on the Video Stitcher.
  streamRequest.liveStreamEventId = LIVE_STREAM_EVENT_ID;
  // The region to use for the Video Stitcher.
  streamRequest.region = REGION;
  // The project number for the Video Stitcher.
  streamRequest.projectNumber = PROJECT_NUMBER;
  // The OAuth Token for the Video Stitcher, as detailed above.
  streamRequest.oAuthToken = TOKEN;
  // The network code for the publisher making this stream request.
  streamRequest.networkCode = NETWORK_CODE;
  // The custom asset key created during the live stream event registration
  streamRequest.customAssetKey = CUSTOM_ASSET_KEY;
  // Format should match the format of content source URL.
  streamRequest.format = STREAM_FORMAT;
  streamManager.requestStream(streamRequest);
}

/**
 * Creates the video stitcher VOD stream request and passes it to the stream
 * manager.
 **/
function requestVODStream() {
  const streamRequest = new google.ima.dai.api.VideoStitcherVodStreamRequest();
  if (VOD_CONFIG_ID) {
    // The VOD config ID from you Cloud project.
    streamRequest.vodConfigId = VOD_CONFIG_ID;
  } else {
    // The URL string of the stream manifest for your VOD content.
    streamRequest.contentSourceUrl = CONTENT_SOURCE_URL;
    // Ad Manager URL of the ad tag.
    streamRequest.adTagUrl = AD_TAG_URL;
  }
  // The region to use for the Video Stitcher.
  streamRequest.region = REGION;
  // The project number for the Video Stitcher.
  streamRequest.projectNumber = PROJECT_NUMBER;
  // The OAuth Token for the Video Stitcher, as detailed above.
  streamRequest.oAuthToken = TOKEN;
  // The network code for the publisher making this stream request.
  streamRequest.networkCode = NETWORK_CODE;
  // Format should match the format of content source URL.
  streamRequest.format = STREAM_FORMAT;
  streamManager.requestStream(streamRequest);
}

/**
 * Handles stream events.
 * @param {!Event} e the event object.
 **/
function onStreamEvent(e) {
  switch (e.type) {
    case google.ima.dai.api.StreamEvent.Type.LOADED:
      console.log('Stream loaded');
      videoElement.controls = true;
      loadUrl(e.getStreamData().url);
      break;
    case google.ima.dai.api.StreamEvent.Type.ERROR:
      console.log('Error loading stream, playing backup stream.', e.getStreamData().errorMessage);
      loadUrl(BACKUP_STREAM);
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:
      console.log('Ad Break Started');
      isAdBreak = true;
      videoElement.play();
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
      console.log('Ad Break Ended');
      isAdBreak = false;
      videoElement.controls = true;
      break;
    default:
      if (e.type !== google.ima.dai.api.StreamEvent.Type.AD_PROGRESS) {
        console.log(e.type);
      }
      break;
  }
}

/**
 * Loads the stream in DASH.js player.
 * @param {string} url The url of the stream to load.
 **/
function loadUrl(url) {
  console.log('Loading:' + url);
  dashPlayer.attachSource(url);
}

/**
 * video pause handler.
 **/
function onStreamPause() {
  console.log('paused');
  if (isAdBreak) {
    videoElement.controls = true;
  }
}

/**
 * video play handler.
 **/
function onStreamPlay() {
  console.log('played');
  if (isAdBreak) {
    videoElement.controls = false;
  }
}