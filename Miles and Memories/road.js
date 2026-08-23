const ROAD_ITEMS = [{"file":"road_01.jpg","sprite":"road_sprite_01.webp","row":0,"category":"高原山口","title":"风的垭口 — No. 01","description":"翻过垭口的时候风很大，经幡被吹得猎猎作响。远处的雪山顶着清晨第一束光，公路像一条细线缠在山腰上。在这里停车不需要理由，海拔本身就是理由。"},{"file":"road_02.jpg","sprite":"road_sprite_01.webp","row":1,"category":"沙漠公路","title":"直线尽头 — No. 02","description":"沙漠里的公路直得近乎固执，黄昏把一切都染成橙色。热浪在路面上晃动，路牌孤独地站着。开这样的路，人会不自觉地想很远的事。"},{"file":"road_03.jpg","sprite":"road_sprite_01.webp","row":2,"category":"海岸小镇","title":"彩色山坡 — No. 03","description":"房子顺着山坡一路堆到海边，粉蓝、鹅黄、奶白，像打翻的颜料。正午的港湾里渔船轻轻晃，海水绿得不真实。这样的小镇适合什么都不做，只等一顿海鲜饭。"},{"file":"road_04.jpg","sprite":"road_sprite_02.webp","row":0,"category":"夜市","title":"蒸汽与霓虹 — No. 04","description":"夜市的巷子窄到两个人要侧身，霓虹和灯笼把空气照得发红。食物的蒸汽一阵一阵升起来，地面的积水里全是倒影。饿着肚子来，是对这里最基本的尊重。"},{"file":"road_05.jpg","sprite":"road_sprite_02.webp","row":1,"category":"铁道沿线","title":"车窗取景器 — No. 05","description":"长途火车上最好的娱乐就是看窗外。田野一块一块退向后方，山影在天边慢慢移动。车窗是最诚实的取景器，它不构图，只路过。"},{"file":"road_06.jpg","sprite":"road_sprite_02.webp","row":2,"category":"高山湖泊","title":"镜面清晨 — No. 06","description":"无风的清晨，湖面完整得把山峰复制了一份。松树林立在岸边，空气冷得发亮。日照金山的那几分钟里，没有人说话。"},{"file":"road_07.jpg","sprite":"road_sprite_03.webp","row":0,"category":"古镇街巷","title":"巷深不知处 — No. 07","description":"石板路被磨得发亮，红灯笼在木屋之间轻轻晃。阴天的小巷没有游客，一只猫坐在台阶上，像这里的原住民。古镇最好的时刻，是它忘记自己是景点的时候。"},{"file":"road_08.jpg","sprite":"road_sprite_03.webp","row":1,"category":"草原","title":"天空的占比 — No. 08","description":"草原上天空占了画面的四分之三，云大得有具体的形状。一顶白帐篷，几匹吃草的马，风把草压出波浪。在这里，'辽阔'不是一个形容词，是一种体感。"},{"file":"road_09.jpg","sprite":"road_sprite_03.webp","row":2,"category":"城市雨夜","title":"蓝调时刻 — No. 09","description":"雨刚停，街灯和招牌全都在湿漉漉的柏油路上复制了一遍。撑伞的人走成剪影，蓝调时刻只有二十分钟。城市最温柔的一面，只在雨天营业。"},{"file":"road_10.jpg","sprite":"road_sprite_04.webp","row":0,"category":"林海雪原","title":"新雪车辙 — No. 10","description":"一夜大雪之后，林场公路上的第一道车辙是我们的。云杉被雪压弯了枝头，世界安静得能听见雪落下的声音。冬天把森林调成静音。"},{"file":"road_11.jpg","sprite":"road_sprite_04.webp","row":1,"category":"渔港","title":"粉色的黎明 — No. 11","description":"渔船在粉色的晨光里排队出海，渔网堆在码头上像一座座小山。海鸥比人醒得早，海面上的雾还没散。渔港的一天，从凌晨四点就开始了。"},{"file":"road_12.jpg","sprite":"road_sprite_04.webp","row":2,"category":"大漠","title":"沙丘之脊 — No. 12","description":"驼队沿着沙丘的脊线走成一串剪影，夕阳把影子拉得很长。沙的纹路像凝固的海浪。大漠的宏大在于，它让所有的队伍都显得很小。"},{"file":"road_13.jpg","sprite":"road_sprite_05.webp","row":0,"category":"云雾山村","title":"雾中梯田 — No. 13","description":"晨雾漫过梯田，瓦屋顶从雾里一座一座浮出来，背后的山脊层层叠叠淡成蓝色。村子醒得很慢。有些地方的时间，确实走得比别处慢。"},{"file":"road_14.jpg","sprite":"road_sprite_05.webp","row":1,"category":"海角公路","title":"悬崖之上 — No. 14","description":"公路贴着悬崖走，黑色的礁石下面浪一阵一阵地撞。崖边的草被风吹得全部倒向海面。这样的路，开慢点不是技术问题，是本能。"},{"file":"road_15.jpg","sprite":"road_sprite_05.webp","row":2,"category":"机场黄昏","title":"出发层 — No. 15","description":"落地窗外，飞机停在被晚霞烧红的天色里。拖着行李的人站着看了很久。机场是旅行的序言，所有的故事都从'出发层'三个字开始。"},{"file":"road_16.jpg","sprite":"road_sprite_06.webp","row":0,"category":"河谷铁桥","title":"过河 — No. 16","description":"老铁桥横跨河谷，火车从桥上过去的时候带着轻微的晃动。金色的光铺在两岸的山上。铁路的意义不只是抵达，还有途中这条被认真跨过的河。"},{"file":"road_17.jpg","sprite":"road_sprite_06.webp","row":1,"category":"山间寺庙","title":"金顶之上 — No. 17","description":"寺庙依山而建，金顶在稀薄的阳光下亮得晃眼，白墙干净得像刚刷过。经幡迎着山口的风。高原的信仰，长得就像高原本身。"},{"file":"road_18.jpg","sprite":"road_sprite_06.webp","row":2,"category":"竹林","title":"光的缝隙 — No. 18","description":"竹子高到看不见梢，阳光只能一缕一缕地漏下来。石灯笼守在小径旁边，青苔爬了半身。竹林里走路会不自觉放轻脚步，怕惊动了什么。"},{"file":"road_19.jpg","sprite":"road_sprite_07.webp","row":0,"category":"海岛","title":"长尾船 — No. 19","description":"长尾船泊在透亮的浅滩上，海水从白色渐变到绿松石色。一棵椰子树斜斜地探向海面。海岛的午后没有日程表，只有潮汐表。"},{"file":"road_20.jpg","sprite":"road_sprite_07.webp","row":1,"category":"红岩峡谷","title":"峡谷步行 — No. 20","description":"红岩壁在正午投下刀切一样的影子，公路在峡谷底弯来绕去。一个步行者小得几乎看不见。峡谷的尺度提醒人：路是山借给你的。"},{"file":"road_21.jpg","sprite":"road_sprite_07.webp","row":2,"category":"雪山星夜","title":"银河营地 — No. 21","description":"帐篷的灯是雪原上唯一的人间烟火，银河从山脊后面拱起来。长曝光里星星密得不像话。在城市里，我们早就忘记了头顶原来这么热闹。"},{"file":"road_22.jpg","sprite":"road_sprite_08.webp","row":0,"category":"异乡街角","title":"咖啡馆的早晨 — No. 22","description":"老城街角的咖啡馆刚开门，自行车倚在墙上，晨光把影子拉过整条石板街。旅行中的咖啡馆不是歇脚处，是观察一座城市的固定机位。"},{"file":"road_23.jpg","sprite":"road_sprite_08.webp","row":1,"category":"日出梯田","title":"水的镜子 — No. 23","description":"灌水的梯田把粉金色的日出装进了每一块田，一个农人正沿着田埂走过去。曲线一层一层荡开。人类的耕作，有时候比风景更像风景。"},{"file":"road_24.jpg","sprite":"road_sprite_08.webp","row":2,"category":"长城","title":"山脊的线条 — No. 24","description":"城墙沿着山脊起伏，敌楼一座一座淡进金色的暮霭里。夕阳下，所有的山都分出层次。走了很远的路才明白，长城其实是山脊画的一条线。"}];

