// This stream will be played if ad-enabled playback fails.
const BACKUP_STREAM =
    'http://storage.googleapis.com/testtopbox-public/video_content/bbb/' +
    'master.m3u8';

// Live stream asset key.
const TEST_ASSET_KEY = "sN_IYUG8STe1ZzhIIE_ksA";

// VOD content source and video IDs.
const TEST_CONTENT_SOURCE_ID = "19463";
const TEST_VIDEO_ID = "tears-of-steel";

// StreamManager which will be used to request ad-enabled streams.
let streamManager;

// Video element
let videoElement;

// Click element
let clickElement;

/**
 * Initializes the video player.
 */
function initPlayer() {
  videoElement = document.getElementById('video');
  clickElement = document.getElementById('click');
  streamManager = new google.ima.dai.api.StreamManager(videoElement);
  streamManager.setClickElement(clickElement);
  streamManager.addEventListener(
    [google.ima.dai.api.StreamEvent.Type.LOADED,
     google.ima.dai.api.StreamEvent.Type.ERROR,
     google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED,
     google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED],
    onStreamEvent,
    false);

  requestVODStream(TEST_CONTENT_SOURCE_ID, TEST_VIDEO_ID, null);
  // Uncomment line below and comment one above to request a LIVE stream.
  //requestLiveStream(TEST_ASSET_KEY, null);
}

/**
 * Requests a Live stream with ads.
 * @param  {string} assetKey
 * @param  {?string} apiKey
 */
function requestLiveStream(assetKey, apiKey) {
  const streamRequest = new google.ima.dai.api.LiveStreamRequest();
  streamRequest.assetKey = assetKey;
  streamRequest.apiKey = apiKey || '';
  streamManager.requestStream(streamRequest);
}

/**
 * Requests a VOD stream with ads.
 * @param  {string} cmsId
 * @param  {string} videoId
 * @param  {?string} apiKey
 */
function requestVODStream(cmsId, videoId, apiKey) {
  const streamRequest = new google.ima.dai.api.VODStreamRequest();
  streamRequest.contentSourceId = cmsId;
  streamRequest.videoId = videoId;
  streamRequest.apiKey = apiKey;
  streamManager.requestStream(streamRequest);
}

/**
 * Responds to a stream event.
 * @param  {StreamEvent} e
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
      clickElement.style.display = 'block';
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
      console.log('Ad Break Ended');
      videoElement.controls = true;
      clickElement.style.display = 'none';
      break;
    default:
      break;
  }
}

/**
 * Loads and plays a Url.
 * @param  {string} url
 */
function loadUrl(url) {
  console.log('Loading:' + url);
  videoElement.src = url;
  videoElement.textTracks.addEventListener('addtrack', onAddTrack);
  videoElement.controls = true;
}

/**
 * Called to process metadata for the video element.
 * @param {Event} event The add track event.
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
