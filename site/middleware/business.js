(function (nx, global) {

  var url = require('url');
  var fs = require('fs');
  var path = require('path');

  var Business = nx.declare({
    statics: {
      handlerCache: {}
    },
    methods: {
      init: function (inApp) {
        this._app = inApp;
        this._handlerClass = null;
      },
      loadHandlerClass: function () {
        var config = this._app.config;
        var handlerName = config.handlerName;
        var filePath = path.join(config.pwd, 'site', config.busHandlerFolder, handlerName + '.js');
        var HandlerClass;

        if (!fs.existsSync(filePath)) {
          return this.status = 404;
        } else {
          HandlerClass = require(filePath);
          Business.handlerCache[handlerName] = this._handlerClass = new HandlerClass(this._app);
        }
      },
      resolveResponse: function *() {
        var app = this._app;
        try {
          app.body = yield this._handlerClass.doJob() || '';
        } catch (_) {
          console.log(_);
          app.status = 500;
          app.statusText = '[Node server error:500]';
        }
      }
    }
  });


  module.exports = function () {
    return function *(next) {
      var business = new Business(this);
      business.loadHandlerClass();
      yield business.resolveResponse();
      yield next;
    };
  };


}(nx, nx.GLOBAL));







