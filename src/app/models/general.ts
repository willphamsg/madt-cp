export interface IGlobalError {
    code: string;
    message: string;
    timeout?: number;
}

export interface IAudioVolume {
    value?: number;
}
export interface IConfig {
    language?: string;
    volume?: IAudioVolume;
}

export interface IPosnStatus {
    GNSSSource: number;
    busLocationSource: number;
}
