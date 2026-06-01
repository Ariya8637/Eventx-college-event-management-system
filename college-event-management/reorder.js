const fs = require('fs');

const path = 'c:\\collegeeventmanagement\\college-event-management\\frontend\\pages\\StudentDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const blocks = {
  HEADER: 'HEADER',
  STATS: 'STATS ROW  (Original)',
  QUICK_ACTIONS: 'Quick Actions + Recent Activity  (Original)',
  FEATURE_1_LIVE: 'FEATURE 1 — LIVE EVENT STATUS BOARD',
  FEATURE_4_FEATURED: 'FEATURE 4 — FEATURED & TRENDING EVENTS',
  FEATURE_2_TEAM: 'FEATURE 2 — TEAM REGISTRATION SPOTLIGHT',
  FEATURE_3_FORUM: 'FEATURE 3 — DISCUSSION FORUM PREVIEW',
  FEATURE_5_PAYMENT: 'FEATURE 5 — PAYMENT & INVOICE'
};

function getBlockStart(blockName) {
    const idx = content.indexOf('                ' + blockName);
    if (idx === -1) return -1;
    return content.lastIndexOf('{/* ════', idx);
}

const pos = {};
for (const [key, val] of Object.entries(blocks)) {
    pos[key] = getBlockStart(val);
}

// Get the text associated with each block
const extract = (startPos, nextPos) => content.slice(startPos, nextPos);

const headerEnd = pos.STATS;
const statsEnd = pos.QUICK_ACTIONS;
const quickActionsEnd = pos.FEATURE_1_LIVE;
const liveEnd = pos.FEATURE_4_FEATURED;
const featuredEnd = pos.FEATURE_2_TEAM;
const teamEnd = pos.FEATURE_3_FORUM;
const forumEnd = pos.FEATURE_5_PAYMENT;
const paymentEnd = content.indexOf('        </div>\n    );\n}');

const headerStr = extract(pos.HEADER, headerEnd);
const statsStr = extract(pos.STATS, statsEnd);
const quickActionsStr = extract(pos.QUICK_ACTIONS, quickActionsEnd);
const liveStr = extract(pos.FEATURE_1_LIVE, liveEnd);
const featuredStr = extract(pos.FEATURE_4_FEATURED, featuredEnd);
const teamStr = extract(pos.FEATURE_2_TEAM, teamEnd);
const forumStr = extract(pos.FEATURE_3_FORUM, forumEnd);

// Restructure
/* 
1. Header
2. Featured
3. Live
4. Stats
5. Quick Actions
6. Team
7. Forum
(Payment is removed)
*/

const prefix = content.slice(0, pos.HEADER);
const suffix = content.slice(paymentEnd); // Everything after the end of payment block

const newContent = prefix + 
                   headerStr + 
                   featuredStr + 
                   liveStr + 
                   statsStr + 
                   quickActionsStr + 
                   teamStr + 
                   forumStr + 
                   suffix;

fs.writeFileSync(path, newContent);
console.log('Successfully reordered StudentDashboard.jsx');
