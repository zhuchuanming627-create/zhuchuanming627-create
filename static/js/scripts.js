'use strict';
const dictionary = {
  zh: {menu:'菜单',navAbout:'关于我',navResearch:'研究方向',navWork:'学术工作',navExperience:'个人经历',navContact:'联系我',heroCaption:'探索智能体记忆，让经验连接未来。',explore:'探索我的研究方向',researchTitle:'研究方向',researchSubtitle:'围绕记忆，理解持续交互中的智能。',researchDescription:'智能体记忆关注如何保存、组织与使用历史信息，让智能体能够在持续交互中连接过去的经验与当前的任务。',workTitle:'学术工作',publications:'论文',projects:'项目',emptyPublications:'论文整理中',emptyPublicationsNote:'相关研究成果将在这里更新。',emptyProjects:'项目整理中',emptyProjectsNote:'相关项目与代码将在这里更新。',experienceTitle:'个人经历',experienceNote:'学习、思考与探索的足迹。',awardsTitle:'荣誉奖励',contactTitle:'让想法，从一次交流开始。',contactDescription:'欢迎就 Agent Memory 相关话题与我联系。',sendEmail:'发送邮件',copyEmail:'复制邮箱',copied:'邮箱已复制',copyFallback:'请复制邮箱：',footer:'保持好奇，持续探索。',loadError:'部分内容暂时无法加载，请刷新页面重试。'},
  en: {menu:'Menu',navAbout:'About',navResearch:'Research',navWork:'Work',navExperience:'Background',navContact:'Contact',heroCaption:'Exploring memory for agents. Connecting experience to what comes next.',explore:'Explore my research',researchTitle:'Research interests',researchSubtitle:'Understanding intelligence through memory.',researchDescription:'Agent Memory studies how agents store, organize and use historical information to connect past experience with current tasks across continuing interactions.',workTitle:'Selected work',publications:'Publications',projects:'Projects',emptyPublications:'Publications coming soon',emptyPublicationsNote:'Research publications will be shared here.',emptyProjects:'Projects coming soon',emptyProjectsNote:'Projects and source code will be shared here.',experienceTitle:'Background',experienceNote:'A path of learning and exploration.',awardsTitle:'Honors & awards',contactTitle:'Every idea starts with a conversation.',contactDescription:'Feel free to reach out about Agent Memory.',sendEmail:'Get in touch',copyEmail:'Copy email',copied:'Email copied',copyFallback:'Copy this email: ',footer:'Stay curious. Keep exploring.',loadError:'Some content could not be loaded. Please refresh and try again.'}
};
let language = 'zh';
try { if (localStorage.getItem('homepage-language') === 'en') language = 'en'; } catch { /* Storage is optional. */ }
let profile = null;
let toastTimer;
const localize = (item, key) => language === 'en' ? (item[key + 'En'] || item[key] || '') : (item[key] || '');
function make(tag, className, text) { const element = document.createElement(tag); if (className) element.className = className; if (text != null) element.textContent = text; return element; }
function safeUrl(value) { try { const url = new URL(value, document.baseURI); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; } }
function renderWork(type) {
  const panel = document.getElementById('panel-' + type); panel.replaceChildren();
  const items = profile?.[type] || [];
  if (!items.length) {
    const state = make('div', 'empty-state');
    const number = make('span', 'empty-number', type === 'publications' ? '01' : '02'); number.setAttribute('aria-hidden','true');
    const copy = make('div'); copy.append(make('h3', '', dictionary[language][type === 'publications' ? 'emptyPublications' : 'emptyProjects']), make('p', '', dictionary[language][type === 'publications' ? 'emptyPublicationsNote' : 'emptyProjectsNote']));
    state.append(number, copy); panel.append(state); return;
  }
  items.forEach(item => {
    const article = make('article', 'work-item'); article.append(make('div', 'work-year', item.year || ''));
    const content = make('div'); content.append(make('h3', '', localize(item,'title')));
    if (item.authors || item.venue) content.append(make('p','work-meta',[item.authors, item.venue].filter(Boolean).join(' · ')));
    if (localize(item,'description')) content.append(make('p','work-description',localize(item,'description')));
    const links = make('div', 'work-item-links');
    (item.links || []).forEach(link => { const href = safeUrl(link.url); if (!href) return; const a = make('a','',localize(link,'label') + ' ↗'); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; links.append(a); });
    if (links.childElementCount) content.append(links); article.append(content); panel.append(article);
  });
}
function renderProfile() {
  if (!profile) return;
  document.querySelectorAll('[data-person]').forEach(element => {
    const key = element.dataset.person;
    element.textContent = key === 'name' && language === 'en' ? profile.englishName : key === 'affiliation' ? (language === 'en' ? profile.affiliationEn : profile.affiliation + ' · ' + profile.affiliationEn) : profile[key];
  });
  document.getElementById('intro').textContent = localize(profile,'intro');
  document.querySelectorAll('.email-link').forEach(a => a.href = 'mailto:' + profile.email);
  document.title = language === 'zh' ? profile.name + ' | ' + profile.englishName : profile.englishName + ' | ' + profile.research;
  document.querySelector('meta[name=description]').content = localize(profile,'intro');
  const timeline = document.getElementById('experience-list'); timeline.replaceChildren();
  (profile.experience || []).forEach(item => {
    const entry = make('article','timeline-item'); entry.append(make('span','timeline-type',localize(item,'type')),make('h3','',localize(item,'title')));
    if (localize(item,'date')) entry.append(make('span','timeline-date',localize(item,'date')));
    if (localize(item,'description')) entry.append(make('p','',localize(item,'description')));
    timeline.append(entry);
  });
  const awards = profile.awards || []; document.getElementById('awards-section').hidden = !awards.length;
  const awardList = document.getElementById('awards-list'); awardList.replaceChildren();
  awards.forEach(item => awardList.append(make('p','',localize(item,'title') + (item.year ? ' · ' + item.year : ''))));
  renderWork('publications'); renderWork('projects');
}
function setLanguage(next) {
  language = next;
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'; document.body.dataset.language = language;
  document.querySelectorAll('[data-i18n]').forEach(element => element.textContent = dictionary[language][element.dataset.i18n]);
  const toggle = document.getElementById('language-toggle'); toggle.textContent = language === 'zh' ? 'EN ↗' : '中文 ↗'; toggle.setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '切换到中文');
  document.querySelector('.profile-mark').setAttribute('aria-label',language === 'zh' ? '朱传明的姓名头像' : 'Chuanming Zhu monogram');
  document.querySelector('.back-top').setAttribute('aria-label',language === 'zh' ? '回到顶部' : 'Back to top');
  document.querySelector('.nav').setAttribute('aria-label',language === 'zh' ? '主导航' : 'Main navigation');
  document.querySelector('.work-tabs').setAttribute('aria-label',language === 'zh' ? '学术工作分类' : 'Work categories');
  document.querySelector('.skip-link').textContent = language === 'zh' ? '跳转到正文' : 'Skip to content';
  try { localStorage.setItem('homepage-language',language); } catch { /* No persistence required. */ }
  renderProfile();
}
function setTab(type, focus = false) {
  document.querySelectorAll('[data-tab]').forEach(tab => {
    const selected = tab.dataset.tab === type; tab.setAttribute('aria-selected',String(selected)); tab.tabIndex = selected ? 0 : -1;
    document.getElementById('panel-' + tab.dataset.tab).hidden = !selected;
    if (selected && focus) tab.focus();
  });
}
document.getElementById('language-toggle').addEventListener('click',() => setLanguage(language === 'zh' ? 'en' : 'zh'));
const menu = document.getElementById('menu-toggle'); const navLinks = document.getElementById('nav-links');
function closeMenu() { menu.setAttribute('aria-expanded','false'); navLinks.classList.remove('open'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded',String(open)); navLinks.classList.toggle('open',open); });
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
document.addEventListener('click',event => { if (!event.target.closest('.site-header')) closeMenu(); });
document.querySelectorAll('[data-tab]').forEach(tab => {
  tab.addEventListener('click',() => setTab(tab.dataset.tab));
  tab.addEventListener('keydown', event => { if (['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) { event.preventDefault(); const type = event.key === 'Home' ? 'publications' : event.key === 'End' ? 'projects' : tab.dataset.tab === 'publications' ? 'projects' : 'publications'; setTab(type,true); } });
});
document.getElementById('copy-email').addEventListener('click', async () => {
  const email = profile?.email || '2971588323@qq.com'; let copied = false;
  try { await navigator.clipboard.writeText(email); copied = true; } catch {
    const input = make('textarea'); input.value = email; input.style.position='fixed'; input.style.opacity='0'; input.setAttribute('readonly',''); document.body.append(input); input.select();
    try { copied = document.execCommand('copy'); } catch { /* Show the address below. */ } input.remove(); document.getElementById('copy-email').focus();
  }
  const toast = document.getElementById('toast'); toast.textContent = copied ? dictionary[language].copied : dictionary[language].copyFallback + email; toast.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'),4000);
});
const sections = [...document.querySelectorAll('main > section[id]')];
const updateActiveNav = () => { let current = sections[0].id; for (const section of sections) { if (section.getBoundingClientRect().top <= 170) current = section.id; } if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = 'contact'; navLinks.querySelectorAll('a').forEach(a => { const active = a.hash === '#' + current; a.classList.toggle('active',active); if (active) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); }); };
let scheduled = false; window.addEventListener('scroll',() => { if (!scheduled) { scheduled=true; requestAnimationFrame(() => { updateActiveNav(); scheduled=false; }); } }, {passive:true});
window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); updateActiveNav(); });
document.getElementById('year').textContent = new Date().getFullYear();
setLanguage(language);
fetch('contents/site.json').then(response => { if (!response.ok) throw new Error('Profile request failed'); return response.json(); }).then(data => { profile = data; renderProfile(); updateActiveNav(); }).catch(() => { document.querySelector('.about-body').append(make('p','load-error',dictionary[language].loadError)); renderWork('publications'); renderWork('projects'); });
