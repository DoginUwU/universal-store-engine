import type { CheerioAPI } from "cheerio";
import {DownloadStrategy, type DownloadStrategyParams, type DownloadStrategyReturn} from "./DownloadStrategy";

interface FetchLinkStrategyParams extends DownloadStrategyParams {
    type: 'fetch_link';
    regex?: string;
    link_before?: string;
    link_params?: string;
    response_body?: string;
}

export class FetchLinkStrategy extends DownloadStrategy {
    readonly type = 'fetch_link';

    constructor() {
        super();
    }

    async execute(page: CheerioAPI, params: FetchLinkStrategyParams): Promise<DownloadStrategyReturn> {
        const regex = new RegExp(params.regex!);
        const html = page.html();
        const [, rawLink] = html.match(regex) ?? [];

        if (!rawLink) {
            throw new Error('Link not found');
        }

        let link = params.link_before ? `${params.link_before}${rawLink}` : rawLink;
        
        const url = new URL(link);

        if(params.link_params) {
            url.search = params.link_params;
        }

        if(params.response_body) {
            const response = await fetch(url.toString());
            const body = await response.text();

            const regex = new RegExp(params.response_body);
            const [, findedUrl] = body.match(regex) ?? [];

            if (!findedUrl) {
                throw new Error('Link not found');
            }

            link = new URL(findedUrl.replace(/\\(.)/g, '$1')).toString();
        }

        return { url: link };
    }
}
