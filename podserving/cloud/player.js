// FILL IN THESE VARIABLES
const PROJECT_NUMBER = '';
const REGION = '';
const NETWORK_CODE = '';
const LIVE_STREAM_EVENT_ID = '';
const CUSTOM_ASSET_KEY = '';
const TOKEN =
    '';  // Replace this with the output of gcloud auth print-access-token
// FILL IN THESE VARIABLES


const BACKUP_STREAM =
    'https://storage.googleapis.com/interactive-media-ads/media/bbb.m3u8';
const hls = new Hls();  // hls.js video player
let videoElement;
let adUiElement;
let isAdBreak;

/**
 * Initializes stream manager and attaches event listeners.
 **/
function initPlayer() {
  videoElement = document.getElementById('video');
  adUiElement = document.getElementById('ad-ui');
  streamManager =
      new google.ima.dai.api.StreamManager(videoElement, adUiElement);
  videoElement.addEventListener('pause', onStreamPause);
  videoElement.addEventListener('play', onStreamPlay);

  streamManager.addEventListener(
      [
        google.ima.dai.api.StreamEvent.Type.LOADED,
        google.ima.dai.api.StreamEvent.Type.ERROR,
        google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED,
        google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED
      ],
      onStreamEvent, false);

  // Timed metadata is only used for LIVE streams.
  hls.on(Hls.Events.FRAG_PARSING_METADATA, function(event, data) {
    if (streamManager && data) {
      // For each ID3 tag in the metadata, pass in the type - ID3, the
      // tag data (a byte array), and the presentation timestamp (PTS).
      data.samples.forEach(function(sample) {
        streamManager.processMetadata('ID3', sample.data, sample.pts);
      });
    }
  });

  requestLiveStream();
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
      console.log('Error loading stream, playing backup stream.' + e);
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
      break;
  }
}


/**
 * Loads Stream in HLS.js
 * @param {string} url The url of the stream to load.
 **/
function loadUrl(url) {
  console.log('Loading:' + url);
  hls.loadSource(url);
  hls.attachMedia(videoElement);
  hls.on(Hls.Events.MANIFEST_PARSED, function() {
    console.log('Video Play');
    videoElement.play();
  });
  videoElement.controls = true;
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