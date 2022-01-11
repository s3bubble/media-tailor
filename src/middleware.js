videojs.use('*', function(player) {
  return {
    setSource: function(srcObj, next) {
      if (srcObj.src.includes('.mediatailor.')) {
        const mtUrl = new URL(srcObj.src);
        let url = mtUrl.pathname.split('/');
        url[2] = 'session';
        videojs.xhr.post(`${mtUrl.origin}${url.join('/')}`, (err, resp) => {
          const session = JSON.parse(resp.body);
          srcObj.src = `${mtUrl.origin}${session.manifestUrl}`;
          srcObj.type = session.manifestUrl.includes('.mpd') ? 'application/dash+xml' : 'application/x-mpegurl';
          srcObj.tracking = `${mtUrl.origin}${session.trackingUrl}`;
          next(null, srcObj);
        });
      } else {
        next(null, srcObj);
      }
    }
  };
});
