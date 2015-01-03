/**
 * @Class VeStorage
 *
 */

function VeStorage(namespace) {
    'use strict';
    this.method = 'localStorage';
    this.namespace = namespace;
    this.sessionTimeOutMinutes = 60;
    this.isSupported = supportStorage(this.method);
}
VeStorage.prototype.store = function(object) {
    if(this.isSupported) {
        for(var key in object) {
            window[this.method][this.namespace + key] = object[key];
        }
    }
};
VeStorage.prototype.load = function(array) {
    var result = {};
    if(this.isSupported) {
        for(var i = 0, len = array.length; i < len; i += 1) {
            var key = array[i];
            result[key] = window[this.method][this.namespace + key];
        }
    }
    return result;
};
VeStorage.prototype.isInVeSession = function(time) {
    return(((Utils.date.now() - time) / (60 * 1000)) < this.sessionTimeOutMinutes);
};

function supportStorage(method) {
    var test = 'testStorage';
    try {
        window[method].setItem(test, test);
        window[method].removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}