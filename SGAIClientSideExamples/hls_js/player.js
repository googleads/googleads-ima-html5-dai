// Instance of the Hls.js that handles the main content stream.
let contentHandler;
// Instance of the Hls.js that handles ad breaks.
let adsHandler;
// The reference to the IMA SDK stream manager, set when the stream is loaded.
let streamManager;
// The DAI session ID, set following STREAM_INITIALIZED event, after the
// PodStreamRequest is successful.
let streamId;

// DOM element references
const setSampleContentStreamButton =
    document.getElementById("content-stream-sample");
const setSampleAdBreakParamsButton = document.getElementById("ad-break-sample");

const contentStreamUrlInput = document.getElementById("content-stream-url");
const networkCodeInput = document.getElementById("network-code");
const customAssetKeyInput = document.getElementById("custom-asset-key");
const playContentStreamButton = document.getElementById("play-content-stream");
const secondsUntilAdBreakInput = document.getElementById("seconds-to-ad-break");
const insertAdBreakButton = document.getElementById("insert-ad-break");
const resumeAdButton = document.getElementById("resume-ad");

// Container for IMA SDK to display ad UI elements.
const adUiElement = document.getElementById("ad-ui");
const videoElement = document.getElementById("video");
const logElement = document.getElementById("log");

/**
 * Initializes the page, including HLS.js instances and the IMA StreamManager.
 * This is the main entry point.
 */
function init() {
  initContentHandler();
  initAdsHandler();
  initiateStreamManager();

  insertAdBreakButton.onclick = insertAdBreak;
  playContentStreamButton.onclick = (e) => {
    e.preventDefault();
    // Makes a stream request to Google Ad Manager.
    registerLivestreamSession(
      networkCodeInput.value,
      customAssetKeyInput.value
    );
    playContentStreamButton.disabled = true;
    insertAdBreakButton.disabled = false;
    // Loads the content stream and plays it automatically.
    loadContentStream();
  };
}

/**
 * Initializes the HLS.js instance that loads and parses the content m3u8
 * playlist.
 */
function initContentHandler() {
  contentHandler = new Hls();
  contentHandler.on(Hls.Events.MANIFEST_PARSED, () => {
    contentHandler.attachMedia(videoElement);
  });
  contentHandler.on(Hls.Events.MEDIA_ATTACHED, () => {
    setStatus("Content is playing");
    videoElement.play();
  });
}

/**
 * Initializes the HLS.js instance that loads and parses the ad pod manifest.
 */
function initAdsHandler() {
  adsHandler = new Hls();
  adsHandler.on(Hls.Events.MEDIA_ATTACHED, () => {
    // Auto play the ad stream as soon as the player is ready.
    setStatus("Ad break is playing");
    videoElement.play();
  });
  // Listener to process ID3 metadata for the stream manager.
  adsHandler.on(Hls.Events.FRAG_PARSING_METADATA, (event, data) => {
    if (streamManager && data) {
      data.samples.forEach((sample) => {
        streamManager.processMetadata("ID3", sample.data, sample.pts);
      });
    }
  });
}

/**
 * Inserts an ad break into the content stream.
 * @param {!Event} e - the event object
 */
function insertAdBreak(e) {
  e.preventDefault();
  insertAdBreakButton.disabled = true;
  const adsManifestParsingPromise = new Promise((resolve, reject) => {
    adsHandler.on(Hls.Events.MANIFEST_PARSED, resolve);
    adsHandler.on(Hls.Events.ERROR, reject);
  });

  // Schedule the ad break to start by `secondsUntilAdBreak`.
  const adBreakTimingPromise = new Promise((resolve) => {
    let secondsUntilAdBreak = parseInt(secondsUntilAdBreakInput.value);
    setTimeout(resolve, 1000 * secondsUntilAdBreak);
    const timer = setInterval(() => {
      setStatus("Ad break starting in " + secondsUntilAdBreak + " seconds");
      secondsUntilAdBreak--;
      if (secondsUntilAdBreak < 1) {
        clearInterval(timer);
      }
    }, 1000);
  });

  // Create an ad pod identifier. In production app, this identifier value must
  // be the same for all concurrent viewers to request the ad pod at the same
  // ad break time.
  const adBreakId = Math.floor(videoElement.currentTime * 1000000);
  // Construct the ad pod request URL for the next ad break.
  const adPodUrl = `https://dai.google.com/linear/pods/v1/hls/network/${networkCodeInput.value}/custom_asset/${customAssetKeyInput.value}/ad_break_id/ab${adBreakId}.m3u8?stream_id=${streamId}&pd=31000`;
  log(`Ad break request: ${adPodUrl}`);
  adsHandler.loadSource(adPodUrl);
  // When the scheduled time has come and the ad pod manifest is parsed, set the
  // `videoElement` to play ads.
  Promise.all([adsManifestParsingPromise, adBreakTimingPromise]).then(() => {
    contentHandler.once(Hls.Events.MEDIA_DETACHED, () => {
      adsHandler.attachMedia(videoElement);
    });
    contentHandler.detachMedia();
  });
}

