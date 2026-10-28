// Rebuild with fly-ppt/scripts/build.cjs. All image assets are local.
const path = require('node:path');

module.exports = ({draw: d, sceneDir}) => {
  const width = 1680, height = 640;
  const muted = '#6E7065';
  const sans = 'Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif';
  const hand = 'Comic Sans MS, Segoe Print';
  const nodes = [
    {name:'Claude Code', file:'claudecode-color.svg', cx:660, cy:140, fill:'#F6DFD2', rotate:-4},
    {name:'Codex', file:'codex.svg', cx:835, cy:140, fill:'#DDE8DE', rotate:3},
    {name:'Kimi', file:'kimi-color.svg', cx:660, cy:315, fill:'#DFEAFA', rotate:-3},
    {name:'WorkBuddy', file:'workbuddy-color.svg', cx:835, cy:315, fill:'#DDEDE2', rotate:3},
    {name:'Cursor', file:'cursor.svg', cx:660, cy:490, fill:'#E8E2EF', rotate:-4},
    {name:'Gemini CLI', file:'gemini-color.svg', cx:835, cy:490, fill:'#DFEAFA', rotate:3},
  ];

  // A light brace groups the six hosts into one shared input.
  // One arrow keeps the skill's left edge clear at README scale.
  const inputs = d.path('M917 91 Q944 89 943 116 L941 282 Q941 307 955 322 Q941 337 941 362 L944 536 Q945 560 919 560',
      {color:'#777B6E',width:2.7})
    + d.path('M921 96 Q938 95 938 117 L937 280 M938 363 L940 534 Q940 554 920 555',
      {color:'#777B6E',width:1,opacity:.3})
    + d.arrow({from:[968,322],to:[1016,322],bend:-1,width:3.1,head:15});
  const hub = d.box({x:1040,y:239,w:185,h:168,fill:'#F4D786',rotate:-2,seed:11})
    + d.image({file:path.join(sceneDir,'..','favicon.svg'),x:1078,y:249,w:110,h:110,alt:'fly-brief'})
    + d.path('M1194 218 l8 -13 M1217 228 l16 -4 M1174 210 l-1 -15', {color:'#BD9744',width:2.7});

  const report = d.box({x:1338,y:188,w:254,h:284,fill:'#E7ECDD',rotate:4,seed:3})
    + d.box({x:1327,y:177,w:254,h:284,fill:'#FFFDF7',rotate:1,seed:4})
    + d.path('M1329 223 Q1450 225 1578 224',{color:'#9C9C8D',width:1.8})
    + '<circle cx="1346" cy="200" r="4" fill="#D89A83"/><circle cx="1360" cy="200" r="4" fill="#E4C469"/><circle cx="1374" cy="200" r="4" fill="#9EB59C"/>'
    + ['#F4D786','#C9DFC9','#DDCFE8','#CDDDF1'].map((color,i) => {
      const y = 250+i*47;
      return `<rect x="1349" y="${y}" width="25" height="25" rx="7" fill="${color}"/>`
        + d.path(`M1541 ${y+12} h12 M1547 ${y+6} v12`,{color:muted,width:1.7})
        + (i<3 ? d.path(`M1349 ${y+36} Q1450 ${y+37} 1558 ${y+36}`,{color:'#E6E4D9',width:1.1}) : '');
    }).join('');

  // Scale the diagram about its right edge and vertical midpoint.
  // Its labels use the same transform so SVG text stays native.
  const scale = .93, offsetX = 112.7, offsetY = 22.4;
  const diagramLabel = t => ({...t,x:t.x*scale+offsetX,y:t.y*scale+offsetY,
    w:t.w*scale,h:t.h*scale,size:t.size*scale});
  const diagram = inputs
    + nodes.map((n,i) => d.sticker({...n,file:path.join(sceneDir,'icons',n.file),size:84,seed:i+1})).join('')
    + hub
    + d.arrow({from:[1250,322],to:[1298,322],bend:-2,width:3.7,head:16})
    + report;
  const art = d.path('M65 301 Q248 312 505 298',{color:'#F4D786',width:17,opacity:.7})
    + d.path('M587 146 Q583 309 588 484',{color:'#C9C5B6',width:1.4,opacity:.65})
    + `<g transform="translate(${offsetX} ${offsetY}) scale(${scale})">${diagram}</g>`;

  const brandLabels = [
    {text:'Agent Skill',x:66,y:171,w:440,h:36,size:23,font:hand,color:muted,align:'left'},
    {text:'fly-brief',x:60,y:192,w:505,h:148,size:100,font:hand,bold:true,align:'left',letterSpacing:-3},
  ];
  const diagramLabels = [
    ...nodes.map(n => ({text:n.name,x:n.cx-102,y:n.cy+52,w:204,h:37,size:25,font:hand,align:'center',rotate:n.rotate/2})),
    {text:'fly-brief',x:1045,y:360,w:171,h:41,size:30,font:hand,bold:true,rotate:-2},
    {text:'report.html',x:1395,y:185,w:165,h:31,size:21,font:hand,align:'left',color:muted,rotate:1},
  ];
  const copy = {
    zh: {
      id:'hero-zh-cn',title:'fly-brief：Agent 读取合作 brief，生成本地 HTML 报告',
      intro:'把合作 brief，读明白。',detail:'四个清楚答案，一份本地 HTML 报告。',
      rows:['产品用途','本次主推','要求限制','视频方向'],output:'本地 HTML 报告',
    },
    en: {
      id:'hero',title:'fly-brief: Agents turn brand briefs into a local HTML report',
      intro:'A brand brief, made clear.',detail:'Four clear answers. One local HTML report.',
      rows:['Product','Promotion','Requirements','Video ideas'],output:'Local HTML report',
    },
  };
  return {
    title:'fly-brief · README',
    slides:Object.entries(copy).map(([lang,c]) => ({
      id:c.id,title:c.title,width,height,
      background:d.paper({width,height}),art,
      labels:[...brandLabels,...diagramLabels.map(diagramLabel),
        {text:c.intro,x:66,y:335,w:475,h:57,size:lang==='zh'?34:32,font:lang==='zh'?sans:hand,align:'left'},
        {text:c.detail,x:68,y:408,w:480,h:40,size:lang==='zh'?23:21,font:lang==='zh'?sans:hand,align:'left',color:muted},
        ...c.rows.map((text,i)=>diagramLabel({text,x:1388,y:246+i*47,w:151,h:36,size:lang==='zh'?24:20,font:lang==='zh'?sans:hand,align:'left',rotate:1})),
        diagramLabel({text:c.output,x:1302,y:495,w:305,h:43,size:28,font:lang==='zh'?sans:hand}),
      ],
      notes:'README banner. Agent logos identify example skill-capable hosts; this is a workflow illustration, not a statement of product-by-product fly-brief testing. Sources and regeneration instructions: assets/readme/SOURCES.md.',
    })),
    sources:[
      'Agent logos: LobeHub Icons, MIT. Unmodified SVGs copied from the user-selected fly-ppt skill. See assets/readme/icons/LICENSE.txt and assets/readme/SOURCES.md.',
      'fly-brief icon: existing assets/favicon.svg. Report outline, paper, stickers and arrows: original SVG scene built with fly-ppt.',
      'Official skill documentation and rebuilding instructions: assets/readme/SOURCES.md.',
    ],
  };
};
