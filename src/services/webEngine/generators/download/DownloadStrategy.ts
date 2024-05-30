import type { CheerioAPI } from "cheerio";
import type {FetchEngine} from "../../../fetchEngine/fetch";
import {DefaultFetch} from "../../../fetchEngine/defaults/DefaultFetch";

export type DownloadStrategyParams = {
    type: 'fetch_link' | 'complex_link';
    [key: string]: unknown;
};

export interface DownloadStrategyReturn {
    url: string;
}

export abstract class DownloadStrategy {
    readonly type: 'fetch_link' | 'complex_link' | undefined;
    public fetcher: FetchEngine;

    protected constructor() {
        this.fetcher = new DefaultFetch();
    }

    abstract execute(page: CheerioAPI, params?: DownloadStrategyParams): Promise<DownloadStrategyReturn>;
}