const gallery = document.querySelector('#road-gallery');
const dialog = document.querySelector('#road-dialog');
const dialogImg = document.querySelector('#dialog-image');
const dialogCategory = document.querySelector('#dialog-category');
const dialogTitle = document.querySelector('#dialog-title');
const dialogText = document.querySelector('#dialog-text');
const dialogIndex = document.querySelector('#dialog-index');
const dialogFile = document.querySelector('#dialog-file');
const closeButton = document.querySelector('#dialog-close');
const prevButton = document.querySelector('#dialog-prev');
const nextButton = document.querySelector('#dialog-next');
let activeIndex = 0;
let lastTrigger = null;
function pad(n){ return String(n).padStart(2, '0'); }
function shortTitle(title){ return title.replace(/ — No\. \d+/, ''); }
function applySprite(img, item){
  img.src = `./images/${item.sprite}`;
  img.style.width = '100%';
  img.style.height = '300%';
  img.style.maxWidth = 'none';
  img.style.objectFit = 'fill';
  img.style.transform = `translateY(${-item.row * (100 / 3)}%)`;
}
function cardTemplate(item, index){
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'road-card';
  button.setAttribute('aria-label', `打开 ${item.title}`);
  const imageWrap = document.createElement('span');
  imageWrap.className = 'road-card-image';
  const img = document.createElement('img');
  img.alt = `${item.category} · ${shortTitle(item.title)}`;
  img.loading = 'lazy';
  img.decoding = 'async';
  applySprite(img, item);
  imageWrap.appendChild(img);
  const copy = document.createElement('span');
  copy.className = 'road-card-copy';
  copy.innerHTML = `<span class="road-card-meta"><b>${item.category}</b><i>${pad(index + 1)}</i></span><strong>${shortTitle(item.title)}</strong>`;
  button.append(imageWrap, copy);
  button.addEventListener('click', () => openDialog(index, button));
  return button;
}
ROAD_ITEMS.forEach((item, index) => gallery.appendChild(cardTemplate(item, index)));
document.querySelector('#frame-count').textContent = pad(ROAD_ITEMS.length);
document.querySelector('#series-count').textContent = pad(new Set(ROAD_ITEMS.map(item => item.category)).size);
dialogImg.parentElement.style.overflow = 'hidden';
function syncDialog(){
  const item = ROAD_ITEMS[activeIndex];
  applySprite(dialogImg, item);
  dialogImg.alt = `${item.category} · ${item.title}`;
  dialogCategory.textContent = `${item.category} — 旅途切片`;
  dialogTitle.textContent = item.title;
  dialogText.textContent = item.description;
  dialogIndex.textContent = `${pad(activeIndex + 1)} / ${pad(ROAD_ITEMS.length)}`;
  dialogFile.textContent = item.file;
}
function openDialog(index, trigger){
  activeIndex = index; lastTrigger = trigger; syncDialog();
  dialog.showModal(); document.body.classList.add('dialog-open'); closeButton.focus();
}
function closeDialog(){ dialog.close(); document.body.classList.remove('dialog-open'); if(lastTrigger) lastTrigger.focus(); }
function step(delta){ activeIndex = (activeIndex + delta + ROAD_ITEMS.length) % ROAD_ITEMS.length; syncDialog(); }
closeButton.addEventListener('click', closeDialog);
prevButton.addEventListener('click', () => step(-1));
nextButton.addEventListener('click', () => step(1));
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
  if(!inside) closeDialog();
});
dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
document.addEventListener('keydown', event => {
  if(!dialog.open) return;
  if(event.key === 'ArrowLeft') step(-1);
  if(event.key === 'ArrowRight') step(1);
});
const themeMeta = document.querySelector('meta[name="theme-color"]');
function updateThemeColor(){
  const dark = document.documentElement.dataset.cmTheme === 'dark' || (!document.documentElement.dataset.cmTheme && matchMedia('(prefers-color-scheme: dark)').matches);
  themeMeta?.setAttribute('content', dark ? '#111210' : '#e9e7df');
}
updateThemeColor();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', updateThemeColor);
