export interface GetConfig {
    headers?: Record<string, string>;
    responseType?: 'json' | 'text';
}

export interface GetReturn<T> {
    data: T;
}

interface GenericRequest {
    url: string;
    config: GetConfig;
    body?: unknown;
    method: 'GET' | 'POST';
}

export abstract class FetchEngine {
    public request<T>(data: GenericRequest): Promise<GetReturn<T>> {
        const { url, config, body, method } = data;

        const fns = {
            GET: this.get<T>(url, config),
            POST: this.post<T>(url, body, config)
        }

        return fns[method];
    }

    abstract get<T>(url: string, config?: GetConfig): Promise<GetReturn<T>>;
    abstract post<T>(url: string, body: unknown, config?: GetConfig): Promise<GetReturn<T>>;
}
