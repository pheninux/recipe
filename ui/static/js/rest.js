window.cngRestManager = new function () {
    var _self = this;
    // var _restLogger = cngLoggerManager.createLogger('REST');
    //
    // _self.debugEnabled = debugEnabled ? true : false;
    //
    // _self.longuestRequest = {};
    // _self.longuestRequest.executionTime = 0;
    // _self.longuestRequest.url = '';
    // _self.longuestRequest.type = 'unknown';
    // _self.requestCache = {};
    //
    // jQuery.support.cors = true;

    /*
     * for debug info
     */
    _self.toDebugAlert = function () {
        _restLogger.info('rest longuest event infos : ');
        _restLogger.info('    [' + _self.longuestRequest.url + '] url');
        _restLogger.info('    [' + _self.longuestRequest.executionTime + ']ms executionTime');
        _restLogger.info('    [' + _self.longuestRequest.type + '] type');
    };

    /*
     * default function called in case of asynchronous request success
     * @param response : contains response data from server
     */
    function requestSuccessfull(response) {
        console.debug('<< asynchronous request in success');
        if (response != null && typeof (response) !== 'undefined') {
            console.debug('<<  data response is [' + JSON.stringify(response) + ']');
        } else {
            console.debug('<<  no data response');
        }
    }

    /*
     * default function called in case of asynchronous request error
     * @param jqXHR : contains the XHR used to make the request
     * @param textStatus : contains the textError status
     * @param errorThrown : if available the error that was thrown
     * @calledUrl : the original url that was called to make the request
     */
    function consoledebug(jqXHR, textStatus, errorThrown, calledUrl) {
        _restLogger.error('<< asynchronous request in error');
        _restLogger.error('<<  url was [' + calledUrl + ']');
        _restLogger.error('<<  failed textStatus is [' + textStatus + ']');
        _restLogger.error('<<  errorThrown is [' + errorThrown + ']');
        _restLogger.error('<<  jqXHR responseText is [' + jqXHR.responseText + ']');
    }

    /*
     * function used to replace pattern such as {key} by their values in objectToUse passed in second argument
     * @param urlPath : string containing the url with keys to replace
     * @param objectToUse : object containing the attributes values used to replace keys
     * @return string : the url with replaced keys
     * @throws CngException when not all keys can be replaced
     */
    this.dynamiseUrlPath = function (urlPath, objectToUse) {
        console.debug('dynamiseUrlPath IN [' + urlPath + ']');

        var openBracketArr = urlPath.match(/{/g);
        var closeBracketArr = urlPath.match(/}/g);
        /* KO, if numbers of open and close bracket is not the same */
        if (!(openBracketArr.length === closeBracketArr.length)) {
            _restLogger.error("the following url [" + urlPath + "] is incorrect");
        }

        var urlProcessed = urlPath;

        var key;
        for (key in objectToUse) {
            // Fix for ie
            if (objectToUse.hasOwnProperty(key) && !$.isArray(objectToUse[key])) {
                urlProcessed = urlProcessed.replace("{" + key + "}", objectToUse[key]);
            }
        }

        /* get all tokens as accolade PathVariable accolade */
        var nonReplacedToken = urlProcessed.match(/\{(\w+)\}/g);
        /* test if there is missing entry below the REST url */
        if (nonReplacedToken) {
            _restLogger.error("there are missing key/values in objectToUse following url [" + urlProcessed + "] is incorrect");
        }

        console.debug('dynamiseUrlPath OUT with [' + urlProcessed + ']');

        return urlProcessed;
    };

    /*
     * function called to make an asynchronous request to the business layer with a partial url
     * @param urlPath : url to use to make the request such as http://...
     * @param doGet : use to tell if the request must be made in GET(when value is true), POST (false) or specific type(HEAD,...)
     * @param successfulFunc : function to call when the request is in success, see cngRestManager.requestSuccessful() to see function args
     * @param errorFunc : function to call in case of error, see cngRestManager.console.debug() to see function args
     * @param data : the data to send in http body request warning don't forget to set contentType according to your business layer consumes method annotation
     * @param acceptType : used to parse if needed the response from server in case of 'application/json' for example. correspond to your business layer produce method annotation
     *                     if server returns just a string set this to 'text/plain'
     * @param contentType : use to set data content type mandatory when setting data if not data will not be send
     * @param timeout : use to set a maximum time to wait response from server. value is in ms
     *
     */
    this.doAsynchronousServerQueryWithFullPath = function (urlPath, doGet, successfulFunc, errorFunc, data, acceptType, contentType, timeout, useCookies, cached) {
        console.debug('>> doRestServerQuery with :');
        console.debug('>>  urlPath [' + urlPath + ']');
        console.debug('>>  doGet [' + doGet + ']');
        console.debug('>>  async [true]');

        var localsuccessfulFunc = successfulFunc || requestSuccessfull;
        var localErrorFunc = errorFunc || console.debug;
        var localDoGet = doGet || false;
        var localData = data;
        var localAcceptType = (acceptType === 'application/json') ? 'json' : 'text';
        var start;

        var requestType = (localDoGet === true) ? "GET" : ((localDoGet === false) ? "POST" : localDoGet);
        if (localData != null) {
            console.debug('>>  data[' + JSON.stringify(data) + ']');
        } else {
            console.debug('>>  no data');
        }

        if (cached && _self.requestCache.hasOwnProperty(urlPath)) {
            console.debug('>>  returning cached request ' + urlPath);
            localsuccessfulFunc(_self.requestCache[urlPath]);
            return;
        }

        var proxySuccess = function (response) {
            if (cached) {
                console.debug('>>  caching request ' + urlPath);
                _self.requestCache[urlPath] = response;
            }
            localsuccessfulFunc(response);
        };

        var ajaxSettings = {
            url: urlPath,
            type: requestType,
            crossDomain: true,
            dataType: localAcceptType,
            cache: true,
            error: function (jqXHR, textStatus, errorThrown) {
                if (_self.debugEnabled) {
                    var end = new Date().getTime();

                    if (end - start > _self.longuestRequest.executionTime) {
                        _self.longuestRequest.url = urlPath;
                        _self.longuestRequest.executionTime = end - start;
                        _self.longuestRequest.type = 'async';
                    }
                }

                try {
                    localErrorFunc(jqXHR, textStatus, errorThrown, this.url);
                } catch (error) {
                    _restLogger.error('error call console.debug[' + error.stack ? error.stack : error + ']');
                }
            },
            success: function (data, textStatus, jqXHR) {
                if (_self.debugEnabled) {
                    var end = new Date().getTime();

                    if (end - start > _self.longuestRequest.executionTime) {
                        _self.longuestRequest.url = urlPath;
                        _self.longuestRequest.executionTime = end - start;
                        _self.longuestRequest.type = 'async';
                    }
                }

                var result = null;

                if (jqXHR.status === 200 || jqXHR.status === 201 || jqXHR.status === 204) {
                    result = data;
                }
                try {
                    proxySuccess(result);
                } catch (error) {
                    _restLogger.error('error call requestSuccess[' + error.stack ? error.stack : error + ']');
                }
            }
        };

        if (contentType === 'multipart/form-data') {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {data: localData, processData: false, contentType: false});
        } else if (localData != null && contentType != null) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {data: localData, contentType: contentType});
        }

        if (timeout != null && !isNaN(parseInt(timeout, 10))) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {timeout: timeout});
        } else {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {timeout: defaultWebServiceRequestTimeoutInSec * 1000});
        }

        ajaxSettings = addCookiesIfNeeded(ajaxSettings, useCookies);

        if (_self.debugEnabled) {
            start = new Date().getTime();
        }
        jQuery.ajax(ajaxSettings);
    };

    /*
     * same function as doAsynchronousServerQueryWithFullPath with credentials
     */
    this.doIASAsynchronousServerQueryWithFullPath = function (urlPath, doGet, successfulFunc, errorFunc, data, acceptType, contentType, timeout) {
        console.debug('>> doRestServerQuery with :');
        console.debug('>>  urlPath [' + urlPath + ']');
        console.debug('>>  doGet [' + doGet + ']');
        console.debug('>>  async [true]');

        var localsuccessfulFunc = successfulFunc || requestSuccessfull;
        var localErrorFunc = errorFunc || console.debug;
        var localDoGet = doGet || false;
        var localData = data;
        var localAcceptType = (acceptType === 'application/json') ? 'json' : 'text';
        var start;

        var requestType = (localDoGet === true) ? "GET" : ((localDoGet === false) ? "POST" : localDoGet);
        if (localData != null) {
            console.debug('>>  data[' + JSON.stringify(data) + ']');
        } else {
            console.debug('>>  no data');
        }

        var ajaxSettings = {
            url: urlPath,
            type: requestType,
            crossDomain: true,
            dataType: localAcceptType,
            cache: false,
            xhrFields: {
                withCredentials: true
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (_self.debugEnabled) {
                    var end = new Date().getTime();

                    if (end - start > _self.longuestRequest.executionTime) {
                        _self.longuestRequest.url = urlPath;
                        _self.longuestRequest.executionTime = end - start;
                        _self.longuestRequest.type = 'async';
                    }
                }

                try {
                    localErrorFunc(jqXHR, textStatus, errorThrown, this.url);
                } catch (error) {
                    _restLogger.error('error call console.debug[' + error.stack ? error.stack : error + ']');
                }
            },
            success: function (data, textStatus, jqXHR) {
                if (_self.debugEnabled) {
                    var end = new Date().getTime();

                    if (end - start > _self.longuestRequest.executionTime) {
                        _self.longuestRequest.url = urlPath;
                        _self.longuestRequest.executionTime = end - start;
                        _self.longuestRequest.type = 'async';
                    }
                }

                var result = null;

                if (jqXHR.status === 200 || jqXHR.status === 201 || jqXHR.status === 204) {
                    result = data;
                }
                try {
                    localsuccessfulFunc(result);
                } catch (error) {
                    _restLogger.error('error call requestSuccess[' + error.stack ? error.stack : error + ']');
                }
            }
        };

        if (localData != null && contentType != null) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {data: localData, contentType: contentType});
        }

        if (timeout != null && !isNaN(parseInt(timeout, 10))) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {timeout: timeout});
        } else {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {timeout: defaultWebServiceRequestTimeoutInSec * 1000});
        }

        if (_self.debugEnabled) {
            start = new Date().getTime();
        }
        jQuery.ajax(ajaxSettings);
    };

    /*
     * same as doAsynchronousServerQueryWithFullPath but don't trace data send
     */
    this.doSecretAsynchronousServerQueryWithFullPath = function (urlPath, doGet, successfulFunc, errorFunc, data, acceptType, contentType, timeout) {
        console.debug('>> doRestServerQuery with :');
        console.debug('>>  urlPath [' + urlPath + ']');
        console.debug('>>  doGet [' + doGet + ']');
        console.debug('>>  async [true]');

        var localsuccessfulFunc = successfulFunc || requestSuccessfull;
        var localErrorFunc = errorFunc || console.debug;
        var localDoGet = doGet || false;
        var localData = data;
        var localAcceptType = (acceptType === 'application/json') ? 'json' : 'text';
        var start;

        var requestType = (localDoGet === true) ? "GET" : ((localDoGet === false) ? "POST" : localDoGet);

        var ajaxSettings = {
            url: urlPath,
            type: requestType,
            crossDomain: true,
            dataType: localAcceptType,
            cache: true,
            error: function (jqXHR, textStatus, errorThrown) {
                if (_self.debugEnabled) {
                    var end = new Date().getTime();

                    if (end - start > _self.longuestRequest.executionTime) {
                        _self.longuestRequest.url = urlPath;
                        _self.longuestRequest.executionTime = end - start;
                        _self.longuestRequest.type = 'async';
                    }
                }

                try {
                    localErrorFunc(jqXHR, textStatus, errorThrown, this.url);
                } catch (error) {
                    _restLogger.error('error call console.debug[' + error.stack ? error.stack : error + ']');
                }
            },
            success: function (data, textStatus, jqXHR) {
                if (_self.debugEnabled) {
                    var end = new Date().getTime();

                    if (end - start > _self.longuestRequest.executionTime) {
                        _self.longuestRequest.url = urlPath;
                        _self.longuestRequest.executionTime = end - start;
                        _self.longuestRequest.type = 'async';
                    }
                }

                var result = null;

                if (jqXHR.status === 200 || jqXHR.status === 201 || jqXHR.status === 204) {
                    result = data;
                }
                try {
                    localsuccessfulFunc(result);
                } catch (error) {
                    _restLogger.error('error call requestSuccess[' + error.stack ? error.stack : error + ']');
                }
            }
        };

        if (localData != null && contentType != null) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {data: localData, contentType: contentType});
        }

        if (timeout != null && !isNaN(parseInt(timeout, 10))) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {timeout: timeout});
        } else {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {timeout: defaultWebServiceRequestTimeoutInSec * 1000});
        }

        if (_self.debugEnabled) {
            start = new Date().getTime();
        }
        jQuery.ajax(ajaxSettings);
    };

    function addCookiesIfNeeded(ajaxSettings, useCookies) {
        if (useCookies) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {xhrFields: {withCredentials: true, responseType: 'text'}});
        }
        return ajaxSettings;
    }

    function addCookiesIfNeededJSON(ajaxSettings, useCookies) {
        if (useCookies) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {
                beforeSend: function (xhr) {
                    xhr.withCredentials = true;
                    xhr.responseType = 'json'
                }
            });
        }
        return ajaxSettings;
    }

    /*
     * function called to make an synchronous request to the business layer with a complete url
     * @param urlPath : url to use to make the request such as http://...
     * @param doGet : use to tell if the request must be made in GET(when value is true), POST (false) or specific type(HEAD,...)
     * @param data : the data to send in http body request warning don't forget to set contentType according to your business layer consumes method annotation
     * @param acceptType : used to parse if needed the response from server in case of 'application/json' for example. correspond to your business layer produce method annotation
     *                     if server returns just a string set this to 'text/plain'
     * @param contentType : use to set data content type mandatory when setting data if not data will not be send
     * @param timeout : use to set a maximum time to wait response from server. value is in ms
     * @param headers : the header of the request
     * @return string / object : response from server if response was json and acceptType was set to 'application/json' return parsed object
     */
    this.doSynchronousServerQueryWithFullPath = function (urlPath, doGet, data, acceptType, contentType, timeout, headers, useCookies, cached) {
        console.debug('>> doSynchronousServerQueryWithFullPath with :');
        console.debug('>>  urlPath [' + urlPath + ']');
        console.debug('>>  doGet [' + doGet + ']');
        console.debug('>>  async [false]');
        console.debug('>>  headers [' + headers + ']');

        var localDoGet = doGet || false;
        var localData = data;
        var localAcceptType = (acceptType === 'application/json') ? 'json' : 'text';
        var localHeaders = headers;

        var requestType = (localDoGet === true) ? "GET" : ((localDoGet === false) ? "POST" : localDoGet);
        if (localData != null) {
            console.debug('>>  data[' + JSON.stringify(data) + ']');
        } else {
            console.debug('>>  no data');
        }

        var result = null;

        if (cached && _self.requestCache.hasOwnProperty(urlPath)) {
            console.debug('>>  returning cached request ' + urlPath);
            return _self.requestCache[urlPath];
        }

        var ajaxSettings = {
            url: urlPath,
            type: requestType,
            crossDomain: true,
            dataType: localAcceptType,
            async: false,
            cache: true,
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('<< synchronous request in error');
                try {
                    console.debug(jqXHR, textStatus, errorThrown, this.url);
                } catch (error) {
                    console.error('<< error call console.debug[' + error.stack ? error.stack : error + ']');
                }
            },
            success: function (data, textStatus, jqXHR) {
                if (jqXHR.status === 200 || jqXHR.status === 201 || jqXHR.status === 204) {
                    console.debug('<< synchronous request in success');
                    if (data != null && typeof (data) !== 'undefined') {
                        console.debug('<<  data response is [' + JSON.stringify(data) + ']');
                    } else {
                        console.debug('<<  no data response');
                    }
                    result = data;

                    if (cached) {
                        console.debug('>>  caching request ' + urlPath);
                        _self.requestCache[urlPath] = data;
                    }
                }
            }
        };

        if (localData != null && contentType != null) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {data: localData, contentType: contentType});
        }

        if (timeout != null && !isNaN(parseInt(timeout, 10))) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {timeout: timeout});
        } else {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {timeout: defaultWebServiceRequestTimeoutInSec * 1000});
        }

        if (localHeaders != null) {
            var headers;
            for (var header in localHeaders) {
                headers[header] = localHeaders[header];
            }
            ajaxSettings.headers = headers;
        }

        ajaxSettings = addCookiesIfNeeded(ajaxSettings, useCookies);

        if (_self.debugEnabled) {
            var start = new Date().getTime();
            jQuery.ajax(ajaxSettings);
            var end = new Date().getTime();

            if (end - start > _self.longuestRequest.executionTime) {
                // _self.longuestRequest.url = urlPath;
                // _self.longuestRequest.executionTime = end - start;
                // _self.longuestRequest.type = 'sync';
            }
        } else {
            jQuery.ajax(ajaxSettings);
        }

        return result;
    };
    /*
     * function called to make an synchronous request to the business layer with a complete url
     * @param urlPath : url to use to make the request such as http://...
     * @param doGet : use to tell if the request must be made in GET(when value is true), POST (false) or specific type(HEAD,...)
     * @param data : the data to send in http body request warning don't forget to set contentType according to your business layer consumes method annotation
     * @param acceptType : used to parse if needed the response from server in case of 'application/json' for example. correspond to your business layer produce method annotation
     *                     if server returns just a string set this to 'text/plain'
     * @param contentType : use to set data content type mandatory when setting data if not data will not be send
     * @param timeout : use to set a maximum time to wait response from server. value is in ms
     * @param headers : the header of the request
     * @return string / object : response from server if response was json and acceptType was set to 'application/json' return parsed object
     */
    this.doSynchronousServerQueryWithFullPathJSON = function (urlPath, requestType, data, acceptType, contentType, timeout, headers, useCookies, cached) {
        console.debug('>> doSynchronousServerQueryWithFullPath with :');
        console.debug('>>  urlPath [' + urlPath + ']');
        console.debug('>>  requestType [' + requestType + ']');
        console.debug('>>  async [false]');
        console.debug('>>  headers [' + headers + ']');

        var localData = data;
        var localAcceptType = (acceptType === 'application/json') ? 'json' : 'text';
        var localHeaders = headers;

        var type = (requestType === true) ? "GET" : ((requestType === false) ? "POST" : localDoGet);

        if (localData != null) {
            console.debug('>>  data[' + JSON.stringify(data) + ']');
        } else {
            console.debug('>>  no data');
        }

        var result = null;

        if (cached && _self.requestCache.hasOwnProperty(urlPath)) {
            console.debug('>>  returning cached request ' + urlPath);
            return _self.requestCache[urlPath];
        }

        var ajaxSettings = {
            url: urlPath,
            type: type,
            crossDomain: true,
            dataType: localAcceptType,
            async: false,
            cache: true,
            error: function (jqXHR, textStatus, errorThrown) {
                _restLogger.error('<< synchronous request in error');
                try {
                    console.debug(jqXHR, textStatus, errorThrown, this.url);
                } catch (error) {
                    _restLogger.error('<< error call console.debug[' + error.stack ? error.stack : error + ']');
                }
            },
            success: function (_data, textStatus, jqXHR) {
                if (jqXHR.status === 200 || jqXHR.status === 201 || jqXHR.status === 204) {
                    console.debug('<< synchronous request in success');
                    data = _data.data;
                    if (data != null && typeof (data) !== 'undefined') {
                        console.debug('<<  data response is [' + JSON.stringify(data) + ']');
                    } else {
                        console.debug('<<  no data response');
                    }
                    result = data;

                    if (cached) {
                        console.debug('>>  caching request ' + urlPath);
                        _self.requestCache[urlPath] = data;
                    }
                }
            }
        };

        if (localData != null && contentType != null) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {data: localData, contentType: contentType});
        }

        if (timeout != null && !isNaN(parseInt(timeout, 10))) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {timeout: timeout});
        } else {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {timeout: defaultWebServiceRequestTimeoutInSec * 1000});
        }

        if (localHeaders != null) {
            var headers;
            for (var header in localHeaders) {
                headers[header] = localHeaders[header];
            }
            ajaxSettings.headers = headers;
        }

        ajaxSettings = addCookiesIfNeededJSON(ajaxSettings, useCookies);

        if (_self.debugEnabled) {
            var start = new Date().getTime();
            jQuery.ajax(ajaxSettings);
            var end = new Date().getTime();

            if (end - start > _self.longuestRequest.executionTime) {
                _self.longuestRequest.url = urlPath;
                _self.longuestRequest.executionTime = end - start;
                _self.longuestRequest.type = 'sync';
            }
        } else {
            jQuery.ajax(ajaxSettings);
        }

        return result;
    };
    /*
     * same as doSynchronousServerQueryWithFullPath but result is json returned like{"returnCode":[...], "data":[...]}
     */
    this.doSynchronousServerQueryWithFullPathAndFullRestReturn = function (urlPath, doGet, data, acceptType, contentType, timeout) {
        console.debug('>> doSynchronousServerQueryWithFullPath with :');
        console.debug('>>  urlPath [' + urlPath + ']');
        console.debug('>>  doGet [' + doGet + ']');
        console.debug('>>  async [false]');

        var localDoGet = doGet || false;
        var localData = data;
        var localAcceptType = (acceptType === 'application/json') ? 'json' : 'text';

        var requestType = (localDoGet === true) ? "GET" : ((localDoGet === false) ? "POST" : localDoGet);
        if (localData != null) {
            console.debug('>>  data[' + JSON.stringify(data) + ']');
        } else {
            console.debug('>>  no data');
        }

        var result = null;

        var ajaxSettings = {
            url: urlPath,
            type: requestType,
            crossDomain: true,
            dataType: localAcceptType,
            async: false,
            cache: true,
            error: function (jqXHR, textStatus, errorThrown) {
                _restLogger.error('<< synchronous request in error');
                try {
                    console.debug(jqXHR, textStatus, errorThrown, this.url);
                } catch (error) {
                    _restLogger.error('<< error call console.debug[' + error.stack ? error.stack : error + ']');
                }
                result = {"returnCode": jqXHR.status, "data": errorThrown};
            },
            success: function (data, textStatus, jqXHR) {
                if (jqXHR.status === 200 || jqXHR.status === 201 || jqXHR.status === 204) {
                    console.debug('<< synchronous request in success');
                    if (data != null && typeof (data) !== 'undefined') {
                        console.debug('<<  data response is [' + JSON.stringify(data) + ']');
                    } else {
                        console.debug('<<  no data response');
                    }
                    result = {"returnCode": jqXHR.status, "data": data};
                }
            }
        };

        if (localData != null && contentType != null) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {data: localData, contentType: contentType});
        }

        if (timeout != null && !isNaN(parseInt(timeout, 10))) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {timeout: timeout});
        } else {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {timeout: defaultWebServiceRequestTimeoutInSec * 1000});
        }

        if (_self.debugEnabled) {
            var start = new Date().getTime();
            jQuery.ajax(ajaxSettings);
            var end = new Date().getTime();

            if (end - start > _self.longuestRequest.executionTime) {
                _self.longuestRequest.url = urlPath;
                _self.longuestRequest.executionTime = end - start;
                _self.longuestRequest.type = 'sync';
            }
        } else {
            jQuery.ajax(ajaxSettings);
        }

        return result;
    };

    /*
     * same as doSynchronousServerQueryWithFullPath but don't trace data send
     */
    this.doSecretSynchronousServerQueryWithFullPath = function (urlPath, doGet, data, acceptType, contentType, timeout) {
        console.debug('>> doSecretSynchronousServerQueryWithFullPath');
        console.debug('>>  urlPath [' + urlPath + ']');
        console.debug('>>  doGet [' + doGet + ']');
        console.debug('>>  async [false]');

        var localDoGet = doGet || false;
        var localData = data;
        var localAcceptType = (acceptType === 'application/json') ? 'json' : 'text';
        var requestType = (localDoGet === true) ? "GET" : "POST";
        var result = null;

        var ajaxSettings = {
            url: urlPath,
            type: requestType,
            crossDomain: true,
            dataType: localAcceptType,
            async: false,
            cache: true,
            error: function (jqXHR, textStatus, errorThrown) {
                _restLogger.error('<< synchronous request in error');
                try {
                    console.debug(jqXHR, textStatus, errorThrown, this.url);
                } catch (error) {
                    _restLogger.error('<< error call console.debug[' + error.stack ? error.stack : error + ']');
                }
            },
            success: function (data, textStatus, jqXHR) {
                if (jqXHR.status === 200 || jqXHR.status === 201 || jqXHR.status === 204) {
                    console.debug('<< synchronous request in success');
                    if (data != null && typeof (data) !== 'undefined') {
                        console.debug('<<  data response is [' + JSON.stringify(data) + ']');
                    } else {
                        console.debug('<<  no data response');
                    }
                    result = data;
                }
            }
        };

        if (localData != null && contentType != null) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {data: localData, contentType: contentType});
        }

        if (timeout != null && !isNaN(parseInt(timeout, 10))) {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {timeout: timeout});
        } else {
            ajaxSettings = jQuery.extend({}, ajaxSettings, {timeout: defaultWebServiceRequestTimeoutInSec * 1000});
        }

        if (_self.debugEnabled) {
            var start = new Date().getTime();
            jQuery.ajax(ajaxSettings);
            var end = new Date().getTime();

            if (end - start > _self.longuestRequest.executionTime) {
                _self.longuestRequest.url = urlPath;
                _self.longuestRequest.executionTime = end - start;
                _self.longuestRequest.type = 'sync';
            }
        } else {
            jQuery.ajax(ajaxSettings);
        }

        return result;
    };

    /*
     * function called to make an asynchronous request to the business layer with a partial url
     * @param partialUrlPath : url part to use to make the request such as /facade/protected/user/createSession/...
     * @param doGet : use to tell if the request must be made in GET(when value is true) or POST (other case)
     * @param successfulFunc : function to call when the request is in success, see cngRestManager.requestSuccessful() to see function args
     * @param errorFunc : function to call in case of error, see cngRestManager.console.debug() to see function args
     * @param data : the data to send in http body request warning don't forget to set contentType according to your business layer consumes method annotation
     * @param acceptType : used to parse if needed the response from server in case of 'application/json' for example. correspond to your business layer produce method annotation
     *                     if server returns just a string set this to 'text/plain'
     * @param contentType : use to set data content type mandatory when setting data if not data will not be send
     * @param timeout : use to set a maximum time to wait response from server. value is in ms
     *
     */
    this.doAsynchronousServerQueryWithTypes = function (partialUrlPath, doGet, successfulFunc, errorFunc, data, acceptType, contentType, timeout, useCookies) {
        return _self.doAsynchronousServerQueryWithFullPath(cngConfigManager.restBaseUrl + partialUrlPath, doGet, successfulFunc, errorFunc, data, acceptType, contentType, timeout, useCookies);
    };

    /*
     * function called to make an synchronous request to the business layer with a partial url
     * @param partialUrlPath : url part to use to make the request such as /facade/protected/user/createSession/...
     * @param doGet : use to tell if the request must be made in GET(when value is true) or POST (other case)
     * @param data : the data to send in http body request warning don't forget to set contentType according to your business layer consumes method annotation
     * @param acceptType : used to parse if needed the response from server in case of 'application/json' for example. correspond to your business layer produce method annotation
     *                     if server returns just a string set this to 'text/plain'
     * @param contentType : use to set data content type mandatory when setting data if not data will not be send
     * @param timeout : use to set a maximum time to wait response from server. value is in ms
     * @return string / object : response from server if response was json and acceptType was set to 'application/json' return parsed object
     */
    this.doSynchronousServerQueryWithTypes = function (partialUrlPath, doGet, data, acceptType, contentType, timeout, useCookies, cached) {
        return _self.doSynchronousServerQueryWithFullPath(cngConfigManager.restBaseUrl + partialUrlPath, doGet, data, acceptType, contentType, timeout, null, useCookies, cached);
    };
    /*
         * function called to make an synchronous request to the business layer with a partial url
         * @param partialUrlPath : url part to use to make the request such as /facade/protected/user/createSession/...
         * @param doGet : use to tell if the request must be made in GET(when value is true) or POST (other case)
         * @param data : the data to send in http body request warning don't forget to set contentType according to your business layer consumes method annotation
         * @param acceptType : used to parse if needed the response from server in case of 'application/json' for example. correspond to your business layer produce method annotation
         *                     if server returns just a string set this to 'text/plain'
         * @param contentType : use to set data content type mandatory when setting data if not data will not be send
         * @param timeout : use to set a maximum time to wait response from server. value is in ms
         * @return string / object : response from server if response was json and acceptType was set to 'application/json' return parsed object
         */
    this.doSynchronousServerQueryWithTypesJSON = function (partialUrlPath, requestType, data, acceptType, contentType, timeout, useCookies) {
        return _self.doSynchronousServerQueryWithFullPathJSON(cngConfigManager.restBaseUrl + partialUrlPath, requestType, data, acceptType, contentType, timeout, null, useCookies);
    };

    /*
     * same as doSynchronousServerQueryWithTypes but use doSecretSynchronousServerQueryWithFullPath
     */
    this.doSecretSynchronousServerQueryWithTypes = function (partialUrlPath, doGet, data, acceptType, contentType, timeout) {
        return _self.doSecretSynchronousServerQueryWithFullPath(cngConfigManager.restBaseUrl + partialUrlPath, doGet, data, acceptType, contentType, timeout);
    };

    /*
     * same as doSynchronousServerQuery but use doSecretSynchronousServerQueryWithFullPath
     */
    this.doSecretSynchronousServerQuery = function (partialUrlPath, doGet, data, timeout) {
        return _self.doSecretSynchronousServerQueryWithFullPath(cngConfigManager.restBaseUrl + partialUrlPath, doGet, data, "application/json", "application/json", timeout);
    };

    /*
     * function called to make an synchronous request to the business layer with a partial url  and with 'application/json' content type and 'application/json' accept type
     * @param partialUrlPath : url part to use to make the request such as /facade/protected/user/createSession/...
     * @param doGet : use to tell if the request must be made in GET(when value is true) or POST (other case)
     * @param data : the json data to send in http body request warning don't forget to set contentType according to your business layer consumes method annotation
     * @param timeout : use to set a maximum time to wait response from server. value is in ms
     * @param cached : use to save the result to avoid calling back the same request several times
     * @return object : response from server parsed object
     */
    this.doSynchronousServerQuery = function (partialUrlPath, doGet, data, timeout, cached) {
        return _self.doSynchronousServerQueryWithFullPath(partialUrlPath, doGet, data, "application/json", "application/json", timeout, null, null, cached);
    };

    /*
     * function called to make an synchronous request to the business layer with a partial url  and with 'application/json' content type and 'application/json' accept type
     * @param partialUrlPath : url part to use to make the request such as /facade/protected/user/createSession/...
     * @param doGet : use to tell if the request must be made in GET(when value is true) or POST (other case)
     * @param data : the json data to send in http body request warning don't forget to set contentType according to your business layer consumes method annotation
     * @param timeout : use to set a maximum time to wait response from server. value is in ms
     * @param cached : use to save the result to avoid calling back the same request several times
     * @return object : response from server parsed object
     */
    this.doSynchronousServerQueryWithCookie = function (partialUrlPath, requestType, data, timeout, cached) {
        return _self.doSynchronousServerQueryWithFullPathJSON(cngConfigManager.restBaseUrl + partialUrlPath, requestType, data, "application/json", "application/json", timeout, null, true, cached);
    };

    /*
     * function called to make an asynchronous request to the business layer with a     partial url and with 'application/json' content type and 'application/json' accept type
     * @param partialUrlPath : url part to use to make the request such as /facade/protected/user/createSession/...
     * @param doGet : use to tell if the request must be made in GET(when value is true) or POST (other case)
     * @param successfulFunc : function to call when the request is in success, see cngRestManager.requestSuccessful() to see function args
     * @param errorFunc : function to call in case of error, see cngRestManager.console.debug() to see function args
     * @param data : the data to send in http body request warning don't forget to set contentType according to your business layer consumes method annotation
     * @param timeout : use to set a maximum time to wait response from server. value is in ms
     * @param cached : use to save the result to avoid calling back the same request several times
     */
    this.doAsynchronousServerQuery = function (partialUrlPath, doGet, successfulFunc, errorFunc, data, timeout, cached) {
        _self.doAsynchronousServerQueryWithFullPath(cngConfigManager.restBaseUrl + partialUrlPath, doGet, successfulFunc, errorFunc, data, "application/json", "application/json", timeout, null, cached);
    };


    this.getLanguagesSpoken = function () {
        return cngConfigManager.languagesSpoken;
    }

    this.getListGuidePDF = function () {
        return cngConfigManager.listGuidePDF;
    }
};