export async function updateRulesForModifyHeader() {
  const extensionId = browser.runtime.id; // Get the current extension's ID
  const domains = [
    { domain: "chatgpt.com", id: 100 },
    { domain: "www.kimi.com", id: 101 },
  ];
  for (const { domain, id } of domains) {
    updateModifyHeadersDynamicRuleForDomain({ domain, id }, extensionId);
  }
}

async function updateModifyHeadersDynamicRuleForDomain(
  option: { domain: string; id: number },
  extensionId: string
) {
  const { domain, id } = option;

  const newRule: Browser.declarativeNetRequest.Rule = {
    id: id, // Assign a unique ID for this rule
    priority: 1, // Set priority if needed
    action: {
      type: browser.declarativeNetRequest.RuleActionType.MODIFY_HEADERS, // Or 'block', 'redirect', 'allow', 'upgradeScheme'
      // --- Example: Add a custom header ---
      requestHeaders: [
        {
          operation: "set" as Browser.declarativeNetRequest.HeaderOperation,
          header: "origin",
          value: `https://${domain}`,
        },
        {
          operation: "set" as Browser.declarativeNetRequest.HeaderOperation,
          header: "referer",
          value: `https://${domain}`,
        },
      ],
      // --- Example: Block the request ---
      // type: 'block'
    },
    condition: {
      requestDomains: [domain],
      resourceTypes: [
        browser.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
      ],
      initiatorDomains: [extensionId],
    },
  };

  try {
    // Get existing rules first to avoid conflicts or exceeding limits
    const existingRules = await browser.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map((rule) => rule.id);

    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds.includes(newRule.id) ? [newRule.id] : [], // Remove if exists to update
      addRules: [newRule],
    });
    console.log("Rule added/updated successfully for domain:", domain);
  } catch (error) {
    console.error("Error updating declarativeNetRequest rules:", error);
  }
}
