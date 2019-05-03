import Fingerprint2 from 'fingerprintjs2';
import UAParser from 'ua-parser-js';
import _ from 'lodash';

export default class App {

    constructor(fingerprint_service){
        this.fingerprint_service = fingerprint_service || Fingerprint2;
        this.default_options = {preprocessor: this._preprocessor};
    }

    run(){
        setTimeout(this._run.bind(this), 500);
    }

    _run(){
        this.container = document.querySelector("#hash-container");
        this._getFingerprint(this._writeHash);
    }

    _getFingerprint(cb){
        this.fingerprint_service.get(this.default_options, cb.bind(this));
    }

    _writeHash(components){
        const seed = _.find(components, (obj) => obj.key == "hardwareConcurrency").value;
        const hash = this.fingerprint_service.x64hash128(
            components.map((pair) => pair.value).join(), seed
        );
        this.container.innerText = hash;
    }

    _preprocessor(key, value) {
        if (key == "userAgent") {
            var parser = new UAParser(value); // https://github.com/faisalman/ua-parser-js
            var userAgentMinusVersion = parser.getOS().name + ' ' + parser.getBrowser().name;
            return userAgentMinusVersion;
        }
        return value;
    }
}
