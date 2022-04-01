// This stream will be played if ad-enabled playback fails.

const BACKUP_STREAM =
    'http://storage.googleapis.com/testtopbox-public/video_content/bbb/' +
    'master.m3u8';

// Live stream asset key.
const TEST_ASSET_KEY = 'c-rArva4ShKVIAkNfy6HUQ';

// VOD content source and video IDs.
const TEST_CONTENT_SOURCE_ID = '2548831';
const TEST_VIDEO_ID = 'tears-of-steel';

// StreamManager which will be used to request ad-enabled streams.
let streamManager;

// hls.js video player.
const hls = new Hls({autoStartLoad: false});

// Radio button for Live Stream.
let liveRadio;

// Radio button for VOD stream.
let vodRadio;

// Live sample fake link.
let liveFakeLink;

// VOD sample fake link.
let vodFakeLink;

// Wrapper for live input fields.
let liveInputs;

// Wrapper for VOD input fields.
let vodInputs;

// Text box with asset key.
let assetKeyInput;

// Text box with live API key.
let liveAPIKeyInput;

// Text box with CMS ID.
let cmsIdInput;

// Text box with Video ID.
let videoIdInput;

// Text box with VOD API key.
let vodAPIKeyInput;

// Video element.
let videoElement;

// Play button.
let playButton;

// Button to save bookmark to URL.
let bookmarkButton;

// Companion ad div.
let companionDiv;

// Div showing current ad progress.
let progressDiv;

// Ad UI div.
let adUiDiv;

// Flag tracking if we are currently in snapback mode or not.
let isSnapback;

// Time to seek to after an ad if that ad was played as the result of snapback.
let snapForwardTime;

// Content time for stream start if it's bookmarked.
let bookmarkTime;

// Whether we are currently playing a live stream or a VOD stream
let isLiveStream;

// Whether the stream is currently in an ad break.
let isAdBreak;

/**
 * Initializes the page.
 */
function initPage() {
  initUI();
  initPlayer();
}

/**
 * Initializes the UI.
 */
function initUI() {
  liveRadio = document.getElementById('live-radio');
  vodRadio = document.getElementById('vod-radio');
  liveFakeLink = document.getElementById('sample-live-link');
  vodFakeLink = document.getElementById('sample-vod-link');
  liveInputs = document.getElementById('live-inputs');
  vodInputs = document.getElementById('vod-inputs');
  assetKeyInput = document.getElementById('asset-key');
  liveAPIKeyInput = document.getElementById('live-api-key');
  cmsIdInput = document.getElementById('cms-id');
  videoIdInput = document.getElementById('video-id');
  vodAPIKeyInput = document.getElementById('vod-api-key');

  liveRadio.addEventListener('click', onLiveRadioClick);

  vodRadio.addEventListener('click', onVODRadioClick);

  liveFakeLink.addEventListener('click', () => {
    onLiveRadioClick();
    assetKeyInput.value = TEST_ASSET_KEY;
  });

  vodFakeLink.addEventListener('click', () => {
    onVODRadioClick();
    cmsIdInput.value = TEST_CONTENT_SOURCE_ID;
    videoIdInput.value = TEST_VIDEO_ID;
  });
}

/**
 * Initializes the video player.
 */
function initPlayer() {
  videoElement = document.getElementById('content');
  playButton = document.getElementById('play-button');
  bookmarkButton = document.getElementById('bookmark-button');
  adUiDiv = document.getElementById('ad-ui');
  progressDiv = document.getElementById('progress');
  companionDiv = document.getElementById('companion');

  const queryParams = getQueryParams();
  bookmarkTime = parseInt(queryParams['bookmark']) || null;

  videoElement.addEventListener('seeked', onSeekEnd);
  videoElement.addEventListener('pause', onStreamPause);
  videoElement.addEventListener('play', onStreamPlay);

  streamManager = new google.ima.dai.api.StreamManager(videoElement, adUiDiv);
  streamManager.addEventListener(
      google.ima.dai.api.StreamEvent.Type.LOADED, onStreamLoaded, false);
  streamManager.addEventListener(
      google.ima.dai.api.StreamEvent.Type.ERROR, onStreamError, false);
  streamManager.addEventListener(
      google.ima.dai.api.StreamEvent.Type.AD_PROGRESS, onAdProgress, false);
  streamManager.addEventListener(
      google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED, onAdBreakStarted,
      false);
  streamManager.addEventListener(
      google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED, onAdBreakEnded,
      false);
  streamManager.addEventListener(
      google.ima.dai.api.StreamEvent.Type.STARTED, onAdStarted, false);

  hls.on(Hls.Events.FRAG_PARSING_METADATA, function(event, data) {
    if (streamManager && data) {
      // For each ID3 tag in our metadata, we pass in the type - ID3, the
      // tag data (a byte array), and the presentation timestamp (PTS).
      data.samples.forEach(function(sample) {
        streamManager.processMetadata('ID3', sample.data, sample.pts);
      });
    }
  });

  playButton.addEventListener('click', onPlayButtonClick);
  bookmarkButton.addEventListener('click', onBookmarkButtonClick);
}

/**
 * Displays the live inputs and hides the VOD inputs.
 */
function onLiveRadioClick() {
  vodInputs.style.display = 'none';
  liveInputs.style.display = 'block';
}

/**
 * Displays the VOD inputs and hides the live inputs.
 */
function onVODRadioClick() {
  liveInputs.style.display = 'none';
  vodInputs.style.display = 'block';
}

/**
 * Returns a dictionary of key-value pairs from a GET query string.
 * @return {!Object} Key-value dictionary for keys and values in provided query
 *     string.
 */
