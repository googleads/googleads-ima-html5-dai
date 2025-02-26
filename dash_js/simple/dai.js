// This stream will be played if ad-enabled playback fails.

const BACKUP_STREAM =
    'https://storage.googleapis.com/interactive-media-ads/media/' +
    'tears-of-steel-DASH.mpd';

// Live stream asset key.
// const TEST_ASSET_KEY = 'PSzZMzAkSXCmlJOWDmRj8Q';

// VOD content source and video IDs.
const TEST_CONTENT_SOURCE_ID = '2559737';
const TEST_VIDEO_ID = 'tos-dash';

const NETWORK_CODE = '21775744923';
const API_KEY = null;

// StreamManager which will be used to request ad-enabled streams.
let streamManager;

// dash.js video player.
let dashPlayer;

// Video element
let videoElement;

// Ad UI element
let adUiElement;

// The play/resume button
let playButton;

/**
 * Initializes the video player.
 */
function initPlayer() {
  videoElement = document.getElementById('video');
  playButton = document.getElementById('play-button');
  adUiElement = document.getElementById('adUi');

  dashPlayer = dashjs.MediaPlayer().create();
  dashPlayer.initialize(videoElement);

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

  // Add metadata listener. Only used in LIVE streams. Timed metadata
  // is handled differently by different video players, and the IMA SDK provides
  // two ways to pass in metadata, StreamManager.processMetadata() and
  // StreamManager.onTimedMetadata().
  //
  // Use StreamManager.onTimedMetadata() if your video player parses
  // the metadata itself.
  // Use StreamManager.processMetadata() if your video player provides raw
  // ID3 tags, as with dash.js.
  dashPlayer.on('urn:google:dai:2018', (payload) => {
    const mediaId = payload.event.messageData;
    const pts = payload.event.calculatedPresentationTime;
    streamManager.processMetadata('urn:google:dai:2018', mediaId, pts);
  });

  const loadlistener = function () {
    dashPlayer.play();
    // This listener must be removed, otherwise it triggers as addional
    // manifests are loaded. The manifest is loaded once for the content,
    // but additional manifests are loaded for upcoming ad breaks.
    dashPlayer.off(dashjs.MediaPlayer.events.MANIFEST_LOADED, loadlistener);
  };
  dashPlayer.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, loadlistener);

  videoElement.addEventListener('pause', () => {
    playButton.style.display = 'block';
  });

  playButton.addEventListener('click', initiatePlayback);
}

/**
 * Initiate stream playback.
 */
function initiatePlayback() {
  requestVODStream(TEST_CONTENT_SOURCE_ID, TEST_VIDEO_ID, NETWORK_CODE, API_KEY);
  // Uncomment line below and comment one above to request a LIVE stream.
  // requestLiveStream(TEST_ASSET_KEY, NETWORK_CODE, API_KEY);

  playButton.style.display = 'none';
  playButton.removeEventListener('click', initiatePlayback);
  playButton.addEventListener('click', resumePlayback);
}

/**
 * Resume ad playback after an ad is paused.
 */
function resumePlayback() {
  videoElement.play();
  playButton.style.display = 'none';
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
  streamRequest.format = 'dash';
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
  streamRequest.format = 'dash';
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
      videoElement.controls = false;
      adUiElement.style.display = 'block';
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
      console.log('Ad Break Ended');
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
  dashPlayer.attachSource(url);
}
