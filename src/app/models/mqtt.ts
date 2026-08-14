import { IClientPublishOptions } from 'mqtt';
export interface ISubscribeMQTT {
    topic: string;
    callback: (message: string, topic?: string, packet?: any) => void;
    topicKey?: string;
}

export const MqttTypes = {
    BE_RESPONSE: 'BE_RESPONSE',
    FE_REQUEST: 'FE_REQUEST',
} as const;

export interface IMessageFormat {
    header: {
        dateTime: string;
        formatVersion: string;
        msgID: number;
        msgSubID?: number;
    };
    payload: any;
}

export interface IPublishParameter {
    topic: string;
    msgID: number;
    payload?: any;
    msgSubID?: number;
    opts?: IClientPublishOptions;
}

export interface IMessageFormatError {
    topic: string;
    direction: 'incoming' | 'outgoing';
    errors: string[];
    timestamp: number;
    msgID?: number;
    msgSubID?: number;
}

export interface IMqttLog {
    timestamp: string;

    topic: string;
    msgID?: number;
    msgSubID?: number;
    message: any;
}
