import axios from "axios";
import type { CheerioAPI } from "cheerio";
import type { DownloadStrategy, DownloadStrategyParams, DownloadStrategyReturn } from "./DownloadStrategy";

interface ComplexLinkStrategyParams extends DownloadStrategyParams {
    type: 'complex_link';
    steps: Step[];
}

type FindInHtmlStep = {
    type: 'find_in_html';
    regex: string;
    html?: string;
}

type MakeRequestStep = {
    type: 'make_request';
    url: string;
    method: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: string;
}

type Step = {
    variable?: unknown;
    is_last?: boolean;
} & (FindInHtmlStep | MakeRequestStep);

export class ComplexLinkStrategy implements DownloadStrategy {
    readonly type = 'complex_link';
    private globalVariables: Record<string, unknown> = {};

    async execute(page: CheerioAPI, params: ComplexLinkStrategyParams): Promise<DownloadStrategyReturn> {
        let url = '';
        this.globalVariables = {};

        for (const step of params.steps) {
            switch (step.type) {
                case 'find_in_html':
                    const html = step.html ? this.replaceVariables(step.html) : page.html();

                    const value = await this.findInHtml(html, step);

                    if (step.variable) {
                        this.globalVariables[step.variable as string] = value;
                    }
                    break;

                case 'make_request':
                    const response = await this.makeRequest(step);

                    if (step.variable) {
                        this.globalVariables[step.variable as string] = response;
                    }
                    break;
            
                default:
                    // @ts-expect-error - This should never happen
                    throw new Error(`Unknown step type: ${step.type}`);
            }

            if (step.is_last) {
                url = this.globalVariables[step.variable as string] as string;
                break;
            }
        }

        return { url };
    }

    private async findInHtml(html: string, step: Step & { type: 'find_in_html' }) {
        const [, value] = html.match(new RegExp(step.regex)) ?? [];

        if (!value) {
            throw new Error('Link not found');
        }

        return value;
    }

    private async makeRequest(step: Step & { type: 'make_request' }) {
        const response = await axios.request({
            url: step.url,
            method: step.method,
            headers: step.headers,
            data: step.body ? this.replaceVariables(step.body) : undefined,
        });

        return response.data;
    }

    private replaceVariables(rawData: string) {
        const regex = /{{(\w+)}}/g;

        return rawData.replace(regex, (_match, variable) => {
            return this.globalVariables[variable] as string;
        });
    }
}
