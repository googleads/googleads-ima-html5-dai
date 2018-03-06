// This stream will be played if ad-enabled playback fails.
var BACKUP_STREAM =
    'http://storage.googleapis.com/testtopbox-public/video_content/bbb/' +
    'master.m3u8';

// Live stream asset key.
var TEST_ASSET_KEY = "sN_IYUG8STe1ZzhIIE_ksA";

// VOD content source and video IDs.
var TEST_CONTENT_SOURCE_ID = "19463";
var TEST_VIDEO_ID = "tears-of-steel";

// StreamManager which will be used to request ad-enabled streams.
var streamManager;

// hls.js video player
var hls = new Hls();

// Video element
var videoElement;

// Click element
var clickElement;

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

  // Add metadata listener. Only used in LIVE streams. Timed metadata
  // is handled differently by different video players, and the IMA SDK provides
  // two ways to pass in metadata, StreamManager.processMetadata() and
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
  var streamRequest = new google.ima.dai.api.LiveStreamRequest();
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
  var streamRequest = new google.ima.dai.api.VODStreamRequest();
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
  hls.loadSource(url);
  hls.attachMedia(videoElement);
  hls.on(Hls.Events.MANIFEST_PARSED, function() {
    console.log('Video Play');
    videoElement.play();
  });
}
