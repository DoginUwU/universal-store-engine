export interface GetConfig {
    headers?: Record<string, string>;
    responseType?: 'json' | 'text';
}

export interface GetReturn<T> {
    data: T;
}

export abstract class FetchEngine {
    abstract get<T>(url: string, config?: GetConfig): Promise<GetReturn<T>>;
}
