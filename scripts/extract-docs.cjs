const { chromium } = require("playwright");
const fs = require("fs");

async function extractFormattedContent(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "networkidle" });

  // Extract content with better formatting
  const content = await page.evaluate(() => {
    // Helper function to get text from an element with proper spacing
    function getTextContent(element) {
      if (!element) return "";

      // Clone the element to avoid modifying the original
      const clone = element.cloneNode(true);

      // Remove unwanted elements
      const unwanted = clone.querySelectorAll(
        "script, style, svg, iframe, nav"
      );
      unwanted.forEach((el) => el.remove());

      // Process the element to improve text formatting
      const walk = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
      let node;
      let text = "";

      while ((node = walk.nextNode())) {
        const parent = node.parentElement;
        const content = node.textContent.trim();

        if (!content) continue;

        // Add appropriate formatting based on element type
        if (parent.tagName === "H1") text += `# ${content}\n\n`;
        else if (parent.tagName === "H2") text += `## ${content}\n\n`;
        else if (parent.tagName === "H3") text += `### ${content}\n\n`;
        else if (parent.tagName === "H4") text += `#### ${content}\n\n`;
        else if (parent.tagName === "H5") text += `##### ${content}\n\n`;
        else if (parent.tagName === "H6") text += `###### ${content}\n\n`;
        else if (parent.tagName === "P") text += `${content}\n\n`;
        else if (parent.tagName === "LI") text += `- ${content}\n`;
        else if (parent.tagName === "CODE") text += `\`${content}\``;
        else if (parent.tagName === "PRE")
          text += `\`\`\`\n${content}\n\`\`\`\n\n`;
        else text += `${content} `;
      }

      return text;
    }

    // Get content from main content area or body
    const mainContent =
      document.querySelector("main") ||
      document.querySelector("article") ||
      document.body;
    return getTextContent(mainContent);
  });

  await browser.close();
  return content;
}

// Replace with your target URL
const url = "https://codemirror.net/docs/ref/";

(async () => {
  try {
    console.log("Starting extraction...");
    const content = await extractFormattedContent(url);

    fs.writeFileSync("codemirror-docs.md", content, "utf8");
    console.log("Content extracted and saved to codemirror-docs.md");
  } catch (error) {
    console.error("Error extracting content:", error);
  }
})();
