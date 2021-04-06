// This stream will be played if ad-enabled playback fails.
const BACKUP_STREAM =
    'http://storage.googleapis.com/testtopbox-public/video_content/bbb/' +
    'master.m3u8';

// Live stream asset key.
const TEST_ASSET_KEY = 'PSzZMzAkSXCmlJOWDmRj8Q';

// VOD content source and video IDs.
const TEST_CONTENT_SOURCE_ID = '2474148';
const TEST_VIDEO_ID = 'bbb-clear';

// StreamManager which will be used to request ad-enabled streams.
let streamManager;

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

// Companion ad div.
let companionDiv;

// Div showing current ad progress.
let progressDiv;

// Ad UI div.
let adUiDiv;

// Flag tracking if we are currently in snapback mode or not.
let isInSnapbackMode;

// Time to seek to after an ad if that ad was played as the result of snapback.
let snapForwardTime;

// Whether we are currently playing a live stream or a VOD stream
let isLiveStream;

// Whether the stream is currently in an ad break.
let isAdBreak;

// Whether the stream has been started.
let streamStarted;

// Whether the stream is currently playing.
let streamPlaying;

/**
 * Initializes the page.
 */
function initPage() {
  initUI();

  // Install built-in polyfills to patch browser incompatibilities.
  shaka.polyfill.installAll();

  // Check to see if the browser supports the basic APIs Shaka needs.
  if (shaka.Player.isBrowserSupported()) {
    // Everything looks good!
    initPlayer();
  } else {
    // This browser does not have the minimum set of APIs we need.
    console.error('Browser not supported!');
  }
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
  adUiDiv = document.getElementById('ad-ui');
  progressDiv = document.getElementById('progress');
  companionDiv = document.getElementById('companion');

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

  // Create a Player instance.
  shaka = new shaka.Player(videoElement);

  shaka.addEventListener('emsg', (e) => onEmsgEvent(e));
  shaka.addEventListener(
      'timelineregionenter', (e) => onTimelineRegionEnterEvent(e));

  // Attach player to the window to make it easy to access in the JS console.
  window.player = shaka;

  // Listen for error events.
  shaka.addEventListener('error', onStreamError);

  playButton.addEventListener('click', onPlayButtonClick);
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
 * @return{!Object} Key-value dictionary for keys and values in provided query
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
  if (streamStarted) {
    if (streamPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  } else {
    if (liveRadio.checked) {
      requestLiveStream();
    } else {
      requestVODStream();
    }
  }
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
  streamRequest.format = 'dash';
  streamManager.requestStream(streamRequest);
}

/**
 * Loads the stream.
 * @param{!StreamEvent} e StreamEvent fired when stream is loaded.
 */
function onStreamLoaded(e) {
  console.log('Stream loaded');
  loadUrl(e.getStreamData().url);
}

/**
 * Handles stream errors. Plays backup content.
 * @param{!StreamEvent} e StreamEvent fired on stream error.
 */
function onStreamError(e) {
  console.log('Error loading stream, playing backup stream.' + e);
  loadUrl(BACKUP_STREAM);
}

/**
 * Updates the progress div.
 * @param{!StreamEvent} e StreamEvent fired when ad progresses.
 */
function onAdProgress(e) {
  const adProgressData = e.getStreamData().adProgressData;
  const currentAdNum = adProgressData.adPosition;
  const totalAds = adProgressData.totalAds;
  const currentTime = adProgressData.currentTime;
  const duration = adProgressData.duration;
  const remainingTime = Math.floor(duration - currentTime);
  progressDiv.textContent =
      'Ad (' + currentAdNum + ' of ' + totalAds + ') ' + remainingTime + 's';
}

/**
 * Handles ad break started.
 * @param{!StreamEvent} e StreamEvent fired for ad break start.
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
 * @param{!StreamEvent} e Stream event fired for ad break end.
 */
function onAdBreakEnded(e) {
  console.log('Ad Break Ended');
  isAdBreak = false;
  if (!isLiveStream) {
    videoElement.controls = true;
  }
  adUiDiv.style.display = 'none';
  if (snapForwardTime && snapForwardTime > videoElement.currentTime) {
    videoElement.currentTime = snapForwardTime;
    snapForwardTime = null;
  }
  progressDiv.textContent = '';
}

/**
 * Handles ad started and displays companion ad, if any.
 * @param{!StreamEvent} e The STARTED stream event.
 */
function onAdStarted(e) {
  const companionAds = e.getAd().getCompanionAds();
  for (let i = 0; i < companionAds.length; i++) {
    const companionAd = companionAds[i];
    if (companionAd.getWidth() == 728 && companionAd.getHeight() == 90) {
      companionDiv.textContent = companionAd.getContent();
    }
  }
}

/**
 * Loads and plays a Url.
 * @param{string} url
 */
function loadUrl(url) {
  console.log('Loading:' + url);

  shaka.load(url)
      .then(function() {
        // This runs if the asynchronous load is successful.
        if (isLiveStream) {
          videoElement.controls = false;
        }
        document.getElementById('play-button').textContent = 'Play stream';
        streamStarted = true;
      })
      .catch(function(error) {
        console.error('Error loading stream:', error);
      });
}

/**
 * Takes the current video time and snaps to the previous ad break if it was not
 * played.
 */
function onSeekEnd() {
  if (isLiveStream) {
    return;
  }
  if (isInSnapbackMode) {
    isInSnapbackMode = false;
    return;
  }
  const currentTime = videoElement.currentTime;
  const previousCuePoint =
      streamManager.previousCuePointForStreamTime(currentTime);
  if (previousCuePoint && !previousCuePoint.played) {
    console.log(
        'Seeking back to ' + previousCuePoint.start + ' and will return to ' +
        currentTime);
    isInSnapbackMode = true;
    snapForwardTime = currentTime;
    videoElement.currentTime = previousCuePoint.start;
  }
}

/**
 * Shows the video controls so users can resume after stream is paused.
 */
function onStreamPause() {
  if (isAdBreak) {
    if (!isLiveStream) {
      videoElement.controls = true;
    }
    adUiDiv.style.display = 'none';
  }
  streamPlaying = false;
  playButton.textContent = 'Play stream';
}

/**
 * Hides the video controls if resumed during an ad break.
 */
function onStreamPlay() {
  if (isAdBreak) {
    videoElement.controls = false;
    adUiDiv.style.display = 'block';
  }
  streamPlaying = true;
  playButton.textContent = 'Pause stream';
}

/**
 * For DASH emsg events.
 * @param{!shaka.extern.EmsgInfo} event which contains information about an EMSG
 * MP4 box.
 */
function onEmsgEvent(event) {
  handleEventMessage(event.detail.messageData);
}

/**
 * For DASH timelineregionenter events.
 * @param{!shaka.extern.TimelineRegionInfo} event which contains information
 * about a region of the timeline that will cause an event to be raised when the
 * playhead enters or exits it. In DASH this is the EventStream element.
 */
function onTimelineRegionEnterEvent(event) {
  handleEventMessage(
      event.detail.eventElement.attributes.messageData.nodeValue);
}

/**
 * For handling timed metadata events.
 * @param{!Uint8Array} messageData is the body of the metadata message.
 */
function handleEventMessage(messageData) {
  streamManager.onTimedMetadata({'TXXX': messageData});
}
