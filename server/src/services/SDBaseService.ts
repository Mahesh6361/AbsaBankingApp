import * as request from 'request';
import * as cookie from 'cookie';
import * as querystring from "querystring";
import * as fs from 'fs';
import * as hashSum from 'hash-sum';
import config from '../config/config';
import * as multer from 'multer';
import { EventEmitter } from 'events';
import * as path from 'path';
import { } from 'stream';
import { Middlewares } from '../middleware/GlobalMiddlewares';
import configNodes from '../config/configNodes';

class BaseServiceEventEmitter extends EventEmitter { }

export class SDBaseService {
    public configNodes = configNodes;
    __constructDefault(bh, ...webVars) {
        const system: any = {};
        const web: any = {};
        try {
            system.environment = process.env;
            if (!bh.input) {
                bh.input = {};
            }
            if (webVars[0]) {
                web.req = webVars[0];
                bh.input.params = web.req.params;
                bh.input.query = web.req.query;
                bh.input.body = web.req.body;
                bh.input.files = web.req.files;
                bh.input.cookies = web.req.cookies;
                bh.input.headers = web.req.headers;
                bh.input.hostname = web.req.hostname;
                bh.input.method = web.req.method;
                bh.input.path = web.req.path;
                bh.input.signedCookies = web.req.signedCookies;
            }
            if (webVars[1]) {
                web.res = webVars[1];
            }
            if (webVars[2]) {
                web.next = webVars[2];
            }
            Object.defineProperty(bh, 'system', {
                value: system,
                writable: false
            });

            Object.defineProperty(bh, 'web', {
                value: web,
                writable: true
            });
            return bh;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    operators = {
        eq(a, b, c, d) { return a === b; },
        se(a, b, c, d) { return a === b; },
        neq(a, b, c, d) { return a !== b; },
        sne(a, b, c, d) { return a !== b; },
        lt(a, b, c, d) { return a < b; },
        lte(a, b, c, d) { return a <= b; },
        gt(a, b, c, d) { return a > b; },
        gte(a, b, c, d) { return a >= b; },
        btwn(a, b, c, d) { return a >= b && a <= c; },
        cont(a, b, c, d) { return (a + "").indexOf(b) !== -1; },
        regex(a, b, c, d) { return (a + "").match(new RegExp(b, d ? 'i' : '')); },
        true(a, b, c, d) { return a === true; },
        false(a, b, c, d) { return a === false; },
        null(a, b, c, d) { return (typeof a === "undefined" || a === null); },
        nnull(a, b, c, d) { return (typeof a !== "undefined" && a !== null); },
        empty(a, b, c, d) {
            if (typeof a === 'string' || Array.isArray(a)) {
                return a.length === 0;
            } else if (typeof a === 'object' && a !== null) {
                return Object.keys(a).length === 0;
            }
            return false;
        },
        nempty(a, b, c, d) {
            if (typeof a === 'string' || Array.isArray(a)) {
                return a.length !== 0;
            } else if (typeof a === 'object' && a !== null) {
                return Object.keys(a).length !== 0;
            }
            return false;
        },

        istype(a, b, c, d) {
            if (b === "array") { return Array.isArray(a); }
            else if (b === "json") {
                try {
                    JSON.parse(a);
                    return true;
                }   // or maybe ??? a !== null; }
                catch (e) { return false; }
            }
            else if (b === "null") { return a === null; }
            else { return typeof a === b && !Array.isArray(a) && a !== null; }
        },
        else(a, b, c, d) { return a === true; }
    };

    /**
     * 
     * construct http request options and make a request
     * 
     */

    httpRequest(url, timeout, method, headers, followRedirects, cookies, authType, body, paytoqs,
        proxyConfig, tlsConfig, ret, params, rejectUnauthorized, username, password, token) {
        let opts = {};
        opts['url'] = url;
        opts['timeout'] = timeout;
        opts['method'] = method;
        opts['headers'] = {};
        opts['encoding'] = null; // Force NodeJs to return a Buffer (instead of a string)
        opts['maxRedirects'] = 21;
        opts['jar'] = request.jar();
        opts['proxy'] = null;
        opts['rejectUnauthorized'] = rejectUnauthorized;
        const preRequestTimestamp = process.hrtime();
        // known headers to normalize
        const ctSet = "Content-Type"; // set default camel case
        const clSet = "Content-Length";
        const redirectList = [];
        opts = this.setHeaders(opts, headers, clSet, ctSet);
        opts = this.setRedirects(opts, followRedirects, redirectList);
        opts = this.setCookies(opts, cookies, url);
        opts = this.addRequestCredentials(opts, authType, username, password, token);
        opts = this.constructBody(opts, method, body, clSet, ctSet);
        opts = this.setPaytoqs(opts, method, body, paytoqs);
        opts = this.revertCapitalisation(opts, clSet, ctSet);
        opts = this.addProxyConfig(opts, proxyConfig, url);
        opts = this.addTLSOptions(opts, tlsConfig);
        opts = this.addQueryParams(opts, params);
        return new Promise((resolve, reject) => {
            request(opts, (err, res, body) => {
                if (err) {
                    return reject(err);
                }
                const msg = {};
                msg['statusCode'] = res.statusCode;
                msg['headers'] = res.headers;
                msg['responseUrl'] = res.request.uri.href;
                msg['payload'] = body;
                msg['redirectList'] = redirectList;
                if (msg['headers'].hasOwnProperty('set-cookie')) {
                    msg['responseCookies'] = this.extractCookies(msg['headers']['set-cookie']);
                }
                msg['headers']['x-neutrinos-request-node'] = hashSum(msg['headers']);
                // msg.url = url;   // revert when warning above finally removed
                // Calculate request time
                const diff = process.hrtime(preRequestTimestamp);
                const ms = diff[0] * 1e3 + diff[1] * 1e-6;
                const metricRequestDurationMillis = ms.toFixed(3);
                msg['requestDuration'] = metricRequestDurationMillis;
                if (res.client && res.client.bytesRead) {
                    msg['bytesRead'] = res.client.bytesRead;
                }
                // Convert the payload to the required return type
                if (ret !== "arraybuffer") {
                    msg['payload'] = msg['payload'].toString('utf8'); // txt
                    if (ret === "json") {
                        try {
                            msg['payload'] = JSON.parse(msg['payload']);
                        } // obj
                        catch (e) {
                            console.error(e);
                            throw e;
                        }
                    }
                }
                return resolve(msg);
            });
        });
    }

    setHeaders(opts, headers, clSet, ctSet) {
        // headers is an object, each key is treated as a header
        if (headers) {
            for (const v in headers) {
                if (headers.hasOwnProperty(v)) {
                    // normalize known headers
                    let name = v.toLowerCase();
                    if (name !== "content-type" && name !== "content-length") {
                        // only normalise the known headers used later in this
                        // function. Otherwise leave them alone.
                        name = v;
                    }
                    else if (name === 'content-type') {
                        ctSet = v;
                    }
                    else {
                        clSet = v;
                    }
                    opts.headers[name] = headers[v];
                }
            }
        }
        return opts;
    }

    setRedirects(opts, followRedirects, redirectList) {
        opts.followRedirect = followRedirects;
        if (opts.followRedirect) {
            const that = this;
            opts.followRedirect = function (res) {

                const redirectInfo = {
                    location: res.headers.location,
                };
                if (res.headers.hasOwnProperty('set-cookie')) {
                    redirectInfo['cookies'] = that.extractCookies(res.headers['set-cookie']);
                }
                redirectList.push(redirectInfo);
                if (res.request.headers.cookie) {
                    delete res.request.headers.cookie;
                }

                return true;
            };
        }
        return opts;
    }

    setCookies(opts, cookies, url) {
        if (opts.headers.hasOwnProperty('cookie')) {
            const _cookies = cookie.parse(opts.headers.cookie, { decode: String });
            for (const _name in _cookies) {
                opts.jar.setCookie(cookie.serialize(_name, _cookies[_name], { encode: String }), url);
            }
            delete opts.headers.cookie;
        }
        // cookie is an object, each key is treated as a new cookie
        if (cookies) {
            // opts.jar._jar.rejectPublicSuffixes = false
            for (const name in cookies) {
                if (cookies.hasOwnProperty(name)) {
                    if (cookies[name] === null || cookies[name].value === null) {
                        // This case clears a cookie for HTTP In/Response nodes.
                        // Ignore for this node.
                    }
                    else if (typeof cookies[name] === 'object') {
                        if (!cookies[name].options) {
                            cookies['options'] = {};
                        }
                        if (cookies[name].encode === false) {
                            // If the encode option is false, the value is not encoded.
                            cookies.encode = String;
                            opts.jar.setCookie(cookie.serialize(name, cookies[name].value, cookies[name].options), url);
                        }
                        else {
                            // The value is encoded by encodeURIComponent().
                            opts.jar.setCookie(cookie.serialize(name, cookies[name].value, cookies[name].options), url);
                        }
                    }
                    else {
                        opts.jar.setCookie(cookie.serialize(name, cookies[name], cookies[name].options), url);
                    }
                }
            }
        }
        return opts;
    }

    addRequestCredentials(opts, authType, user, password, token) {
        if (user || password || token) {
            if (authType === "basic") {
                if (user) {
                    opts.auth = {
                        user,
                        pass: password || ""
                    };
                }
            }
            else if (authType === "digest") {
                if (user) {
                    // The first request will be sent without auth information.  Based on the 401 response, the library can determine
                    // which auth type is required by the server.  Then the request is resubmitted with the appropriate auth header.
                    opts.auth = {
                        user,
                        pass: password || "",
                        sendImmediately: false
                    };
                }
            }
            else if (authType === "bearer") {
                opts.auth = {
                    bearer: token || ""
                };
            }
        }
        return opts;
    }

    setPaytoqs(opts, method, body, paytoqs) {
        if (method === 'GET' && typeof body !== "undefined" && paytoqs) {
            if (typeof body === "object") {
                try {
                    if (opts.url.indexOf("?") !== -1) {
                        opts.url += (opts.url.endsWith("?") ? "" : "&") + querystring.stringify(body);
                    }
                    else {
                        opts.url += "?" + querystring.stringify(body);
                    }
                }
                catch (err) {
                    throw new Error("Invalid Payload");
                }
            }
            else {
                throw new Error("Invalid Payload");
            }
        }
        return opts;
    }

    addQueryParams(opts, params) {
        if (typeof params === "object") {
            try {
                opts.qs = params;
            }
            catch (err) {
                throw new Error("Invalid params");
            }
        }
        return opts;
    }
    revertCapitalisation(opts, clSet, ctSet) {
        // revert to user supplied Capitalisation if needed.
        if (opts.headers.hasOwnProperty('content-type') && (ctSet !== 'content-type')) {
            opts.headers[ctSet] = opts.headers['content-type'];
            delete opts.headers['content-type'];
        }
        if (opts.headers.hasOwnProperty('content-length') && (clSet !== 'content-length')) {
            opts.headers[clSet] = opts.headers['content-length'];
            delete opts.headers['content-length'];
        }
        return opts;
    }
    constructBody(opts, method, body, clSet, ctSet) {
        let payload = null;
        if (method !== 'GET' && method !== 'HEAD' && typeof body !== "undefined") {
            if (opts.headers['content-type'] === 'multipart/form-data' && typeof body === "object") {
                opts.formData = {};
                for (const opt in body) {
                    if (body.hasOwnProperty(opt)) {
                        const val = body[opt];
                        if (val !== undefined && val !== null) {
                            if (typeof val === 'string' || Buffer.isBuffer(val)) {
                                opts.formData[opt] = val;
                            }
                            else if (typeof val === 'object' && val.hasOwnProperty('value')) {
                                // Treat as file to upload - ensure it has an options object
                                // as request complains if it doesn't
                                if (!val.hasOwnProperty('options')) {
                                    val.options = {};
                                }
                                opts.formData[opt] = val;
                            }
                            else {
                                opts.formData[opt] = JSON.stringify(val);
                            }
                        }
                    }
                }
            }
            else {
                if (typeof body === "string" || Buffer.isBuffer(body)) {
                    payload = body;
                }
                else if (typeof body === "number") {
                    payload = body + "";
                }
                else {
                    if (opts.headers['content-type'] === 'application/x-www-form-urlencoded') {
                        payload = querystring.stringify(body);
                    }
                    else {
                        payload = JSON.stringify(body);
                        if (opts.headers['content-type'] == null) {
                            opts.headers[ctSet] = "application/json";
                        }
                    }
                }
                if (opts.headers['content-length'] == null) {
                    if (Buffer.isBuffer(payload)) {
                        opts.headers[clSet] = payload.length;
                    }
                    else {
                        opts.headers[clSet] = Buffer.byteLength(payload);
                    }
                }
                opts.body = payload;
            }
        }
        return opts;
    }
    addProxyConfig(opts, proxyConfig, url) {
        let prox = null;
        let noprox = null;
        if (proxyConfig) {
            prox = proxyConfig.url;
            noprox = proxyConfig.noproxy;
        }
        let noproxy;
        if (noprox) {
            for (const i in noprox) {
                if (url.indexOf(noprox[i]) !== -1) {
                    noproxy = true;
                }
            }
        }
        if (prox && !noproxy) {
            const match = prox.match(/^(http:\/\/)?(.+)?:([0-9]+)?/i);
            if (match) {
                opts.proxy = prox;
            }
            else {
                opts.proxy = null;
                throw new Error('Invalid proxy url');
            }
        }
        if (proxyConfig && proxyConfig.useProxyAuth && opts.proxy === proxyConfig.url) {
            const proxyUsername = proxyConfig.username || '';
            const proxyPassword = proxyConfig.password || '';
            if (proxyUsername || proxyPassword) {
                opts.headers['proxy-authorization'] =
                    'Basic ' +
                    Buffer.from(`${proxyUsername}:${proxyPassword}`).toString('base64');
            }
        }
        return opts;
    }
    addTLSOptions(opts, tlsConfig) {
        if (tlsConfig) {
            let valid = true;
            const verifyservercert = tlsConfig.verifyServerCertificate;
            const certPath = tlsConfig.certificateFilePath.trim();
            const keyPath = tlsConfig.privateKeyFilePath.trim();
            const caPath = tlsConfig.cacertificateFilePath.trim();
            const servername = (tlsConfig.serverName || "").trim();
            let cert;
            let key;
            let ca;
            if ((certPath.length > 0) || (keyPath.length > 0) || (caPath.length > 0)) {
                if ((certPath.length > 0) !== (keyPath.length > 0) && !(caPath.length > 0)) {
                    valid = false;
                    throw new Error('Missing TLS config files');
                    return;
                }
                try {
                    if (certPath.length > 0) {
                        cert = fs.readFileSync(process.cwd() + certPath.replace('/', path.sep));
                    }
                    if (keyPath.length > 0) {
                        key = fs.readFileSync(process.cwd + keyPath.replace('/', path.sep));
                    }
                    if (caPath.length > 0) {
                        ca = fs.readFileSync(process.cwd() + caPath.replace('/', path.sep));
                    }
                }
                catch (err) {
                    valid = false;
                    throw err;
                    return;
                }
            }
            else {
                if (tlsConfig.credentials) {
                    const certData = tlsConfig.credentials.certdata || "";
                    const keyData = tlsConfig.credentials.keydata || "";
                    const caData = tlsConfig.credentials.cadata || "";
                    if ((certData.length > 0) !== (keyData.length > 0)) {
                        valid = false;
                        throw new Error("Missing TLS config");
                        return;
                    }
                    if (certData) {
                        cert = certData;
                    }
                    if (keyData) {
                        key = keyData;
                    }
                    if (caData) {
                        ca = caData;
                    }
                }
            }
            if (valid) {
                if (key) {
                    opts.key = key;
                }
                if (cert) {
                    opts.cert = cert;
                }
                if (ca) {
                    opts.ca = ca;
                }
                if (tlsConfig.passphrase) {
                    opts.passphrase = tlsConfig.passphrase;
                }
                if (tlsConfig.serverName) {
                    opts.servername = servername;
                }
            }
        }
        return opts;
    }


    extractCookies(setCookie) {
        const cookies = {};
        setCookie.forEach(function (c) {
            const parsedCookie = cookie.parse(c);
            const eqIdx = c.indexOf('=');
            const key = c.substr(0, eqIdx).trim()
            parsedCookie.value = parsedCookie[key];
            delete parsedCookie[key];
            cookies[key] = parsedCookie;
        });
        return cookies;
    }

    getMiddlesWaresBySequenceId(sequenceId: string, type: string, generatedMiddleWares: any) {
        const returnedMws = [];
        if (config['middlewares'] && config['middlewares']['sequences'] && config['middlewares']['sequences'][sequenceId] && config['middlewares']['sequences'][sequenceId][type]) {
            const middleWares = config['middlewares']['sequences'][sequenceId][type];
            if (middleWares instanceof Array) {
                for (let i = 0; i < middleWares.length; i++) {
                    const serviceName = Object.getOwnPropertyNames(middleWares[i])[0];
                    const mwName = middleWares[i][serviceName];
                    if (serviceName === '__ssdGlobalMiddlewares__' && typeof Middlewares[mwName] === 'function') {
                        returnedMws.push(Middlewares[mwName]())
                    } else if (generatedMiddleWares[serviceName] && generatedMiddleWares[serviceName][mwName]) {
                        returnedMws.push(generatedMiddleWares[serviceName][mwName].functionDef);
                    }
                }
            }
        }
        return returnedMws;
    }


    multipartParser(fileUploadOptions) {
        let o: any = {
            storage: multer.memoryStorage()
        };
        if (fileUploadOptions.path) {
            o = {
                dest: fileUploadOptions.path
            }
        }
        let mp;
        if (fileUploadOptions.options instanceof Array) {
            mp = multer(o).fields(fileUploadOptions.options);
        } else {
            mp = multer(o).any();
        }
        return function (req, res, next) {
            mp(req, res, function (err) {
                req._body = true;
                next(err);
            })
        };
    }


    /**
     * 
     * @param configType 
     * @param id 
     * 
     * Based on config type and id return respective config object
     */
    getConfigObj(configType, id): any {
        if (configType && id) {
            if (this.configNodes) {
                if (this.configNodes.hasOwnProperty(configType) && this.configNodes[configType].hasOwnProperty(id)) {
                    return this.configNodes[configType][id];
                } else {
                    throw new Error(`Cannot find the ${configType} config type or id ${id}`);
                }
            } else {
                throw new Error('Cannot find the config nodes');
            }
        }
    }

    /**
     * 
     * @param bh 
     * @param c - cookies should be object
     * 
     * sets the cookies to the response 
     */
    cookieSetter(bh, c) {
        if (typeof c === 'object') {
            const cs = Object.keys(c);
            for (const i of cs) {
                bh.web.res.cookie(i, c[i].value, c[i]);
            }
        }
        return bh;
    }

}
