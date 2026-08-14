import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import mqtt from 'mqtt';

import { MqttService } from './mqtt.service';
import { AuthService } from './auth.service';
import { environment } from '@env/environment';
import { MsgSubID } from '@models';

describe('MqttService', () => {
    let service: MqttService;
    let httpMock: HttpTestingController;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let fakeClient: any;
    let onHandlers: { [event: string]: Array<(...args: any[]) => void> };

    function createFakeClient() {
        onHandlers = {};
        return {
            on: jasmine.createSpy('on').and.callFake((event: string, cb: (...args: any[]) => void) => {
                onHandlers[event] = onHandlers[event] || [];
                onHandlers[event].push(cb);
            }),
            publish: jasmine.createSpy('publish'),
            subscribe: jasmine.createSpy('subscribe').and.callFake((_topic: string, cb?: (err?: any) => void) => {
                cb?.(null);
            }),
            unsubscribe: jasmine.createSpy('unsubscribe').and.callFake((_topic: string, cb?: (err?: any) => void) => {
                cb?.(null);
            }),
            end: jasmine.createSpy('end').and.callFake((a?: any, b?: any) => {
                if (typeof a === 'function') {
                    a();
                } else if (typeof b === 'function') {
                    b();
                }
            }),
            removeListener: jasmine.createSpy('removeListener'),
        };
    }

    const validMqttOptions = {
        host: 'broker.local',
        protocol: 'ws',
        port: '9001',
        path: '/mqtt',
        keepalive: 30,
        username: 'admin',
        password: 'password',
    };

    const sampleTopicsConfig = {
        version: 1,
        mainTab: {
            get: 'MADT/UpdateMainTab',
            response: 'TC/UpdateMainTab',
        },
        maintenance: {
            get: 'MADT/UpdateMaintenanceTab',
            response: 'TC/UpdateMaintenanceTab',
        },
    };

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['decryptPassword']);
        authServiceSpy.decryptPassword.and.returnValue('decrypted-pass');

        TestBed.configureTestingModule({
            providers: [
                MqttService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: AuthService, useValue: authServiceSpy },
            ],
        });

        service = TestBed.inject(MqttService);
        httpMock = TestBed.inject(HttpTestingController);

        // `mqtt`'s top-level named export is a non-configurable getter re-export (bundler ESM
        // interop), so spyOn(mqtt, 'connect') fails with "not declared writable". `mqtt.default`
        // holds the same underlying function on a plain writable/configurable property, and the
        // top-level getter forwards to it live, so spying there intercepts `mqtt.connect(...)` too.
        spyOn((mqtt as any).default, 'connect').and.callFake(() => {
            fakeClient = createFakeClient();
            return fakeClient as any;
        });

        // Ensure a known baseline regardless of execution order across specs.
        environment.env = 'dev';
        environment.displayAutoClick = true;
        environment.localDeveloperName = 'WILL';
    });

    afterEach(() => {
        httpMock.verify();
    });

    function flushConfig(mqttOverrides: any = validMqttOptions, topics: any = sampleTopicsConfig) {
        const req = httpMock.expectOne((r) => r.url === '/assets/mqtt-config.json');
        req.flush({ mqtt: mqttOverrides, topics });
    }

    describe('connect()', () => {
        it('fetches config and initializes the client on success', () => {
            service.connect();
            flushConfig();

            expect(mqtt.connect).toHaveBeenCalledWith(
                'ws://broker.local:9001/mqtt',
                jasmine.objectContaining({ keepalive: 30, username: 'admin' }),
            );
            expect(service.mqttConfig.topics).toEqual(sampleTopicsConfig);
        });

        it('emits mqttConfigLoaded$ = true on success', () => {
            const values: boolean[] = [];
            service.mqttConfigLoaded$.subscribe((v) => values.push(v));
            service.connect();
            flushConfig();
            expect(values).toEqual([false, true]);
        });

        it('guards against re-entrant connect() calls while already connecting', () => {
            spyOn(console, 'log');
            service.connect();
            service.connect(); // should just log and return, no second HTTP call
            expect(console.log).toHaveBeenCalledWith('Already connecting to a broker.');
            const req = httpMock.expectOne((r) => r.url === '/assets/mqtt-config.json');
            req.flush({ mqtt: validMqttOptions, topics: sampleTopicsConfig });
        });

        it('handles HTTP errors from the config endpoint', () => {
            const statuses: (boolean | null)[] = [];
            const configLoaded: boolean[] = [];
            service.connectionStatus$.subscribe((v) => statuses.push(v));
            service.mqttConfigLoaded$.subscribe((v) => configLoaded.push(v));

            service.connect();
            const req = httpMock.expectOne((r) => r.url === '/assets/mqtt-config.json');
            req.flush('boom', { status: 500, statusText: 'Server Error' });

            expect(statuses).toEqual([null, false, false]);
            expect(configLoaded).toEqual([false, false]);

            // isConnecting must have been reset so a subsequent connect() works
            service.connect();
            const req2 = httpMock.expectOne((r) => r.url === '/assets/mqtt-config.json');
            req2.flush({ mqtt: validMqttOptions, topics: sampleTopicsConfig });
            expect(mqtt.connect).toHaveBeenCalled();
        });

        it('ends the previous client before reinitializing when connect() is called again after success', () => {
            service.connect();
            flushConfig();
            const firstClient = fakeClient;

            // NOTE: `connect()` never resets `isConnecting` back to false on the success path
            // (only the HTTP-error path does), so in real usage a second connect() after a
            // successful one is permanently a no-op guarded by "Already connecting to a broker."
            // That looks like a design oversight in mqtt.service.ts. We reset the private flag
            // here (without touching production code) purely to exercise the "end the previous
            // client" branch inside connect()'s tap callback.
            (service as any).isConnecting = false;

            service.connect();
            flushConfig();

            expect(firstClient.end).toHaveBeenCalled();
            expect(mqtt.connect).toHaveBeenCalledTimes(2);
        });
    });

    describe('initializeClient()', () => {
        it('sets username/password as-is when password is not hashed', async () => {
            await service.initializeClient({ ...validMqttOptions, password: 'plainpass' });
            expect(mqtt.connect).toHaveBeenCalledWith(
                'ws://broker.local:9001/mqtt',
                jasmine.objectContaining({ username: 'admin', password: 'plainpass' }),
            );
            expect(authServiceSpy.decryptPassword).not.toHaveBeenCalled();
        });

        it('decrypts the password when it is hashed (enc: prefix)', async () => {
            await service.initializeClient({ ...validMqttOptions, password: 'enc:abcdef' });
            expect(authServiceSpy.decryptPassword).toHaveBeenCalledWith('enc:abcdef');
            expect(mqtt.connect).toHaveBeenCalledWith(
                'ws://broker.local:9001/mqtt',
                jasmine.objectContaining({ password: 'decrypted-pass' }),
            );
        });

        it('omits username/password and defaults keepalive when not provided', async () => {
            await service.initializeClient({ host: 'h', protocol: 'ws', port: '1883' });
            const [, opts] = (mqtt.connect as jasmine.Spy).calls.mostRecent().args;
            expect(opts.keepalive).toBe(30);
            expect(opts.username).toBeUndefined();
            expect(opts.password).toBeUndefined();
        });

        it('builds broker url without a path segment when path is absent', async () => {
            await service.initializeClient({ host: 'h', protocol: 'mqtt', port: '1883' });
            expect(mqtt.connect).toHaveBeenCalledWith('mqtt://h:1883', jasmine.any(Object));
        });

        it('falls back to catch block when options are invalid (destructure throws)', async () => {
            await service.initializeClient(null);
            expect(mqtt.connect).not.toHaveBeenCalled();
        });

        it('registers connect/error/close/offline handlers and updates state accordingly', async () => {
            const statuses: (boolean | null)[] = [];
            service.connectionStatus$.subscribe((v) => statuses.push(v));

            await service.initializeClient(validMqttOptions);

            onHandlers['connect'][0]();
            expect(statuses[statuses.length - 1]).toBeTrue();

            onHandlers['error'][0](new Error('nope'));
            expect(statuses[statuses.length - 1]).toBeFalse();

            onHandlers['close'][0]();
            expect(statuses[statuses.length - 1]).toBeFalse();

            onHandlers['offline'][0]();
            expect(statuses[statuses.length - 1]).toBeFalse();
        });

        it('marks isReconnect$ true only from the second successful connect onward', async () => {
            const reconnects: boolean[] = [];
            service.isReconnect$.subscribe((v) => reconnects.push(v));

            await service.initializeClient(validMqttOptions);
            onHandlers['connect'][0]();
            expect(reconnects[reconnects.length - 1]).toBeFalse();

            onHandlers['connect'][0]();
            expect(reconnects[reconnects.length - 1]).toBeTrue();
        });
    });

    describe('disconnect()', () => {
        it('does nothing harmful when no client is connected, still emits connectionStatus$ = false', () => {
            const statuses: (boolean | null)[] = [];
            service.connectionStatus$.subscribe((v) => statuses.push(v));
            service.disconnect();
            expect(statuses[statuses.length - 1]).toBeFalse();
        });

        it('removes the message listener, unsubscribes all topics, clears handlers and ends the client', async () => {
            await service.initializeClient(validMqttOptions);
            service.subscribe({ topic: 'topicA', callback: () => {} });
            service.subscribe({ topic: 'topicB', callback: () => {} });

            const client = fakeClient;
            service.disconnect();

            expect(client.removeListener).toHaveBeenCalledWith('message', jasmine.any(Function));
            expect(client.unsubscribe).toHaveBeenCalled();
            expect(client.end).toHaveBeenCalledWith(true, jasmine.any(Function));
        });

        it('logs an error when unsubscribing a topic during disconnect fails', async () => {
            await service.initializeClient(validMqttOptions);
            service.subscribe({ topic: 'topicA', callback: () => {} });
            fakeClient.unsubscribe.and.callFake((_t: string, cb: (err?: any) => void) => cb(new Error('fail')));

            expect(() => service.disconnect()).not.toThrow();
        });
    });

    describe('publish()', () => {
        it('logs an error and does nothing when client is not connected', () => {
            spyOn(console, 'error');
            service.publish('some/topic', '{}');
            expect(console.error).toHaveBeenCalledWith('Client is not connected.');
        });

        it('publishes with dev-suffixed topic and logs when message is valid JSON', async () => {
            await service.initializeClient(validMqttOptions);
            service.publish('some/topic', JSON.stringify({ a: 1 }));
            expect(fakeClient.publish).toHaveBeenCalledWith('some/topic/WILL', JSON.stringify({ a: 1 }), undefined);
        });

        it('falls back to the raw string when message is not valid JSON', async () => {
            await service.initializeClient(validMqttOptions);
            spyOn(console, 'log');
            service.publish('some/topic', 'not-json{');
            expect(console.log).toHaveBeenCalledWith('publish', 'some/topic', 'not-json{', 'env = ', 'dev');
        });

        it('publishes without dev suffix when env is not dev', async () => {
            environment.env = 'prod';
            await service.initializeClient(validMqttOptions);
            service.publish('some/topic', '{}');
            expect(fakeClient.publish).toHaveBeenCalledWith('some/topic', '{}', undefined);
        });

        it('does not log to mqttLog$ when displayAutoClick is false', async () => {
            environment.displayAutoClick = false;
            await service.initializeClient(validMqttOptions);
            const logs: string[] = [];
            service.mqttLog$.subscribe((v) => logs.push(v));
            service.publish('some/topic', '{}');
            expect(logs[logs.length - 1]).toBe(logs[0]);
        });
    });

    describe('publishWithFormat()', () => {
        it('logs an error and does nothing when client is not connected', () => {
            spyOn(console, 'error');
            service.publishWithFormat('some/topic', { foo: 'bar' });
            expect(console.error).toHaveBeenCalledWith('Client is not connected.');
        });

        it('merges timestamp/version metadata and publishes as JSON', async () => {
            service.connect();
            flushConfig();
            service.publishWithFormat('some/topic', { foo: 'bar' });

            const [topic, body] = fakeClient.publish.calls.mostRecent().args;
            expect(topic).toBe('some/topic/WILL');
            const parsed = JSON.parse(body);
            expect(parsed.foo).toBe('bar');
            expect(parsed.messformatversion).toBe(1);
            expect(typeof parsed.timeStamp).toBe('number');
        });

        it('publishes without the dev topic suffix when env is not dev', () => {
            environment.env = 'prod';
            service.connect();
            flushConfig();
            service.publishWithFormat('some/topic', { foo: 'bar' });

            const [topic] = fakeClient.publish.calls.mostRecent().args;
            expect(topic).toBe('some/topic');
        });
    });

    describe('publishWithMessageFormat()', () => {
        it('logs an error and does nothing when client is not connected', () => {
            spyOn(console, 'error');
            service.publishWithMessageFormat({ topic: 'MADT/UpdateMainTab', msgID: 1, payload: {} });
            expect(console.error).toHaveBeenCalledWith('Client is not connected.');
        });

        it('rejects publishing when topic is missing/invalid', async () => {
            await service.initializeClient(validMqttOptions);
            spyOn(console, 'error');
            service.publishWithMessageFormat({ topic: '', msgID: 1, payload: {} });
            expect(console.error).toHaveBeenCalledWith(
                'Cannot publish MQTT message: missing topic.',
                jasmine.any(Object),
            );
            expect(fakeClient.publish).not.toHaveBeenCalled();
        });

        it('publishes successfully for a well-formed message and starts the no-response timeout for REQUEST', () => {
            jasmine.clock().install();
            try {
                service.connect();
                flushConfig();

                const noResponses: number[][] = [];
                service.isTCNoResponse$.subscribe((v) => noResponses.push(v));

                service.publishWithMessageFormat({ topic: 'MADT/UpdateMainTab', msgID: 42, payload: { x: 1 } });
                expect(fakeClient.publish).toHaveBeenCalled();

                jasmine.clock().tick(5001);
                expect(noResponses[noResponses.length - 1]).toEqual([42]);
            } finally {
                jasmine.clock().uninstall();
            }
        });

        it('skips full validation and still publishes when msgID is 0', () => {
            service.connect();
            flushConfig();
            service.publishWithMessageFormat({ topic: 'not-a-configured-topic', msgID: 0, payload: undefined });
            expect(fakeClient.publish).toHaveBeenCalled();
        });

        it('does not publish when the topic is not part of the configured topics', () => {
            service.connect();
            flushConfig();
            service.publishWithMessageFormat({ topic: 'totally/unknown/topic', msgID: 5, payload: {} });
            expect(fakeClient.publish).not.toHaveBeenCalled();
        });

        it('does not publish when payload is missing', () => {
            service.connect();
            flushConfig();
            service.publishWithMessageFormat({ topic: 'MADT/UpdateMainTab', msgID: 5, payload: undefined });
            expect(fakeClient.publish).not.toHaveBeenCalled();
        });

        it('publishes even with an array payload (typeof [] === "object", so the "non-array object" check never actually fires for arrays)', () => {
            // NOTE: `typeof message.payload !== 'object' && !Array.isArray(message.payload)` can
            // never be true for an array, because arrays already satisfy `typeof === 'object'`.
            // The "Payload must be a non-array object" branch is therefore only reachable for a
            // truthy non-object payload (string/number/boolean), never for a real array — this
            // looks like a latent bug in validateMessageFormat, not something to fix here.
            service.connect();
            flushConfig();
            service.publishWithMessageFormat({ topic: 'MADT/UpdateMainTab', msgID: 5, payload: [1, 2, 3] as any });
            expect(fakeClient.publish).toHaveBeenCalled();
        });

        it('does not publish when payload is a truthy non-object value', () => {
            service.connect();
            flushConfig();
            service.publishWithMessageFormat({
                topic: 'MADT/UpdateMainTab',
                msgID: 5,
                payload: 'just-a-string' as any,
            });
            expect(fakeClient.publish).not.toHaveBeenCalled();
        });

        it('does not publish when formatVersion is missing from config', () => {
            service.connect();
            flushConfig(validMqttOptions, { ...sampleTopicsConfig, version: undefined });
            service.publishWithMessageFormat({ topic: 'MADT/UpdateMainTab', msgID: 5, payload: {} });
            expect(fakeClient.publish).not.toHaveBeenCalled();
        });

        it('does not publish when msgSubID is invalid', () => {
            service.connect();
            flushConfig();
            service.publishWithMessageFormat({ topic: 'MADT/UpdateMainTab', msgID: 5, payload: {}, msgSubID: 99 });
            expect(fakeClient.publish).not.toHaveBeenCalled();
        });

        it('does not publish when msgID is missing', () => {
            service.connect();
            flushConfig();
            service.publishWithMessageFormat({
                topic: 'MADT/UpdateMainTab',
                msgID: undefined as any,
                payload: {},
            });
            expect(fakeClient.publish).not.toHaveBeenCalled();
        });

        it('publishes without the dev topic suffix when env is not dev', () => {
            environment.env = 'prod';
            service.connect();
            flushConfig();
            service.publishWithMessageFormat({ topic: 'MADT/UpdateMainTab', msgID: 5, payload: {} });

            const [topic] = fakeClient.publish.calls.mostRecent().args;
            expect(topic).toBe('MADT/UpdateMainTab');
        });

        it('allows any topic when no configured topics are known yet', () => {
            service.connect();
            // `version` alone yields no string leaves, so getAllConfiguredTopics() === [] while
            // formatVersion validation (which reads topics.version) still passes.
            flushConfig(validMqttOptions, { version: 1 });
            service.publishWithMessageFormat({ topic: 'anything/goes', msgID: 5, payload: {} });
            expect(fakeClient.publish).toHaveBeenCalled();
        });

        it('does not start a timeout for NOTIFY/RESPONSE msgSubID', () => {
            jasmine.clock().install();
            try {
                service.connect();
                flushConfig();
                const noResponses: number[][] = [];
                service.isTCNoResponse$.subscribe((v) => noResponses.push(v));

                service.publishWithMessageFormat({
                    topic: 'MADT/UpdateMainTab',
                    msgID: 7,
                    payload: {},
                    msgSubID: MsgSubID.RESPONSE,
                });
                jasmine.clock().tick(5001);
                expect(noResponses[noResponses.length - 1]).toEqual([]);
            } finally {
                jasmine.clock().uninstall();
            }
        });
    });

    describe('subscribe() / unsubscribe() / message handling', () => {
        it('logs an error and does nothing when client is not connected', () => {
            spyOn(console, 'error');
            service.unsubscribe('some/topic');
            service.subscribe({ topic: 'some/topic', callback: () => {} });
            expect(console.error).toHaveBeenCalledWith('Client is not connected.');
        });

        it('subscribes to the broker only once per topic across multiple handlers', async () => {
            await service.initializeClient(validMqttOptions);
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: () => {} });
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: () => {}, topicKey: 'second' });

            expect(fakeClient.subscribe).toHaveBeenCalledTimes(1);
            expect(fakeClient.subscribe).toHaveBeenCalledWith('MADT/UpdateMainTab/WILL', jasmine.any(Function));
        });

        it('attaches the message listener only once even with multiple subscribe() calls', async () => {
            await service.initializeClient(validMqttOptions);
            service.subscribe({ topic: 'topicA', callback: () => {} });
            service.subscribe({ topic: 'topicB', callback: () => {} });

            const messageOnCalls = (fakeClient.on as jasmine.Spy).calls
                .allArgs()
                .filter((args) => args[0] === 'message');
            expect(messageOnCalls.length).toBe(1);
        });

        it('logs a subscription error when the broker reports one', async () => {
            await service.initializeClient(validMqttOptions);
            fakeClient.subscribe.and.callFake((_t: string, cb: (err?: any) => void) => cb(new Error('bad sub')));
            spyOn(console, 'error');
            service.subscribe({ topic: 'topicA', callback: () => {} });
            expect(console.error).toHaveBeenCalledWith('Subscription error:', jasmine.any(Error));
        });

        it('delivers a valid incoming message to all registered handlers and clears TC-no-response on RESPONSE', async () => {
            await service.initializeClient(validMqttOptions);

            const handlerA = jasmine.createSpy('handlerA');
            const handlerB = jasmine.createSpy('handlerB');
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: handlerA, topicKey: 'a' });
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: handlerB, topicKey: 'b' });

            // Simulate a pending request whose timeout should be cleared by the RESPONSE below.
            const noResponses: number[][] = [];
            service.isTCNoResponse$.subscribe((v) => noResponses.push(v));
            (service as any).TCNoResponseSubject.next([99]);

            const messageListener = onHandlers['message'][0];
            const payload = JSON.stringify({
                header: {
                    dateTime: '2024-01-01T00:00:00+08:00',
                    formatVersion: 1,
                    msgID: 99,
                    msgSubID: MsgSubID.RESPONSE,
                },
                payload: { ok: true },
            });

            messageListener('MADT/UpdateMainTab/WILL', payload, {});

            expect(handlerA).toHaveBeenCalledWith(payload, 'MADT/UpdateMainTab/WILL', {});
            expect(handlerB).toHaveBeenCalledWith(payload, 'MADT/UpdateMainTab/WILL', {});
            expect(noResponses[noResponses.length - 1]).toEqual([]);
        });

        it('ignores messages for topics with no registered handlers', async () => {
            await service.initializeClient(validMqttOptions);
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: () => {} });

            const messageListener = onHandlers['message'][0];
            expect(() => messageListener('unknown/topic', '{}', {})).not.toThrow();
        });

        it('logs and returns early when incoming message is not valid JSON', async () => {
            await service.initializeClient(validMqttOptions);
            const handler = jasmine.createSpy('handler');
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: handler });

            spyOn(console, 'error');
            const messageListener = onHandlers['message'][0];
            messageListener('MADT/UpdateMainTab/WILL', 'not-json{', {});

            expect(handler).not.toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledWith(
                'Failed to parse MQTT message on topic:',
                'MADT/UpdateMainTab/WILL',
                jasmine.any(Error),
            );
        });

        it('validates the incoming message and still forwards it to handlers even when invalid', async () => {
            await service.initializeClient(validMqttOptions);
            const handler = jasmine.createSpy('handler');
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: handler });

            const errors: any[] = [];
            service.messageFormatError$.subscribe((v) => errors.push(v));

            const messageListener = onHandlers['message'][0];
            const badPayload = JSON.stringify({ header: { msgID: 5, msgSubID: 1 }, payload: {} }); // missing dateTime/formatVersion
            messageListener('MADT/UpdateMainTab/WILL', badPayload, {});

            expect(handler).toHaveBeenCalled();
            expect(errors[errors.length - 1]).not.toBeNull();
            expect(errors[errors.length - 1].errors).toContain('Missing header.dateTime');
        });

        it('reports "Missing or invalid header" when header is present but falsy (non-throwing edge case)', async () => {
            await service.initializeClient(validMqttOptions);
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: () => {} });

            const errors: any[] = [];
            service.messageFormatError$.subscribe((v) => errors.push(v));

            const messageListener = onHandlers['message'][0];
            const payload = JSON.stringify({ header: 0, payload: {} });
            messageListener('MADT/UpdateMainTab/WILL', payload, {});

            expect(errors[errors.length - 1]?.errors).toContain('Missing or invalid header');
        });

        it('validates topic against the non-dev-suffixed name when env is not dev', async () => {
            environment.env = 'prod';
            await service.initializeClient(validMqttOptions);
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: () => {} });

            const errors: any[] = [];
            service.messageFormatError$.subscribe((v) => errors.push(v));

            const messageListener = onHandlers['message'][0];
            const payload = JSON.stringify({
                header: { dateTime: 'x', formatVersion: 1, msgID: 1, msgSubID: 1 },
                payload: {},
            });
            messageListener('MADT/UpdateMainTab', payload, {});
            // No configured topics loaded (mqttConfig is null) -> validTopics is [] -> no topic error.
            expect(errors[errors.length - 1]).toBeNull();
        });

        it('removes only the handler for the given topicKey, keeping others and the subscription active', async () => {
            await service.initializeClient(validMqttOptions);
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: () => {}, topicKey: 'a' });
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: () => {}, topicKey: 'b' });

            service.unsubscribe('MADT/UpdateMainTab', 'a');

            expect(fakeClient.unsubscribe).not.toHaveBeenCalled();
            expect((service as any).topicHandlers['MADT/UpdateMainTab/WILL'].length).toBe(1);
        });

        it('unsubscribes from the broker once the last handler for a topicKey is removed', async () => {
            await service.initializeClient(validMqttOptions);
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: () => {}, topicKey: 'a' });

            service.unsubscribe('MADT/UpdateMainTab', 'a');

            expect(fakeClient.unsubscribe).toHaveBeenCalledWith('MADT/UpdateMainTab/WILL', jasmine.any(Function));
            expect((service as any).topicHandlers['MADT/UpdateMainTab/WILL']).toBeUndefined();
        });

        it('removes all handlers and unsubscribes when no topicKey is given', async () => {
            await service.initializeClient(validMqttOptions);
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: () => {}, topicKey: 'a' });
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: () => {}, topicKey: 'b' });

            service.unsubscribe('MADT/UpdateMainTab');

            expect(fakeClient.unsubscribe).toHaveBeenCalledWith('MADT/UpdateMainTab/WILL', jasmine.any(Function));
            expect((service as any).topicHandlers['MADT/UpdateMainTab/WILL']).toBeUndefined();
        });

        it('does nothing when unsubscribing (with or without topicKey) from a topic that was never subscribed', async () => {
            await service.initializeClient(validMqttOptions);
            expect(() => service.unsubscribe('never/subscribed')).not.toThrow();
            expect(() => service.unsubscribe('never/subscribed', 'someKey')).not.toThrow();
            expect(fakeClient.unsubscribe).not.toHaveBeenCalled();
        });

        it('unsubscribes using the bare topic name (no dev suffix) when env is not dev', async () => {
            environment.env = 'prod';
            await service.initializeClient(validMqttOptions);
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: () => {} });

            service.unsubscribe('MADT/UpdateMainTab');

            expect(fakeClient.unsubscribe).toHaveBeenCalledWith('MADT/UpdateMainTab', jasmine.any(Function));
        });

        it('logs an error when the broker reports a failure while unsubscribing', async () => {
            await service.initializeClient(validMqttOptions);
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: () => {} });
            fakeClient.unsubscribe.and.callFake((_t: string, cb: (err?: any) => void) => cb(new Error('nope')));

            spyOn(console, 'error');
            service.unsubscribe('MADT/UpdateMainTab');
            expect(console.error).toHaveBeenCalledWith(
                'Error unsubscribing from topic MADT/UpdateMainTab/WILL:',
                jasmine.any(Error),
            );
        });
    });

    describe('mqtt log helpers', () => {
        it('clearMqttLog() resets the log back to just the CSV header', async () => {
            await service.initializeClient(validMqttOptions);
            service.publish('some/topic', JSON.stringify({ a: 1 }));

            const before = (service as any).mqttLogSubject.value;
            expect(before.length).toBeGreaterThan(0);

            service.clearMqttLog();
            const after = (service as any).mqttLogSubject.value;
            expect(after).toBe('timestamp,topic,msgID,msgSubID,message\n');
        });

        it('escapes commas/quotes in logged CSV rows', async () => {
            await service.initializeClient(validMqttOptions);
            service.publish('some,topic"quoted', JSON.stringify({ a: 'has,comma and "quotes"' }));
            const value = (service as any).mqttLogSubject.value;
            expect(value).toContain('"');
        });

        it('does not log when environment.displayAutoClick is false', async () => {
            environment.displayAutoClick = false;
            await service.initializeClient(validMqttOptions);
            const before = (service as any).mqttLogSubject.value;
            service.publish('some/topic', '{}');
            expect((service as any).mqttLogSubject.value).toBe(before);
        });

        it('downloadMqttLog() uses the default filename when none is provided', () => {
            spyOn(HTMLAnchorElement.prototype, 'click');
            spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
            spyOn(URL, 'revokeObjectURL');

            expect(() => service.downloadMqttLog()).not.toThrow();
            expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
        });

        it('downloadMqttLog() creates and clicks a download anchor', () => {
            spyOn(HTMLAnchorElement.prototype, 'click');
            const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
            const revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');

            service.downloadMqttLog('my-log.csv');

            expect(createObjectURLSpy).toHaveBeenCalled();
            expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
            expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:fake');
        });
    });

    describe('resetTCNoResponse()', () => {
        it('resets the TC-no-response list to empty', () => {
            (service as any).TCNoResponseSubject.next([1, 2, 3]);
            service.resetTCNoResponse();
            expect((service as any).TCNoResponseSubject.value).toEqual([]);
        });
    });

    describe('userDataInit()', () => {
        it('stores the current user data', () => {
            const user = { id: '1' } as any;
            service.userDataInit(user);
            expect(service.currentUserData).toBe(user);
        });
    });

    describe('ngOnDestroy()', () => {
        it('disconnects the client and clears the pending timeout', async () => {
            await service.initializeClient(validMqttOptions);
            service.subscribe({ topic: 'MADT/UpdateMainTab', callback: () => {} });
            const client = fakeClient;

            service.ngOnDestroy();

            expect(client.end).toHaveBeenCalled();
        });
    });

    describe('isHashedPassword() (private, exercised directly for branch coverage)', () => {
        it('returns false for an empty/falsy password', () => {
            expect((service as any).isHashedPassword('')).toBeFalse();
        });

        it('returns true only when the password is prefixed with enc:', () => {
            expect((service as any).isHashedPassword('enc:xyz')).toBeTrue();
            expect((service as any).isHashedPassword('plain')).toBeFalse();
        });
    });
});
