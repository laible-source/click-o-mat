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
  return background.texture.key === 'uni-cafeteria' && image.width === 1152 && image.height === 768 &&
    background.x === 0 && background.y === -95 &&
    background.displayWidth === 960 && background.displayHeight === 640;
}));
check('student starts in the cafeteria', await page.evaluate(() =>
  window.__engine.state.activeChar === 'student' && window.__engine.roomScene.actors.size === 3));
check('two students sit on the outer chairs', await page.evaluate(() => {
  const scene = window.__engine.roomScene;
  const placed = new Map(scene.roomDef.actors.map((actor) => [actor.id, actor]));
  return ['tired-student', 'student-teacher'].every((id) => {
    const actor = scene.actors.get(id);
    const position = placed.get(id);
    return actor && position &&
      Math.abs(actor.x - position.x) < 1 &&
      Math.abs(actor.y - position.y) < 1 &&
      actor.sprite.anims.currentAnim?.key === `${actor.def.textureSet}-sit-side`;
  });
}));
for (const [id, name] of [['tired-student', 'Student'], ['student-teacher', 'Tutorin']]) {
  const point = await page.evaluate((id) => {
    const bounds = window.__engine.roomScene.actors.get(id).sprite.getBounds();
    return { x: bounds.centerX, y: bounds.centerY };
  }, id);
  const box = await page.locator('canvas').boundingBox();
  await page.mouse.move(box.x + point.x / 960 * box.width, box.y + point.y / 600 * box.height);
  await page.waitForFunction((id) => window.__engine.roomScene.hoverHotspot?.id === id, id);
  check(`hovering over ${name} identifies them`, await page.evaluate((name) =>
    window.__engine.roomScene.hoverHotspot.name === name, name));
}
await page.screenshot({ path: `${SHOT}/uni-cafeteria.png` });

for (const [id, facing] of [['tired-student', 'right'], ['student-teacher', 'left']]) {
  const point = await page.evaluate((id) => {
    const bounds = window.__engine.roomScene.actors.get(id).sprite.getBounds();
    return { x: bounds.centerX, y: bounds.centerY };
  }, id);
  await click(point.x, point.y);
  await page.waitForFunction((id) => window.__engine.roomScene.actors.get(id).facing === 'down', id, { timeout: 15000 });
  await page.waitForFunction(() => !window.__engine.busy, null, { timeout: 15000 });
  await click(480, 420);
  await page.waitForFunction(([id, facing]) =>
    window.__engine.roomScene.actors.get(id).facing === facing && !window.__engine.busy,
  [id, facing], { timeout: 15000 });
  check(`${id} faces the table again after the player leaves`, true);
}

await click(540, 410);
await page.waitForFunction(() => {
  const student = window.__engine.roomScene.actors.get('student');
  return Math.abs(student.x - 540) < 3 && Math.abs(student.y - 410) < 3;
}, null, { timeout: 10000 });
check('clicking the floor walks the student right', true);
await click(350, 325);
await page.waitForFunction(() => {
  const student = window.__engine.roomScene.actors.get('student');
  return Math.abs(student.x - 350) < 3 && Math.abs(student.y - 325) < 3;
}, null, { timeout: 10000 });
check('student can walk in another direction', true);

const chairCentre = (id) => page.evaluate((id) => {
  const r = window.__engine.roomScene.roomDef.hotspots.find((h) => h.id === id).rect;
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}, id);
const studentState = () => page.evaluate(() => {
  const s = window.__engine.roomScene.actors.get('student');
  return { seat: window.__engine.state.getFlag('seat'), y: s.y, anim: s.sprite.anims.currentAnim?.key };
});
const chair = await chairCentre('chair1b');
const tableTop = await page.evaluate(() => window.__engine.roomScene.roomDef.hotspots.find((h) => h.id === 'table1').rect.y);
await click(chair.x, chair.y);
await page.waitForFunction(() => window.__engine.state.getFlag('seat') === 'chair1b', null, { timeout: 15000 });
await page.waitForTimeout(300);
let st = await studentState();
check('using a chair sits the student down', st.anim === 'uni-student-sit-side');
check('the student sits on the chair, not on the floor in front of it', st.y < tableTop + 120);
await page.evaluate(() => void window.__engine.makeContext().playerSay('Hallo.'));
await page.waitForTimeout(300);
check('a seated student keeps sitting while talking', (await studentState()).anim === 'uni-student-sittalk-side');
await page.screenshot({ path: `${SHOT}/uni-seated.png` });
await click(480, 420);
await page.waitForFunction(() => {
  const s = window.__engine.roomScene.actors.get('student');
  return !window.__engine.state.getFlag('seat') && Math.abs(s.x - 480) < 3 && Math.abs(s.y - 420) < 3;
}, null, { timeout: 15000 });
check('walking away stands the student up first', true);

await click(290, 200);
await page.waitForFunction(() => window.__engine.state.currentRoom === 'lecturehall' && !!window.__engine.roomScene?.actors.get('student'), null, { timeout: 15000 });
await page.waitForTimeout(1000);
check('the passage next to the vending machines leads to the lecture hall', await page.evaluate(() =>
  window.__engine.roomScene.layerObj('background').texture.key === 'uni-lecture-hall'));
const professor = await page.evaluate(() => {
  const actor = window.__engine.roomScene.actors.get('otto-e');
  if (!actor) return null;
  const bounds = actor.sprite.getBounds();
  return { x: bounds.centerX, y: bounds.centerY };
});
check('Otto E. is in the lecture hall', !!professor);
if (professor) {
  const box = await page.locator('canvas').boundingBox();
  await page.mouse.move(box.x + professor.x / 960 * box.width, box.y + professor.y / 600 * box.height);
  await page.waitForFunction(() => window.__engine.roomScene.hoverHotspot?.id === 'otto-e');
  check('hovering over Otto E. identifies him', true);
  await click(professor.x, professor.y);
  await page.waitForFunction(() => window.__engine.roomScene.actors.get('otto-e').speech?.text.includes('Guten Tag'), null, { timeout: 15000 });
  check('Otto E. greets the player', true);
  await page.waitForFunction(() => !window.__engine.busy, null, { timeout: 15000 });
  await click(700, 430);
  await page.waitForFunction(() => window.__engine.roomScene.actors.get('otto-e').facing === 'down' && !window.__engine.busy, null, { timeout: 15000 });
  check('Otto E. faces forward again when the player leaves', true);
}
await page.screenshot({ path: `${SHOT}/uni-lecture-hall.png` });
await click(605, 40);
await page.waitForFunction(() => window.__engine.state.currentRoom === 'cafeteria', null, { timeout: 15000 });
check('the rear door leads back to the cafeteria', true);
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
