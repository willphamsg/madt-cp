export interface IGlobalError {
    esn?: string;
    code: string;
    description: string;
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
