import { load } from "cheerio";
import type { FetchEngine } from "../services/fetchEngine/fetch";

interface GetPageConfig {
    headers: Record<string, string>;
    fetcher: FetchEngine;
}

export async function getPage(url: string, config: GetPageConfig) {
    const { data } = await config.fetcher.get<string>(url, { headers: config.headers });
    
    return load(data);
}
