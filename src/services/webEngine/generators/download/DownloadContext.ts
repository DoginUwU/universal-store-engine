import type { CheerioAPI } from "cheerio";
import type { DownloadStrategy, DownloadStrategyParams, DownloadStrategyReturn } from "./DownloadStrategy";
import { FetchLinkStrategy } from "./FetchLinkStrategy";
import { ComplexLinkStrategy } from "./ComplexLinkStrategy";

const STRATEGIES = [new FetchLinkStrategy(), new ComplexLinkStrategy()] as const;

export class DownloadContext {
  private strategy: DownloadStrategy;
  private page: CheerioAPI;
  private params: DownloadStrategyParams;

  constructor(page: CheerioAPI, params: DownloadStrategyParams) {
    this.params = params;
    this.page = page;

    const strategy = STRATEGIES.find((strategy) => strategy.type === params.type);

    if (!strategy) {
      throw new Error('Strategy not found');
    }

    this.strategy = strategy;
  }

  async executeStrategy(): Promise<DownloadStrategyReturn> {
    return this.strategy.execute(this.page, this.params);
  }
}
