// Title picker positions use pixelText's font, padding, scale and gap.
export async function clickPicker(page, id) {
  const x = await page.evaluate((id) => {
    const launcher = window.__engine.launcher;
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = 'bold 8px monospace';
    const entries = launcher.games.map((game) => ({
      id: game.id,
      width: (Math.ceil(ctx.measureText(game.id === launcher.current ? `[${game.label}]` : game.label).width) + 2) * 3,
    }));
    let left = 480 - (entries.reduce((sum, entry) => sum + entry.width, 0) + 48 * (entries.length - 1)) / 2;
    for (const entry of entries) {
      if (entry.id === id) return left + entry.width / 2;
      left += entry.width + 48;
    }
    throw new Error(`Unknown game: ${id}`);
  }, id);
  const box = await page.locator('canvas').boundingBox();
  await page.mouse.click(box.x + x / 960 * box.width, box.y + 62 / 600 * box.height);
}
