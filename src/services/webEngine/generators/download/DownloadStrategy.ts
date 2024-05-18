import type { CheerioAPI } from "cheerio";

export type DownloadStrategyParams = {
    type: 'fetch_link' | 'complex_link';
    [key: string]: unknown;
};

export interface DownloadStrategyReturn {
    url: string;
}

export abstract class DownloadStrategy {
    readonly type: 'fetch_link' | 'complex_link' | undefined;
    abstract execute(page: CheerioAPI, params?: DownloadStrategyParams): Promise<DownloadStrategyReturn>;
}
