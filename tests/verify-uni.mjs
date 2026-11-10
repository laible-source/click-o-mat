import { chromium } from 'playwright';
import { clickPicker } from './picker.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173/?game=demo';
const SHOT = process.env.SHOT_DIR ?? '.';
const withGame = (id) => {
  const url = new URL(BASE);
  if (id) url.searchParams.set('game', id);
  else url.searchParams.delete('game');
  return url.toString();
};

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const check = (label, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) process.exitCode = 1;
};
const ready = async (id) => {
  await page.waitForFunction((id) => window.__engine?.launcher?.current === id, id);
  await page.waitForTimeout(3000);
};
const click = async (x, y) => {
  const box = await page.locator('canvas').boundingBox();
  await page.mouse.click(box.x + x / 960 * box.width, box.y + y / 600 * box.height);
};

await page.goto(withGame('demo'));
await ready('demo');
check('title offers all three games', await page.evaluate(() =>
  window.__engine.launcher.games.map((game) => game.id).join(',') === 'goa,demo,uni'));
await Promise.all([page.waitForURL(/game=uni/), clickPicker(page, 'uni')]);
await ready('uni');
check('selecting UNI loads its game', await page.evaluate(() =>
  window.__engine.startRoom === 'cafeteria' && window.__engine.playerId === 'student'));
await clickPicker(page, 'uni');
check('selecting the current game keeps the title open', await page.evaluate(() => !window.__engine.roomScene));

await page.goto(withGame(null));
await ready('uni');
check('UNI selection is remembered', await page.evaluate(() => window.__engine.launcher.current === 'uni'));
await click(480, 300);
await page.waitForFunction(() => window.__engine.state.currentRoom === 'cafeteria' && !!window.__engine.roomScene?.actors.get('student'));
await page.waitForTimeout(1000);
check('cafeteria displays the supplied image', await page.evaluate(() => {
  const scene = window.__engine.roomScene;
  const background = scene.layerObj('background');
  const image = scene.textures.get('uni-cafeteria').getSourceImage();
  return background.texture.key === 'uni-cafeteria' && image.width === 640 && image.height === 427 &&
    background.x === 0 && background.y === -95 &&
    background.displayWidth === 960 && background.displayHeight === 640;
}));
check('student starts in the cafeteria', await page.evaluate(() =>
  window.__engine.state.activeChar === 'student' && window.__engine.roomScene.actors.size === 1));
await page.screenshot({ path: `${SHOT}/uni-cafeteria.png` });

await click(720, 390);
await page.waitForFunction(() => {
  const student = window.__engine.roomScene.actors.get('student');
  return Math.abs(student.x - 720) < 3 && Math.abs(student.y - 390) < 3;
}, null, { timeout: 10000 });
check('clicking the floor walks the student right', true);
await click(350, 325);
await page.waitForFunction(() => {
  const student = window.__engine.roomScene.actors.get('student');
  return Math.abs(student.x - 350) < 3 && Math.abs(student.y - 325) < 3;
}, null, { timeout: 10000 });
check('student can walk in another direction', true);
check('UNI saves in its own namespace', await page.evaluate(() =>
  window.__engine.save(0) && !!localStorage.getItem('pnc-save-uni-0') && !localStorage.getItem('pnc-save-0')));

await page.goto(withGame('goa'));
await ready('goa');
check('direct URL selects another game', await page.evaluate(() =>
  window.__engine.launcher.current === 'goa' && !window.__engine.hasSave()));
await page.goto(withGame('uni'));
await ready('uni');
check('direct UNI URL finds the UNI save', await page.evaluate(() => window.__engine.hasSave()));

console.log('ERRORS:', errors.length ? '\n' + errors.slice(0, 8).join('\n') : 'none');
if (errors.length) process.exitCode = 1;
await browser.close();
