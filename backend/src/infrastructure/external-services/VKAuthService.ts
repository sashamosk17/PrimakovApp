export class VKAuthService {
  async exchangeCode(_code: string): Promise<{ vkId: string }> {
    return { vkId: "" };
  }
}
