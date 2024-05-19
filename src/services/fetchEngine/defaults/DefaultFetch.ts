import type {FetchEngine, GetConfig, GetReturn} from "../fetch";

export class DefaultFetch implements FetchEngine {
    async get<T>(url: string, config: GetConfig): Promise<GetReturn<T>> {
        const response = await fetch(url, { headers: config.headers });

        const fn = config.responseType === 'json' ? response.json : response.text;

        const data = await fn.call(response);

        return { data };
    }
}
