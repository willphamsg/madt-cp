import { Injectable, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import mqtt, { IClientPublishOptions } from 'mqtt';
import { BehaviorSubject, catchError, of, tap, Subject } from 'rxjs';
import { environment } from '@env/environment';
import { AuthService } from './auth.service';
import {
    ICurrentUser,
    ISubscribeMQTT,
    IMessageFormat,
    IPublishParameter,
    IMessageFormatError,
    IMqttLog,
    MsgSubID,
    DEFAULT_TIMEOUT,
} from '@models';

@Injectable({
    providedIn: 'root',
})
export class MqttService implements OnDestroy {
    private client: mqtt.MqttClient | null = null;
    private isConnecting = false;
    private readonly destroy$ = new Subject<void>();
    public static readonly LOCAL_STORAGE_KEY = 'mqttBrokerUrl';

    private connectionCount: number = 0;
    mqttConfig: any = null;
    currentUserData: ICurrentUser | null = null;

    // Observable for connection status
    private readonly connectionStatusSubject = new BehaviorSubject<boolean | null>(null);
    readonly connectionStatus$ = this.connectionStatusSubject.asObservable();

    // Observable for MQTT config loaded status
    private readonly mqttConfigLoadedSubject = new BehaviorSubject<boolean>(false);
    readonly mqttConfigLoaded$ = this.mqttConfigLoadedSubject.asObservable();

    // Observable for MQTT config reconnection status
    private readonly isReconnectSubject = new BehaviorSubject<boolean>(false);
    readonly isReconnect$ = this.isReconnectSubject.asObservable();

    // TC no response
    private readonly TCNoResponseSubject = new BehaviorSubject<number[]>([]);
    readonly isTCNoResponse$ = this.TCNoResponseSubject.asObservable();

    // Message format validation
    private readonly messageFormatErrorSubject = new BehaviorSubject<IMessageFormatError | null>(null);
    readonly messageFormatError$ = this.messageFormatErrorSubject.asObservable();

    // Message log middleware (publish + subscribe) — stored as CSV rows
    private readonly CSV_HEADER = 'timestamp,topic,msgID,msgSubID,message\n';
    private readonly mqttLogSubject = new BehaviorSubject<string>(this.CSV_HEADER);
    readonly mqttLog$ = this.mqttLogSubject.asObservable();

    private timeOutId;

    // Store multiple handlers for the same topic
    private topicHandlers: {
        [topic: string]: Array<{
            topicKey: string;
            handler: (message: string, topic: string, packet) => void;
        }>;
    } = {};

    private messageListener: ((topic: string, message: Buffer, packet) => void) | null = null;

    constructor(
        private readonly http: HttpClient,
        private readonly authService: AuthService,
    ) {}

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.disconnect();
        clearTimeout(this.timeOutId);
    }

    connect() {
        if (this.isConnecting) {
            console.log('Already connecting to a broker.');
            return;
        }
        this.isConnecting = true;
        this.connectionStatusSubject.next(false);

        this.http
            .get('/assets/mqtt-config.json', { params: { _: new Date().getTime().toString() } })
            .pipe(
                tap((mqttConfig: any) => {
                    this.mqttConfig = mqttConfig;
                    console.log('mqtt config json file', mqttConfig);
                    this.mqttConfigLoadedSubject.next(true); // Notify that the configuration is loaded
                    if (this.client) {
                        this.client.end(() => {
                            console.log('Disconnected from previous broker');
                            this.client = null;
                            this.initializeClient(mqttConfig?.mqtt);
                        });
                    } else {
                        this.initializeClient(mqttConfig?.mqtt);
                    }
                }),
                catchError((error: HttpErrorResponse) => {
                    console.error('Error fetching MQTT config:', error.message);
                    this.isConnecting = false;
                    this.connectionStatusSubject.next(false); // Notify that the connection failed
                    this.mqttConfigLoadedSubject.next(false); // Notify that configuration loading failed
                    return of(null); // Return an observable to complete the stream
                }),
            )
            .subscribe();
    }

    disconnect(): void {
        if (this.client) {
            // Remove message listener first
            if (this.messageListener) {
                this.client.removeListener('message', this.messageListener);
                this.messageListener = null;
            }

            // Unsubscribe from all topics
            const topics = Object.keys(this.topicHandlers);
            if (topics.length > 0) {
                topics.forEach((topic) => {
                    this.client?.unsubscribe(topic, (err) => {
                        if (err) {
                            console.error(`Error unsubscribing from topic ${topic}:`, err);
                        } else {
                            console.log(`Unsubscribed from topic: ${topic}`);
                        }
                    });
                });
            }

            // Clear topic handlers
            this.topicHandlers = {};

            // End client connection
            this.client.end(true, () => {
                console.log('Disconnected from MQTT broker');
            });

            this.client = null;
        }

        this.connectionStatusSubject.next(false);
    }

    async initializeClient(mqttOptions: any): Promise<void> {
        try {
            const { host, protocol, port, path, keepalive, username, password } = mqttOptions;
            const brokerUrl = `${protocol}://${host}:${port}${path || ''}`;
            const connectOptions: mqtt.IClientOptions = {
                keepalive: keepalive ?? 30,
            };
            if (username) {
                connectOptions.username = username;
            }

            if (password && !this.isHashedPassword(password)) {
                connectOptions.password = password;
            } else if (password) {
                const decryptedPassword = this.authService.decryptPassword(password);
                connectOptions.password = decryptedPassword;
            }

            this.client = mqtt.connect(brokerUrl, connectOptions);
            this.client.on('connect', () => {
                console.log('Connected to MQTT broker at:', brokerUrl);
                this.isConnecting = false;
                this.connectionStatusSubject.next(true);

                this.connectionCount++;
                this.isReconnectSubject.next(this.connectionCount > 1 ? true : false);
            });

            this.client.on('error', (error) => {
                console.error('MQTT Error:', error);
                this.isConnecting = false;
                this.connectionStatusSubject.next(false);
            });

            this.client.on('close', () => {
                this.connectionStatusSubject.next(false);
                console.log('Disconnected from MQTT broker');
            });

            this.client.on('offline', () => {
                this.connectionStatusSubject.next(false);
                console.log('MQTT client went offline');
            });
        } catch (e: any) {
            console.error('Error initializing MQTT client:', e?.message);
            this.isConnecting = false;
            this.connectionStatusSubject.next(false);
        }
    }

    private isHashedPassword(password: string): boolean {
        if (!password) {
            return false;
        }
        return password.startsWith('enc:');
    }

    private logMessage(topic: string, message: any): void {
        if (!environment?.displayAutoClick) {
            return;
        }
        const entry: IMqttLog = {
            timestamp: new Date().toISOString(),
            topic,
            msgID: message?.header?.msgID ?? undefined,
            msgSubID: message?.header?.msgSubID ?? undefined,
            message,
        };
        const escapeCsv = (value: string): string => {
            const str = value.replace(/"/g, '""');
            return /[,"\n\r]/.test(str) ? `"${str}"` : str;
        };
        const row =
            `${entry.timestamp},` +
            `${escapeCsv(entry.topic)},` +
            `${entry.msgID ?? ''},` +
            `${entry.msgSubID ?? ''},` +
            `${escapeCsv(JSON.stringify(entry.message))}\n`;
        this.mqttLogSubject.next(this.mqttLogSubject.value + row);
    }

    clearMqttLog(): void {
        this.mqttLogSubject.next(this.CSV_HEADER);
    }

    downloadMqttLog(filename = 'mqtt-log.csv'): void {
        const csv = this.mqttLogSubject.value;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }

    private validateMessageFormat(message: any, topic: string, direction: 'incoming' | 'outgoing'): boolean {
        this.messageFormatErrorSubject.next(null);

        if (message.header.msgID === 0) {
            return true;
        }

        const errors: string[] = [];

        // Validate topic against configured topics
        const validTopics = this.getAllConfiguredTopics();
        if (validTopics.length > 0 && !validTopics.includes(topic)) {
            errors.push(`Topic "${topic}" is not defined in mqtt-config.json`);
        }

        if (!message || typeof message !== 'object') {
            errors.push('Message must be an object');
        } else {
            if (!message.header || typeof message.header !== 'object') {
                errors.push('Missing or invalid header');
            } else {
                if (!message.header.dateTime) errors.push('Missing header.dateTime');
                if (!message.header.formatVersion) errors.push('Missing header.formatVersion');
                if ([null, undefined].includes(message.header.msgID)) errors.push('Missing header.msgID');
                if (![1, 2, 3].includes(message.header.msgSubID)) errors.push('Invalid header.msgSubID');
            }

            if (!message.payload) {
                errors.push('Payload cannot be null or undefined');
            } else if (typeof message.payload !== 'object' && !Array.isArray(message.payload)) {
                errors.push('Payload must be a non-array object');
            }
        }

        if (errors.length > 0) {
            const formatError: IMessageFormatError = {
                topic,
                direction,
                errors,
                timestamp: Date.now(),
            };
            if (message?.header?.msgID) {
                formatError.msgID = message.header.msgID;
            }
            if (message?.header?.msgSubID) {
                formatError.msgSubID = message.header.msgSubID;
            }
            this.messageFormatErrorSubject.next(formatError);
            console.warn(`Invalid message format [${direction}] on topic "${topic}":`, errors);
            return false;
        }

        return true;
    }

    private getAllConfiguredTopics(): string[] {
        const topics = this.mqttConfig?.topics;
        if (!topics) return [];
        const result: string[] = [];
        const extract = (obj: any): void => {
            for (const key of Object.keys(obj)) {
                const val = obj[key];
                if (typeof val === 'string') {
                    result.push(val);
                } else if (typeof val === 'object' && val !== null) {
                    extract(val);
                }
            }
        };
        extract(topics);
        return result;
    }

    userDataInit(userData: ICurrentUser) {
        this.currentUserData = userData;
    }

    publish(topic: string, message: string, opts?: IClientPublishOptions) {
        if (this.client) {
            const topicFormat = environment?.env === 'dev' ? `${topic}/${environment?.localDeveloperName}` : topic;
            this.client.publish(topicFormat, message, opts);
            const parsed = (() => {
                try {
                    return JSON.parse(message);
                } catch {
                    return message;
                }
            })();
            console.log('publish', topic, parsed, 'env = ', environment?.env);
            if (environment?.displayAutoClick) {
                this.logMessage(topic, parsed);
            }
        } else {
            console.error('Client is not connected.');
        }
    }

    publishWithFormat(topic: string, message: any, opts?: IClientPublishOptions) {
        if (this.client) {
            const topicFormat = environment?.env === 'dev' ? `${topic}/${environment?.localDeveloperName}` : topic;
            const formatMess = {
                timeStamp: new Date()?.getTime(),
                messformatversion: this.mqttConfig?.topics?.version,
                ...message,
            };
            this.client.publish(topicFormat, JSON.stringify(formatMess), opts);
            console.log('publish', topicFormat, formatMess, 'env = ', environment?.env);
            if (environment?.displayAutoClick) {
                this.logMessage(topic, formatMess);
            }
        } else {
            console.error('Client is not connected.');
        }
    }

    publishWithMessageFormat({ topic, msgID, payload, opts, msgSubID = MsgSubID?.REQUEST }: IPublishParameter) {
        if (this.client) {
            // this.TCNoResponseSubject.next(false);

            if (!topic || typeof topic !== 'string') {
                console.error('Cannot publish MQTT message: missing topic.', { msgID, msgSubID, payload });
                return;
            }

            const topicFormat = environment?.env === 'dev' ? `${topic}/${environment?.localDeveloperName}` : topic;
            const formatMess: IMessageFormat = {
                header: {
                    dateTime: new DatePipe('en-SG').transform(new Date(), `yyyy-MM-dd'T'HH:mm:ssZZZZZ`) as string,
                    formatVersion: this.mqttConfig?.topics?.version,
                    msgID,
                    msgSubID,
                },
                payload,
            };
            if (!this.validateMessageFormat(formatMess, topic, 'outgoing')) {
                return;
            }
            this.client.publish(topicFormat, JSON.stringify(formatMess), { qos: 2, ...opts });

            if (environment?.displayAutoClick) {
                this.logMessage(topicFormat, formatMess);
            }
            if (msgSubID === MsgSubID.REQUEST) {
                clearTimeout(this.timeOutId);
                this.timeOutId = setTimeout(() => {
                    this.TCNoResponseSubject.next([...new Set([...this.TCNoResponseSubject.value, msgID])]);
                }, DEFAULT_TIMEOUT);
            }

            console.log('publish', topicFormat, formatMess, 'env = ', environment?.env);
        } else {
            console.error('Client is not connected.');
        }
    }

    // Subscribe to a topic with multiple handlers
    subscribe({ topic, callback, topicKey }: ISubscribeMQTT): void {
        const formatTopic = environment?.env === 'dev' ? `${topic}/${environment?.localDeveloperName}` : topic;
        if (!this.client) {
            console.error('Client is not connected.');
            return;
        }

        // Initialize topic handlers if needed
        if (!this.topicHandlers[formatTopic]) {
            this.topicHandlers[formatTopic] = [];
        }

        // Add the handler to the topicHandlers array
        this.topicHandlers[formatTopic].push({
            handler: callback,
            topicKey: topicKey || 'main',
        });

        // Subscribe to the topic if it's the first handler for this topic
        if (this.topicHandlers[formatTopic].length === 1) {
            this.client.subscribe(formatTopic, (err) => {
                if (err) {
                    console.error('Subscription error:', err);
                } else {
                    console.log('Subscribed to topic:', formatTopic);
                }
            });
        }

        // Attach the message listener only once
        if (!this.messageListener) {
            this.messageListener = (currentTopic: string, message: Buffer, packet) => {
                if (this.topicHandlers[currentTopic]) {
                    let parsed: any;
                    try {
                        parsed = JSON.parse(message?.toString());
                    } catch (e) {
                        console.error('Failed to parse MQTT message on topic:', currentTopic, e);
                        return;
                    }
                    const msgID = parsed?.header?.msgID;
                    const msgSubID = parsed?.header?.msgSubID;
                    if (msgID != null && msgSubID === MsgSubID.RESPONSE) {
                        clearTimeout(this.timeOutId);
                        this.timeOutId = null;
                        // console.log('Clearing existing timeout for TC response');
                        this.TCNoResponseSubject.next(this.TCNoResponseSubject.value.filter((id) => id !== msgID));
                    }
                    if (environment?.displayAutoClick) {
                        this.logMessage(currentTopic, parsed);
                    }
                    console.log('mqtt service received message', currentTopic, parsed);
                    const validTopic =
                        environment?.env === 'dev'
                            ? currentTopic.replace(`/${environment?.localDeveloperName}`, '')
                            : currentTopic;
                    this.validateMessageFormat(parsed, validTopic, 'incoming');
                    // Call each stored handler for this topic
                    this.topicHandlers[currentTopic].forEach(({ handler }) => {
                        handler(message?.toString(), currentTopic, packet);
                    });
                }
            };

            this.client.on('message', this.messageListener);
        }
    }

    // Unsubscribe from a specific topic or handler
    unsubscribe(topic: string, topicKey?: string): void {
        if (!this.client) {
            console.error('Client is not connected.');
            return;
        }

        const formatTopic = environment?.env === 'dev' ? `${topic}/${environment?.localDeveloperName}` : topic;

        if (topicKey) {
            // Remove the specific handler for this topic
            if (this.topicHandlers[formatTopic]) {
                this.topicHandlers[formatTopic] = this.topicHandlers[formatTopic].filter(
                    ({ topicKey: currentKey }) => currentKey !== topicKey,
                );
                console.log(`Removed ${topicKey} handler for topic ${topic}`);

                // If no more handlers for this topic, unsubscribe
                if (this.topicHandlers[formatTopic].length === 0) {
                    this.unsubscribeFromTopic(formatTopic);
                    delete this.topicHandlers[formatTopic];
                }
            }
        } else {
            // Remove all handlers and unsubscribe from topic
            if (this.topicHandlers[formatTopic]) {
                this.unsubscribeFromTopic(formatTopic);
                delete this.topicHandlers[formatTopic];
            }
        }
    }

    private unsubscribeFromTopic(formatTopic: string): void {
        this.client?.unsubscribe(formatTopic, (err) => {
            if (err) {
                console.error(`Error unsubscribing from topic ${formatTopic}:`, err);
            } else {
                console.log(`Successfully unsubscribed from topic ${formatTopic}`);
            }
        });
    }

    resetTCNoResponse(): void {
        this.TCNoResponseSubject.next([]);
    }
}
