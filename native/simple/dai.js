// This stream will be played if ad-enabled playback fails.
const BACKUP_STREAM =
    'http://storage.googleapis.com/testtopbox-public/video_content/bbb/' +
    'master.m3u8';

// Live stream asset key.
// const TEST_ASSET_KEY = 'c-rArva4ShKVIAkNfy6HUQ';

// VOD content source and video IDs.
const TEST_CONTENT_SOURCE_ID = '2548831';
const TEST_VIDEO_ID = 'tears-of-steel';

const NETWORK_CODE = '21775744923';
const API_KEY = null;

// StreamManager which will be used to request ad-enabled streams.
let streamManager;

// Video element
let videoElement;

// Ad UI element
let adUiElement;

// Whether the stream is currently in an ad break.
let isAdBreak;

/**
 * Initializes the video player.
 */
function initPlayer() {
  videoElement = document.getElementById('video');
  adUiElement = document.getElementById('adUi');

  videoElement.addEventListener('pause', onStreamPause);
  videoElement.addEventListener('play', onStreamPlay);

  streamManager =
      new google.ima.dai.api.StreamManager(videoElement, adUiElement);
  streamManager.addEventListener(
      [
        google.ima.dai.api.StreamEvent.Type.LOADED,
        google.ima.dai.api.StreamEvent.Type.ERROR,
        google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED,
        google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED
      ],
      onStreamEvent, false);

  requestVODStream(TEST_CONTENT_SOURCE_ID, TEST_VIDEO_ID, NETWORK_CODE, API_KEY);
  // Uncomment line below and comment one above to request a LIVE stream.
  // requestLiveStream(TEST_ASSET_KEY, NETWORK_CODE, API_KEY);
}

/**
 * Requests a Live stream with ads.
 * @param {string} assetKey
 * @param {?string} networkCode
 * @param {?string} apiKey
 */
function requestLiveStream(assetKey, networkCode, apiKey) {
  const streamRequest = new google.ima.dai.api.LiveStreamRequest();
  streamRequest.assetKey = assetKey;
  streamRequest.networkCode = networkCode;
  streamRequest.apiKey = apiKey;
  streamManager.requestStream(streamRequest);
}

/**
 * Requests a VOD stream with ads.
 * @param {string} cmsId
 * @param {string} videoId
 * @param {?string} networkCode
 * @param {?string} apiKey
 */
function requestVODStream(cmsId, videoId, networkCode, apiKey) {
  const streamRequest = new google.ima.dai.api.VODStreamRequest();
  streamRequest.contentSourceId = cmsId;
  streamRequest.videoId = videoId;
  streamRequest.networkCode = networkCode;
  streamRequest.apiKey = apiKey;
  streamManager.requestStream(streamRequest);
}

/**
 * Responds to a stream event.
 * @param {!google.ima.dai.api.StreamEvent} e
 */
function onStreamEvent(e) {
  switch (e.type) {
    case google.ima.dai.api.StreamEvent.Type.LOADED:
      console.log('Stream loaded');
      loadUrl(e.getStreamData().url);
      break;
    case google.ima.dai.api.StreamEvent.Type.ERROR:
      console.log('Error loading stream, playing backup stream.' + e);
      loadUrl(BACKUP_STREAM);
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:
      console.log('Ad Break Started');
      isAdBreak = true;
      videoElement.controls = false;
      adUiElement.style.display = 'block';
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
      console.log('Ad Break Ended');
      isAdBreak = false;
      videoElement.controls = true;
      adUiElement.style.display = 'none';
      break;
    default:
      break;
  }
}

/**
 * Loads and plays a Url.
 * @param {string} url
 */
function loadUrl(url) {
  console.log('Loading:' + url);
  videoElement.src = url;
  videoElement.textTracks.addEventListener('addtrack', onAddTrack);
  videoElement.controls = true;
}

/**
 * Called to process metadata for the video element.
 * @param {!Event} event The add track event.
 */
function onAddTrack(event) {
  const track = event.track;
  if (track.kind === 'metadata') {
    track.mode = 'hidden';
    track.addEventListener('cuechange', (unusedEvent) => {
      for (const cue of track.activeCues) {
        const metadata = {};
        metadata[cue.value.key] = cue.value.data;
        streamManager.onTimedMetadata(metadata);
      }
    });
  }
}

/**
 * Shows the video controls so users can resume after stream is paused.
 */
function onStreamPause() {
  console.log('paused');
  if (isAdBreak) {
    videoElement.controls = true;
    adUiDiv.style.display = 'none';
  }
}

/**
 * Hides the video controls if resumed during an ad break.
 */
function onStreamPlay() {
  console.log('played');
  if (isAdBreak) {
    videoElement.controls = false;
    adUiDiv.style.display = 'block';
  }
}