function getQueryParams() {
  const returnVal = {};
  const pairs = location.search.substring(1).split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    returnVal[pair[0]] = decodeURIComponent(pair[1]);
  }
  return returnVal;
}

/**
 * Handles play button clicks by requesting a stream. Also removes itself so we
 * don't request more streams on subsequent clicks.
 */
function onPlayButtonClick() {
  if (liveRadio.checked) {
    requestLiveStream();
  } else {
    requestVODStream();
  }
}

/**
 * Gets the current bookmark time and saves it to a URL param.
 */
function onBookmarkButtonClick() {
  // Handles player not ready or current time = 0
  if (!videoElement.currentTime) {
    alert(
        'Error: could not get current time of video element, or current time is 0');
    return;
  }
  if (isLiveStream) {
    alert('Error: this functionality only works for VOD streams');
  }
  const bookmarkTime = Math.floor(
      streamManager.contentTimeForStreamTime(videoElement.currentTime));
  history.pushState(null, null, 'dai.html?bookmark=' + bookmarkTime);
}

/**
 * Requests a Live stream with ads.
 */
function requestLiveStream() {
  isLiveStream = true;
  const streamRequest = new google.ima.dai.api.LiveStreamRequest();
  streamRequest.assetKey = assetKeyInput.value;
  streamRequest.apiKey = liveAPIKeyInput.value || '';
  streamManager.requestStream(streamRequest);
}

/**
 * Requests a VOD stream with ads.
 */
function requestVODStream() {
  isLiveStream = false;
  const streamRequest = new google.ima.dai.api.VODStreamRequest();
  streamRequest.contentSourceId = cmsIdInput.value;
  streamRequest.videoId = videoIdInput.value;
  streamRequest.apiKey = vodAPIKeyInput.value;
  streamManager.requestStream(streamRequest);
}

/**
 * Loads the stream.
 * @param {!google.ima.dai.api.StreamEvent} e StreamEvent fired when stream is loaded.
 */
function onStreamLoaded(e) {
  console.log('Stream loaded');
  loadUrl(e.getStreamData().url);
}

/**
 * Handles stream errors. Plays backup content.
 * @param {!google.ima.dai.api.StreamEvent} e StreamEvent fired on stream error.
 */
function onStreamError(e) {
  console.log('Error loading stream, playing backup stream.' + e);
  loadUrl(BACKUP_STREAM);
}

/**
 * Updates the progress div.
 * @param {!google.ima.dai.api.StreamEvent} e StreamEvent fired when ad progresses.
 */
function onAdProgress(e) {
  const adProgressData = e.getStreamData().adProgressData;
  const currentAdNum = adProgressData.adPosition;
  const totalAds = adProgressData.totalAds;
  const currentTime = adProgressData.currentTime;
  const duration = adProgressData.duration;
  const remainingTime = Math.floor(duration - currentTime);
  progressDiv.innerHTML =
      'Ad (' + currentAdNum + ' of ' + totalAds + ') ' + remainingTime + 's';
}

/**
 * Handles ad break started.
 * @param {!google.ima.dai.api.StreamEvent} e StreamEvent fired for ad break start.
 */
function onAdBreakStarted(e) {
  console.log('Ad Break Started');
  isAdBreak = true;
  videoElement.controls = false;
  adUiDiv.style.display = 'block';
  // Fixes an issue where slow-seeking into an ad causes the player to get stuck
  // in a paused state.
  videoElement.play();
}

/**
 * Handles ad break ended.
 * @param {!google.ima.dai.api.StreamEvent} e Stream event fired for ad break end.
 */
function onAdBreakEnded(e) {
  console.log('Ad Break Ended');
  isAdBreak = false;
  videoElement.controls = true;
  adUiDiv.style.display = 'none';
  if (snapForwardTime && snapForwardTime > videoElement.currentTime) {
    videoElement.currentTime = snapForwardTime;
    snapForwardTime = null;
  }
  progressDiv.textContent = '';
}

/**
 *  Handles ad started and displays companion ad, if any.
 */
function onAdStarted(e) {
  const companionAds = e.getAd().getCompanionAds();
  for (let i = 0; i < companionAds.length; i++) {
    const companionAd = companionAds[i];
    if (companionAd.getWidth() == 728 && companionAd.getHeight() == 90) {
      companionDiv.innerHTML = companionAd.getContent();
    }
  }
}

/**
 * Loads and plays a Url.
 * @param {string} url
 */
function loadUrl(url) {
  console.log('Loading:' + url);
  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    console.log('Video Play');
    let startTime = 0;
    if (bookmarkTime) {
      startTime = streamManager.streamTimeForContentTime(bookmarkTime);
      // Seeking on load will trigger the onSeekEnd event, so treat this seek as
      // if it's snapback. Without this, resuming at a bookmark will kick you
      // back to the ad before the bookmark.
      isSnapback = true;
    }
    hls.startLoad(startTime);
    videoElement.addEventListener('loadedmetadata', () => {
      videoElement.play();
    });
  });
  hls.loadSource(url);
  hls.attachMedia(videoElement);
  videoElement.controls = true;
}

/**
 * Takes the current video time and snaps to the previous ad break if it was not
 * played.
 */
function onSeekEnd() {
  if (isLiveStream) {
    return;
  }
  if (isSnapback) {
    isSnapback = false;
    return;
  }
  const currentTime = videoElement.currentTime;
  const previousCuePoint =
      streamManager.previousCuePointForStreamTime(currentTime);
  if (previousCuePoint && !previousCuePoint.played) {
    console.log(
        'Seeking back to ' + previousCuePoint.start + ' and will return to ' +
        currentTime);
    isSnapback = true;
    snapForwardTime = currentTime;
    videoElement.currentTime = previousCuePoint.start;
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
