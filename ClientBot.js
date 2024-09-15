const puppeteer = require("puppeteer");
const timeoutMax = 5000; // Increased slightly for better reliability

class ClientBot {
  constructor(username, password, url, extensionPath, bots) {
    this.username = username;
    this.password = password;
    this.url = url;
    this.extensionPath = extensionPath;
    this.bots = bots;
  }

  async run() {
    // Create browser with/without Extensions depending on extensionPath
    let browser;
    if (this.extensionPath === null) {
      const browserWithoutExtensions = await puppeteer.launch({
        headless: false,
      });
      browser = browserWithoutExtensions
    }
    else{
    const browserWithExtensions = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${this.extensionPath}`,
        `--load-extension=${this.extensionPath}`,
      ],
    });
      browser = browserWithExtensions
    }
    // Set browser dimensions
    const page = await browser.newPage();
    await page.setViewport({
      width: 1098,
      height: 1000,
      deviceScaleFactor: 1,
    });

    // Go to webpage
    await page.goto(this.url);

    // Find user/pass field, fill it, & log in
    await page.type(".usertext", this.username, { delay: 100 });
    await page.type(".passtext", this.password, { delay: 100 });
    await page.locator(".btncancels").click();

    // Game loop
    while (true) {
      try {
        // Find and click quickplay button
        const quickPlayButton = await page.$(
          '::-p-xpath(//*[@id="root"]/div[1]/div[1]/ul/li[3])'
        );
        if (quickPlayButton) {
          await quickPlayButton.click();
        }

        // Get opposingPlayerUsername
        const opposingPlayerUsername = await page.$("div.mc_username2");
        if (opposingPlayerUsername) {
          const usernameText = await page.evaluate(
            (el) => el.textContent.trim(),
            opposingPlayerUsername
          );
          // If this is one of our bots, then wait!!!!
          if(this.bots.some((bot) => bot.username.toUpperCase() === usernameText)){
            console.log("FOUND A BOT")
        await new Promise(resolve => setTimeout(resolve, 750));
          } 
          // If its not a bot, then we've lost anyway. So just continue chain to surrender
          else {
            console.log("NOT A BOT")
          }
        }

        // If we ever see the error 'battle canceled', click the cancel button.
        const battleCancelledButton = await page.$('div ::-p-text(BATTLE CANCELLED)');
        if(battleCancelledButton){
          await battleCancelledButton.click()
        }

        // Find and click surrender button
        const surrenderButton = await page.$(
          "div.mc_surrender::-p-text(SURRENDER)",
          { timeout: 1500 }
        );
        // This finds the center of the surrender button, as the UI is a bit clunky so we had to make this work.
        if (surrenderButton) {
          const box = await surrenderButton.boundingBox();
          const middleX = box.x + box.width / 2;
          const middleY = box.y + box.height / 2;

          const targetX = (box.x + middleX) / 2;
          const targetY = (box.y + middleY) / 2;
          await page.mouse.click(targetX, targetY);
        }

        // Click okbutton after surrender
        const okButton = await page.$("span ::-p-text(OK)");
        if (okButton) {
          await okButton.click();
        }

        // Click continue button
        const continueButton = await page.$("div ::-p-text(CONTINUE)");
        if (continueButton) {
          await continueButton.click();
        }
      } catch (error) {}

      // Wait a short time before the next iteration
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

module.exports = ClientBot;
