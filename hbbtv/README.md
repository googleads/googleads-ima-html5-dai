# HbbTV Linear Sample App with IMA HTML5 DAI SDK

This HbbTV linear sample app demonstrates the IMA HTML5 DAI SDK integration. It
uses HbbTV stream events for detecting ad breaks and
[dash.js](https://github.com/Dash-Industry-Forum/dash.js/)
(version 4.6.0 or later) for ad playback. This application is intended to run
as an HbbTV app on a compatible device.

## Key Features

* **Stream Events:** The app listens for HbbTV broadcast events of upcoming ad
breaks.
* **Preloading:** The app initiates DAI pod serving ad requests and passes the
ad pod manifest to dash.js for preloading.
* **Ad Break Handling:** The app listens for HbbTV events to switch from the
broadcast stream to play the broadband ad break and resumes seamlessly
afterward.

## Requirements

* HbbTV-compliant device
* dash.js version 4.6.0 or later
* Web server to host the application

## Testing Environment Setup

1. **Broadcast Stream:** Prepare an audio/video stream containing custom AIT
(Application Information Table) data.
2. **DVB Modulator:** Configure a DVB modulator to transmit the broadcast stream
for reception by the hybrid terminal.
3. **Web Server:** Host the HbbTV application on a web server accessible by the
hybrid terminal.

For detailed instructions on setting up your testing environment, refer to this
guide on [running an HbbTV application](https://developer.hbbtv.org/tutorials/running-a-hbbtv-application-on-a-hybrid-terminal/).

## How to Run

Set the `stream_event_id` to match your networks event ID in `streamevent.xml`.
The IMA team used the value `1` for testing this app.
