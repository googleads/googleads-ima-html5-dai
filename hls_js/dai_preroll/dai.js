// This sample plays a client-side preroll followed by a DAI live stream. It is
// used to test the functionality of both the client side and the DAI SDK on
// the same page.

// This stream will be played if ad-enabled playback fails.

const BACKUP_STREAM =
    'http://storage.googleapis.com/testtopbox-public/video_content/bbb/' +
    'master.m3u8';

// Live stream asset key.
const TEST_ASSET_KEY = 'c-rArva4ShKVIAkNfy6HUQ';

// Preroll ad tag
const TEST_AD_TAG = 'https://pubads.g.doubleclick.net/gampad/ads?' +
    'iu=/21775744923/external/single_ad_samples&sz=640x480&' +
    'cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&' +
    'output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=';

const NETWORK_CODE = '21775744923';
const API_KEY = null;

// StreamManager which will be used to request ad-enabled streams.
let streamManager;

// Used for playback of the preroll ad using the client side SDK.
let adsLoader;
let adDisplayContainer;
let adsManager;

// hls.js video player
const hls = new Hls();

// Video element
let videoElement;

// Ad UI element
let adUiElement;

// Whether the stream is currently in an ad break.
let isAdBreak;

// The play/resume button
let playButton;

/**
 * Initializes the video player.
 */
function initPlayer() {
  videoElement = document.getElementById('video');
  playButton = document.getElementById('play-button');
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

  // Client side ads setup.
  adDisplayContainer = new google.ima.AdDisplayContainer(
      document.getElementById('adContainer'), videoElement);
  // Must be done as the result of a user action on mobile
  adDisplayContainer.initialize();
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded, false);
  adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

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

  playButton.addEventListener('click', initiatePlayback);
}

/**
 * Initiate stream playback.
 */
function initiatePlayback() {
  requestPreroll(TEST_AD_TAG);
  playButton.removeEventListener('click', initiatePlayback);
  playButton.style.display = 'none';
}

/**
 * Initiate pre-roll playback after ad click-through.
 */
function resumePrerollPlayback() {
  adsManager.resume();
  playButton.removeEventListener('click', resumePrerollPlayback);
  playButton.style.display = 'none';
}

/**
 * Handles an ad error (client side ads).
 * @param {!google.ima.dai.api.AdErrorEvent} adErrorEvent
 */
function onAdError(adErrorEvent) {
  console.log(adErrorEvent.getError());
  if (adsManager) {
    adsManager.destroy();
  }
}

/**
 * Handles the adsManagerLoaded event (client side ads).
 * @param {!google.ima.dai.api.AdsManagerLoadedEvent} adsManagerLoadedEvent
 */
function onAdsManagerLoaded(adsManagerLoadedEvent) {
  adsManager = adsManagerLoadedEvent.getAdsManager(videoElement);
  adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, function(e) {
        console.log('Content pause requested.');
      });
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, function(e) {
        console.log('Content resume requested.');
        requestLiveStream(TEST_ASSET_KEY, NETWORK_CODE, API_KEY);
      });
  adsManager.addEventListener(google.ima.AdEvent.Type.PAUSED, function(e) {
    console.log('Preroll paused.');
    playButton.addEventListener('click', resumePrerollPlayback);
    playButton.style.display = 'block';
  });
  adsManager.addEventListener(
      google.ima.AdEvent.Type.ALL_ADS_COMPLETED, function(e) {
        console.log('All pre-roll ads completed.');
        adDisplayContainer.destroy();
        document.getElementById('adContainer').style.display = 'none';
      });

  try {
    adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (adError) {
    // An error may be thrown if there was a problem with the VAST response.
  }
}

/**
 * Requests a preroll ad using the client side SDK.
 * @param {string} adTagUrl
 */
function requestPreroll(adTagUrl) {
  const adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = adTagUrl;
  adsRequest.linearAdSlotWidth = 640;
  adsRequest.linearAdSlotHeight = 400;
  adsLoader.requestAds(adsRequest);
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

/**
 * Shows the video controls so users can resume after stream is paused.
 */
function onStreamPause() {
  console.log('paused');
  if (isAdBreak) {
    videoElement.controls = true;
    adUiElement.style.display = 'none';
  }
}

/**
 * Hides the video controls if resumed during an ad break.
 */
function onStreamPlay() {
  console.log('played');
  if (isAdBreak) {
    videoElement.controls = false;
    adUiElement.style.display = 'block';
  }
}
