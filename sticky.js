/**
 * @license Copyright (c) 2015-2018 Radiant Media Player 
 * outstream-ads-gallery 2.0.0 | https://github.com/radiantmediaplayer/outstream-ads-gallery
 */

(function () {

  'use strict';

  var elementID = 'rmpPlayer';
  var container = document.getElementById(elementID);
  var stickyContainer = document.getElementById('sticky-container');

  if (!container || !stickyContainer) {
    return;
  }

  var settings = {
    licenseKey: 'Y2tlcXNpcWtpaSEqXyV2NT1pZ2N2MnllaT9yb201ZGFzaXMzMGRiMEElXyo=',
    // we use autoHeightMode and size our stickyContainer with media queries CSS
    autoHeightMode: true,
    autoplay: true,
    ads: true,
    // by default we use Google IMA but we can also use rmp-vast for outstream ads
    adParser: 'rmp-vast',
    adOutStream: true,
    skin: 'outstream',
    adTagReloadOnEnded: false,
    // fade-in/fade-out effects are applied on sticky-container so we do not need them on the player 
    fadeInPlayer: false,
    //adTagUrl: 'http://publisher.cerfmedia.com/vtest.php',
    adTagUrl: 'http://search.spotxchange.com/vast/2.0/85394?VPAID=JS&content_page_url=http%3A%2F%2Fwww.example.com%2Fvideos%2Fexample&cb=67832734&player_width=600&player_height=360_',
    //adTagUrl: 'https://www.radiantmediaplayer.com/vast/tags/inline-linear-2.xml',
    // we use client-side waterfalling in this case (optional)
    adTagWaterfall: [
      //'https://www.radiantmediaplayer.com/vast/tags/inline-linear-1.xml'
      'http://publisher.cerfmedia.com/vtest.php'
    ]
  };

  // new player instance
  var rmp = new RadiantMP(elementID);

  var _trace = function (input) {
    if (window.console.trace && input) {
      window.console.trace(input);
    }
  };

  // when destroy method finishes we clear listeners and remove stickyContainer from DOM
  var _onDestroyCompleted = function () {
    container.removeEventListener('destroycompleted', _onDestroyCompleted);
    var parent = stickyContainer.parentNode;
    if (parent) {
      try {
        parent.removeChild(stickyContainer);
      } catch (e) {
        _trace(e);
      }
    }
  };

  // stickyContainer needs be removed from page 
  // first we need to destroy it
  var _removePlayer = function () {
    container.addEventListener('destroycompleted', _onDestroyCompleted);
    rmp.destroy();
  };

  // function to fade in sticky container
  var _showPlayer = function () {
    container.removeEventListener('adstarted', _showPlayer);
    stickyContainer.style.opacity = 1;
    stickyContainer.style.visibility = 'visible';
  };

  // function to fade out sticky container
  var _endPlayer = function () {
    container.removeEventListener('autoplayfailure', _endPlayer);
    container.removeEventListener('adcontentresumerequested', _endPlayer);
    container.removeEventListener('addestroyed', _endPlayer);
    stickyContainer.style.opacity = 0;
    stickyContainer.style.visibility = 'hidden';
    setTimeout(function () {
      _removePlayer();
    }, 400);
  };


  container.addEventListener('ready', function () {
    // if Google IMA has been blocked by an ad-blocker or failed to load
    // we need to remove the player from DOM
    if (rmp.getAdParserBlocked()) {
      _removePlayer();
      return;
    }
  });
  // we have adstarted - we fade in player
  container.addEventListener('adstarted', _showPlayer);
  // when ad ends - adcontentresumerequested event for Google IMA or addestroyed event for rmp-vast 
  // we fade out player and remove it from DOM
  // in case of autoplayfailure event we also need to remove it - note that autoplayfailure should 
  // be infrequent if you are using muted autoplay as recommended
  // whichever comes first
  container.addEventListener('autoplayfailure', _endPlayer);
  container.addEventListener('adcontentresumerequested', _endPlayer);
  container.addEventListener('addestroyed', _endPlayer);

  rmp.init(settings);

})();
