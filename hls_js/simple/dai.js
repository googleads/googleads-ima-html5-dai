// [START init_player]
// This stream will be played if ad-enabled playback fails.
const BACKUP_STREAM =
    'http://storage.googleapis.com/testtopbox-public/video_content/bbb/' +
    'master.m3u8';

// Live stream asset key.
// const TEST_ASSET_KEY = 'c-rArva4ShKVIAkNfy6HUQ';

// VOD content source and video IDs.
const TEST_CONTENT_SOURCE_ID = '2548831';
const TEST_VIDEO_ID = 'tears-of-steel';

// Ad Manager network code.
const NETWORK_CODE = '21775744923';
const API_KEY = null;

// StreamManager which will be used to request ad-enabled streams.
let streamManager;

// hls.js video player
const hls = new Hls();

// Video element
let videoElement;

// Ad UI element
let adUiElement;

// The play/resume button
let playButton;

// Whether the stream is currently in an ad break.
let adBreak = false;

/**
 * Initializes the video player.
 */
function initPlayer() {
  videoElement = document.getElementById('video');
  playButton = document.getElementById('play-button');
  adUiElement = document.getElementById('adUi');
  createStreamManager();
  listenForMetadata();

  // Show the video controls when the video is paused during an ad break,
  // and hide them when ad playback resumes.
  videoElement.addEventListener('pause', () => {
    if (adBreak) {
      showVideoControls();
    }
  });
  videoElement.addEventListener('play', () => {
    if (adBreak) {
      hideVideoControls();
    }
  });

  playButton.addEventListener('click', () => {
    console.log('initiatePlayback');
    requestStream();
    // Hide this play button after the first click to request the stream.
    playButton.style.display = 'none';
  });
}
// [END init_player]

// [START create_stream_manager]
/**
 * Create the StreamManager and listen to stream events.
 */
function createStreamManager() {
  streamManager =
      new google.ima.dai.api.StreamManager(videoElement, adUiElement);
  streamManager.addEventListener(
      google.ima.dai.api.StreamEvent.Type.LOADED, onStreamEvent);
  streamManager.addEventListener(
      google.ima.dai.api.StreamEvent.Type.ERROR, onStreamEvent);
  streamManager.addEventListener(
      google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED, onStreamEvent);
  streamManager.addEventListener(
      google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED, onStreamEvent);
}
// [END create_stream_manager]

// [START request_stream]
/**
 * Makes a stream request and plays the stream.
 */
function requestStream() {
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
// [END request_stream]

// [START listen_for_metadata]
/**
 * Set up metadata listeners to pass metadata to the StreamManager.
 */
function listenForMetadata() {
  // Only used in LIVE streams. Timed metadata is handled differently
  // by different video players, and the IMA SDK provides two ways
  // to pass in metadata, StreamManager.processMetadata() and
  // StreamManager.onTimedMetadata().
  //
  // Use StreamManager.onTimedMetadata() if your video player parses
  // the metadata itself.
  // Use StreamManager.processMetadata() if your video player provides raw
  // ID3 tags, as with hls.js.
  hls.on(Hls.Events.FRAG_PARSING_METADATA, function(event, data) {
    if (streamManager && data) {
      // For each ID3 tag in our metadata, we pass in the type - ID3, the
      // tag data (a byte array), and the presentation timestamp (PTS).
      data.samples.forEach(function(sample) {
        streamManager.processMetadata('ID3', sample.data, sample.pts);
      });
    }
  });
}
// [END listen_for_metadata]

// [START stream_event]
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
      adBreak = true;
      hideVideoControls();
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
      console.log('Ad Break Ended');
      adBreak = false;
      showVideoControls();
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
  hls.loadSource(url);
  hls.attachMedia(videoElement);
  hls.on(Hls.Events.MANIFEST_PARSED, function() {
    console.log('Video Play');
    videoElement.play();
  });
}
// [END stream_event]

// [START video_controls]
/**
 * Hides the video controls.
 */
function hideVideoControls() {
  videoElement.controls = false;
  adUiElement.style.display = 'block';
}

/**
 * Shows the video controls.
 */
function showVideoControls() {
  videoElement.controls = true;
  adUiElement.style.display = 'none';
}
// [END video_controls]
