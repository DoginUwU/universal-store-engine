import {FetchEngine, type GetConfig, type GetReturn} from "../fetch";

export class DefaultFetch extends FetchEngine {
    async get<T>(url: string, config: GetConfig): Promise<GetReturn<T>> {
        const response = await fetch(url, { headers: config.headers });

        const fn = config.responseType === 'json' ? response.json : response.text;

        const data = await fn.call(response);

        return { data };
    }

    async post<T>(url: string, body: unknown, config: GetConfig): Promise<GetReturn<T>> {
        const response = await fetch(url, { method: 'POST', body: body as string, headers: config.headers });

        const fn = config.responseType === 'json' ? response.json : response.text;

        const data = await fn.call(response);

        return { data };
    }
}