/**
 * Loads the content stream.
 */
function loadContentStream() {
  insertAdBreakButton.disabled = false;
  contentHandler.loadSource(contentStreamUrlInput.value);
}

/**
 * Resumes the content stream following an ad break.
 */
function resumeContentStream() {
  insertAdBreakButton.disabled = false;
  contentHandler.attachMedia(videoElement);
}

/**
 * Creates the IMA StreamManager and sets ad event listeners.
 */
function initiateStreamManager() {
  if (!streamManager) {
    // The adUiElement is the container object for ad UI elements.
    streamManager = new google.ima.dai.api.StreamManager(
      videoElement,
      adUiElement
    );
    // Register listeners for various stream events.
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.STREAM_INITIALIZED, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.ERROR, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.CLICK, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.STARTED, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.FIRST_QUARTILE, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.MIDPOINT, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.THIRD_QUARTILE, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.COMPLETE, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.AD_PROGRESS, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.PAUSED, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.RESUMED, onStreamEvent);
  }
  // Setup for the resume ad button. Needed when IMA pauses ads when the user
  // navigates to to the clickthrough URL.
  resumeAdButton.onclick = (e) => {
    e.preventDefault();
    videoElement.play();
    resumeAdButton.disabled = true;
  };
}

/**
 * Registers a SGAI livestream session with the stream manager.
 * @param {string} networkCode - Google Ad Manager network code.
 * @param {string} customAssetKey - the DAI livestream custom asset key.
 */
function registerLivestreamSession(networkCode, customAssetKey) {
  const streamRequest = new google.ima.dai.api.PodStreamRequest();
  // Find your Google Ad Manager network code.
  // https://support.google.com/admanager/answer/7674889?#network-code
  streamRequest.networkCode = networkCode;
  // Google DAI livestream custom asset key.
  streamRequest.customAssetKey = customAssetKey;
  // Register a streaming session on Google Ad Manager DAI servers.
  streamManager.requestStream(streamRequest);
}

/**
 * Handle stream events
 * @param {!Event} e - the event object
 */
function onStreamEvent(e) {
  switch (e.type) {
    case google.ima.dai.api.StreamEvent.Type.STREAM_INITIALIZED:
      // Save the ad stream session ID to construct ad pod requests.
      streamId = e.getStreamData().streamId;
      log("SGAI stream registration succeeded. Session ID: " + streamId);
      break;
    case google.ima.dai.api.StreamEvent.Type.ERROR:
      setStatus("Error playing ads");
      log("ERROR: " + e.getStreamData().errorMessage);
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:
      log("Ad break started");
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
      log("Ad break ended");
      adsHandler.detachMedia();
      resumeContentStream();
      break;
    case google.ima.dai.api.StreamEvent.Type.PAUSED:
      resumeAdButton.disabled = false;
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_PROGRESS:
      //  Avoid logging AD_PROGRESS events.
      break;
    default:
      logEvent(e);
      break;
  }
}

/**
 * Sets the status of the video element.
 * @param {string} status - The message to set.
 */
function setStatus(status) {
  document.getElementById("video-status").textContent = status;
}

/**
 * Simple wrapper function for logging.
 * @param {string} text - The message to log
 */
function log(text) {
  console.log(text);
  logElement.innerText = text + "\n" + logElement.innerText;
}

/**
 * Format ad event for logging.
 * @param {!Event} event - The ad event object
 */
function logEvent(event) {
  const ad = event.getAd();
  const adPodInfo = ad ? ad.getAdPodInfo() : null;
  const eventType = event.type;
  log("Stream manager event: " + eventType);
  if (ad) {
    const title = ad.getTitle() || "<no-title>";
    const position = adPodInfo ? adPodInfo.getAdPosition() : 0;
    const totalAds = adPodInfo ? adPodInfo.getTotalAds() : 0;
    log(`Ad ${position}/${totalAds}: ${title} - Event: ${eventType}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init();
});
