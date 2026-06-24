import type { B50Tier, ElectionTier, StatDeltas } from '../types/game';

export const ELECTION_TIER_LABELS: Record<ElectionTier, string> = {
  outside: '圈外',
  ranked: '入围',
  top48: 'Top48',
  top32: 'Top32',
  top16: 'Top16',
  kami7: '神七',
  top3: 'Top3',
  center: '第1',
};

export const B50_TIER_LABELS: Record<B50Tier, string> = {
  notRanked: '未入围',
  ranked: '入围',
  middle: '入围',
  high: 'Top16',
  highlight: 'Top3',
  legend: '年度高光',
};

export const ELECTION_TIER_NARRATIVES: Record<ElectionTier, string> = {
  outside: '这一年的支持还没有汇聚成足够大的声量。小獭仍在积累自己的基本盘，也在等待下一次被更多人看见的机会。',
  ranked: '这一年，更多人开始记住她的名字。虽然还不是最耀眼的位置，但每一份支持都在慢慢把她往前推。',
  top48: '她第一次站进了更大的名单里。粉丝的声音被听见了，而她也开始意识到，自己正在被更多人认真期待。',
  top32: '这一年的努力有了更稳定的回应。粉丝盘开始成形，她不再只是被偶然看见，而是被持续记住。',
  top16: '她走进了更核心的位置。灯光更亮，压力也更近，但属于她的名字已经开始有了重量。',
  kami7: '她站到了真正的高位。欢呼声变得更近，期待也变得更重，这一年会成为粉丝和她都记得的节点。',
  top3: '离最高处只差一步。她已经证明自己能站在风暴中心，接下来要面对的，是更强的期待和更真实的压力。',
  center: '这一刻，所有长期的陪伴、应援和等待终于汇成了名字前的第一位。她站上了最高处，也接住了属于自己的光。',
};

export const B50_TIER_NARRATIVES: Record<B50Tier, string> = {
  notRanked: '这一年的舞台记忆还没有抵达足够多人心里。她仍在积累经验，也在等待下一次真正被舞台记住的机会。',
  ranked: '今年的舞台留下了一点回声。也许还不够响亮，但已经有人愿意为这一刻投下记忆。',
  middle: '今年的舞台留下了一点回声。也许还不够响亮，但已经有人愿意为这一刻投下记忆。',
  high: '她的舞台开始被更多人反复提起。那些训练、走位和眼神，终于在某一首歌里留下了痕迹。',
  highlight: '这一年的舞台成为了重要记忆。粉丝记住的不只是名次，还有她在灯光下真正撑住的一瞬间。',
  legend: '这一场舞台成为了年度记忆点。不是短暂的热闹，而是会被反复想起、反复提到的高光时刻。',
};

export const ELECTION_TIER_REWARDS: Record<ElectionTier, StatDeltas> = {
  outside: { fanCount: 10, pressure: 3, fanFatigue: 1 },
  ranked: { fanCount: 35, supportPower: 1, pressure: 1, fanFatigue: 2 },
  top48: { fanCount: 70, supportPower: 2, influence: 1, pressure: 2, fanFatigue: 4 },
  top32: { fanCount: 110, supportPower: 3, influence: 3, resource: 1, pressure: 4, fanFatigue: 6 },
  top16: { fanCount: 150, supportPower: 4, influence: 5, resource: 3, pressure: 6, fanFatigue: 8 },
  kami7: { fanCount: 210, supportPower: 6, influence: 8, resource: 6, pressure: 9, fanFatigue: 11 },
  top3: { fanCount: 280, supportPower: 8, influence: 11, resource: 9, pressure: 12, fanFatigue: 14 },
  center: { fanCount: 360, supportPower: 10, influence: 14, resource: 12, pressure: 15, fanFatigue: 16 },
};

export const B50_TIER_REWARDS: Record<B50Tier, StatDeltas> = {
  notRanked: { pressure: 2 },
  ranked: { stagePower: 1, fanCount: 25, supportPower: 1 },
  middle: { stagePower: 2, fanCount: 45, supportPower: 1, influence: 1 },
  high: { stagePower: 4, supportPower: 2, influence: 2 },
  highlight: { stagePower: 6, influence: 4, resource: 2, supportPower: 3 },
  legend: { stagePower: 8, influence: 6, resource: 4, supportPower: 4 },
};
