import Fingerprint2 from 'fingerprintjs2';
import UAParser from 'ua-parser-js';
import _ from 'lodash';
import { Cookie } from 'tough-cookie';

const COOKIE_NAME = "__kpn_fingerprint";


export default class App {
    constructor(fingerprintService, cookieService){
        this.fingerprintService = fingerprintService || Fingerprint2;
        this.cookieService = cookieService || Cookie;
        this.default_options = {
            preprocessor: this._preprocessor,
            excludes: [
                "screenResolution",
                "availableScreenResolution",
                "doNotTrack",
                "plugins",
                "adBlock",
                "fonts",
            ],
        };
    }

    run(){
        setTimeout(this._run.bind(this), 500);
    }

    _run(){
        this.fingerprintCookie = this._getCookie();
        this.container = document.querySelector("#hash-container");
        this._getFingerprint(this._writeHash);
    }

    _getCookie(){
        var cookies = (!document.cookie) ? [] : document.cookie.split(';');
        cookies = _.map(cookies, c => this.cookieService.parse);
        return _.find(cookies, c => c.key == COOKIE_NAME);
    }

    _getFingerprint(cb){
        this.fingerprintService.get(this.default_options, cb.bind(this));
    }

    _writeHash(components){
        const seed = _.find(components, (obj) => obj.key == "hardwareConcurrency").value;
        const hash = this.fingerprintService.x64hash128(
            components.map((pair) => pair.value).join(), seed
        );
        this.container.innerText = hash;
        if (this._fingerprintHasChanged(hash)){
            console.log("IDENTITY_CHANGED");
            alert("IDENTITY_CHANGED");
        }
        document.cookie = new Cookie({key: COOKIE_NAME, value: hash}).cookieString();
    }

    _fingerprintHasChanged(hash){
        return (this.fingerprintCookie && hash !== this.fingerprintCookie) ? true : false ;
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
