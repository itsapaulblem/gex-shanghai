import crypto from 'node:crypto';
import { hashPassword, loadState, withState } from './store.js';

const DEMO_PREFIX = 'demo_';
const DEFAULT_COUNTS = Object.freeze({ profiles: 300, connections: 650, messages: 3600 });

const surnames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
const givenNames = ['子涵', '雨桐', '浩然', '思远', '欣怡', '嘉豪', '若曦', '宇轩', '静雯', '俊杰', '梦瑶', '明哲', '佳宁', '天佑', '可心', '博文', '诗涵', '承宇', '婉清', '泽楷', '依琳', '睿阳', '雅琪', '景行', '舒婷', '亦辰', '芷晴', '致远', '嘉怡', '文昊'];
const cities = [
  ['上海', '上海', '上海'], ['上海', '上海', '江苏苏州'], ['上海', '上海', '浙江杭州'],
  ['杭州', '浙江杭州', '浙江宁波'], ['苏州', '江苏苏州', '江苏无锡'], ['南京', '江苏南京', '江苏扬州'],
  ['北京', '北京', '北京'], ['深圳', '广东深圳', '广东广州'], ['广州', '广东广州', '广东佛山'],
  ['成都', '四川成都', '四川绵阳'], ['武汉', '湖北武汉', '湖北宜昌'], ['宁波', '浙江宁波', '浙江绍兴'],
];
const educationOptions = ['本科', '本科', '硕士', '硕士', '博士'];
const schools = ['复旦大学', '上海交通大学', '同济大学', '华东师范大学', '浙江大学', '南京大学', '武汉大学', '中山大学', '四川大学', '上海财经大学', '华东理工大学', '东华大学'];
const majors = ['计算机科学', '金融学', '临床医学', '建筑学', '汉语言文学', '电子工程', '工商管理', '法学', '设计学', '数据科学', '教育学', '生物工程'];
const careers = [
  ['互联网', '软件工程师'], ['金融', '风险管理经理'], ['医疗', '主治医师'], ['教育', '高中教师'],
  ['建筑', '建筑设计师'], ['制造业', '产品经理'], ['咨询', '管理顾问'], ['法律', '企业法务'],
  ['文化传媒', '内容策划'], ['科研', '研究员'], ['贸易', '供应链经理'], ['政府及事业单位', '项目主管'],
];
const incomes = ['1-1.5万/月', '1.5-3万/月', '1.5-3万/月', '3-5万/月', '5万以上/月'];
const properties = ['上海有房', '有房（按揭）', '与父母同住，婚后可购房', '暂无房产', '外地有房'];
const cars = ['有车', '无车', '新能源车'];
const traitPool = ['性格温和', '真诚可靠', '积极上进', '孝顺顾家', '开朗大方', '情绪稳定', '有责任心', '独立自律', '热爱生活', '善于沟通'];
const hobbyPool = ['阅读、徒步和看展', '羽毛球、旅行和摄影', '烹饪、电影和音乐', '跑步、咖啡和城市漫步', '游泳、露营和自驾', '书法、历史和博物馆', '健身、桌游和美食探店', '园艺、宠物和短途旅行'];
const aboutTemplates = [
  '工作稳定，待人真诚，周末喜欢陪伴家人，也会安排运动和短途旅行。希望认识价值观接近、愿意认真经营感情的人。',
  '在上海学习和工作多年，生活规律，性格随和。重视沟通与家庭，也尊重彼此的事业发展和个人空间。',
  '平时工作认真，休息时喜欢做饭、看展和散步。家庭氛围和睦，希望双方坦诚相处，共同规划未来。',
  '经济独立，无不良嗜好，朋友圈简单稳定。期待从朋友开始了解，彼此包容，一起建设温暖的小家庭。',
];
const additionalPreferences = [
  '真诚善良，情绪稳定，有责任心，遇到问题愿意沟通。',
  '生活习惯健康，尊重双方父母，对未来有清晰规划。',
  '工作稳定，三观契合，希望在长三角长期发展。',
  '性格开朗，待人有礼，愿意共同承担家庭责任。',
];
const messageTemplates = [
  '您好，我们认真看了孩子的资料，感觉两边的情况挺合适，想先认识一下。',
  '您好，谢谢您的关注。请问孩子目前是长期在上海工作吗？',
  '是的，工作和生活都比较稳定，未来也打算留在上海发展。',
  '挺好的，我们家也希望孩子以后在长三角生活，离双方父母都不算太远。',
  '孩子平时周末喜欢运动和看展，生活比较规律。您家孩子有什么爱好吗？',
  '平时喜欢阅读、旅行，偶尔和朋友打羽毛球，性格比较随和。',
  '听起来很不错。如果双方孩子愿意，可以先加深了解，不给他们太大压力。',
  '同意，还是让年轻人自然交流比较好，我们做家长的主要是帮忙牵线。',
  '这周末人民公园附近方便吗？可以先让他们一起喝杯咖啡。',
  '周日下午比较合适，我先和孩子确认时间，再回复您。',
  '好的，不着急。也请代我们向家里人问好。',
  '谢谢，您也一样。希望两个孩子能聊得来。',
  '刚刚确认过了，周日下午三点可以，地点您看哪里方便？',
  '徐家汇附近交通方便，我们选一家安静的咖啡馆，稍后把地址发您。',
  '收到，谢谢您的细心安排，到时候让孩子们轻松聊聊。',
  '孩子说第一次见面感觉不错，交流很自然，感谢您介绍。',
];

function createRandom(seed = 20260826) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function pick(items, random) {
  return items[Math.floor(random() * items.length)];
}

function pad(value, width = 4) {
  return String(value).padStart(width, '0');
}

function isoDaysAgo(days, minutes = 0) {
  return new Date(Date.now() - days * 86400000 - minutes * 60000).toISOString();
}

function buildUsersAndProfiles(profileCount, random) {
  const users = [];
  const profiles = [];
  for (let index = 1; index <= profileCount; index += 1) {
    const idSuffix = pad(index);
    const userId = `${DEMO_PREFIX}user_${idSuffix}`;
    const profileId = `${DEMO_PREFIX}profile_${idSuffix}`;
    const gender = index % 2 === 0 ? '女' : '男';
    const surname = surnames[(index * 7) % surnames.length];
    const givenName = givenNames[(index * 11 + Math.floor(index / givenNames.length)) % givenNames.length];
    const [city, hukou, hometown] = pick(cities, random);
    const birthYear = 1987 + Math.floor(random() * 12);
    const createdDaysAgo = Math.floor(random() * 180);
    const lastSeenMinutes = Math.floor(random() * 10080);
    const salt = crypto.createHash('sha256').update(`gex-demo-${idSuffix}`).digest('hex').slice(0, 32);
    const career = pick(careers, random);
    const preferredMinAge = Math.max(25, new Date().getFullYear() - birthYear - 4);
    const preferredMaxAge = new Date().getFullYear() - birthYear + 5;
    const minHeight = gender === '女' ? 170 : 155;
    const maxHeight = gender === '女' ? 190 : 175;
    const traits = [pick(traitPool, random), pick(traitPool, random), pick(traitPool, random)].filter((item, itemIndex, array) => array.indexOf(item) === itemIndex);

    users.push({
      id: userId,
      email: `demo${pad(index, 3)}@example.com`,
      passwordSalt: salt,
      passwordHash: hashPassword('Demo!2026', salt),
      createdAt: isoDaysAgo(createdDaysAgo, index),
      lastSeenAt: isoDaysAgo(0, lastSeenMinutes),
      language: 'zh',
      synthetic: true,
    });

    const preferenceDetails = {
      preferredAgeRange: `${preferredMinAge}-${preferredMaxAge}岁`,
      preferredHeightRange: `${minHeight}-${maxHeight}厘米`,
      minEducationLevel: index % 5 === 0 ? '硕士及以上' : '本科及以上',
      hukouPreference: index % 4 === 0 ? '上海户口优先，条件合适可不限' : '不限户口，长期在长三角发展',
      additionalPreferences: pick(additionalPreferences, random),
    };

    profiles.push({
      id: profileId,
      ownerUserId: userId,
      honorific: index % 3 === 0 ? `${surname}叔叔` : `${surname}阿姨`,
      surname,
      childAlias: `${surname}${givenName}`,
      gender,
      birthYear,
      age: new Date().getFullYear() - birthYear,
      height: gender === '男' ? 170 + Math.floor(random() * 17) : 158 + Math.floor(random() * 14),
      weight: gender === '男' ? 62 + Math.floor(random() * 20) : 48 + Math.floor(random() * 15),
      city,
      hukou,
      hometown,
      education: pick(educationOptions, random),
      school: pick(schools, random),
      major: pick(majors, random),
      industry: career[0],
      jobTitle: career[1],
      income: pick(incomes, random),
      property: pick(properties, random),
      car: pick(cars, random),
      traits,
      hobbies: pick(hobbyPool, random),
      about: pick(aboutTemplates, random),
      ...preferenceDetails,
      preferences: Object.values(preferenceDetails).join(' · '),
      createdAt: isoDaysAgo(createdDaysAgo, index),
      synthetic: true,
    });
  }
  return { users, profiles };
}

function buildConnections(connectionCount, users, profiles, random) {
  const connections = [];
  const usedPairs = new Set();
  let attempts = 0;
  while (connections.length < connectionCount && attempts < connectionCount * 100) {
    attempts += 1;
    const leftIndex = Math.floor(random() * users.length);
    const rightIndex = Math.floor(random() * users.length);
    if (leftIndex === rightIndex || profiles[leftIndex].gender === profiles[rightIndex].gender) {
      continue;
    }
    const pairKey = [leftIndex, rightIndex].sort((a, b) => a - b).join(':');
    if (usedPairs.has(pairKey)) {
      continue;
    }
    usedPairs.add(pairKey);
    const index = connections.length + 1;
    const statusSlot = index % 10;
    const status = statusSlot < 7 ? 'approved' : statusSlot < 9 ? 'pending' : 'rejected';
    const createdDaysAgo = 5 + Math.floor(random() * 120);
    connections.push({
      id: `${DEMO_PREFIX}connection_${pad(index)}`,
      requesterUserId: users[leftIndex].id,
      requesterProfileId: profiles[leftIndex].id,
      targetUserId: users[rightIndex].id,
      targetProfileId: profiles[rightIndex].id,
      status,
      createdAt: isoDaysAgo(createdDaysAgo, index),
      updatedAt: isoDaysAgo(Math.max(0, createdDaysAgo - Math.floor(random() * 5)), index),
      synthetic: true,
    });
  }
  if (connections.length !== connectionCount) {
    throw new Error(`Could only create ${connections.length} unique demo connections.`);
  }
  return connections;
}

function buildMessages(messageCount, connections) {
  const approved = connections.filter((connection) => connection.status === 'approved');
  if (messageCount > 0 && approved.length === 0) {
    throw new Error('At least one approved demo connection is required to create messages.');
  }
  const messages = [];
  for (let index = 0; index < messageCount; index += 1) {
    const connection = approved[index % approved.length];
    const sequence = Math.floor(index / approved.length);
    const senderUserId = sequence % 2 === 0 ? connection.requesterUserId : connection.targetUserId;
    const connectionStart = new Date(connection.updatedAt).getTime();
    const createdAt = new Date(connectionStart + (sequence + 1) * 3 * 3600000 + (index % approved.length) * 60000).toISOString();
    messages.push({
      id: `${DEMO_PREFIX}message_${pad(index + 1, 5)}`,
      connectionId: connection.id,
      senderUserId,
      text: messageTemplates[(sequence + index) % messageTemplates.length],
      messageType: 'text',
      imageDataUrl: null,
      createdAt,
      synthetic: true,
    });
  }
  return messages;
}

function removePreviousDemoData(state) {
  const isDemoId = (value) => typeof value === 'string' && value.startsWith(DEMO_PREFIX);
  state.users = state.users.filter((item) => !isDemoId(item.id));
  state.sessions = state.sessions.filter((item) => !isDemoId(item.userId));
  state.profiles = state.profiles.filter((item) => !isDemoId(item.id));
  state.connections = state.connections.filter((item) => !isDemoId(item.id));
  state.messages = state.messages.filter((item) => !isDemoId(item.id));
  state.hiddenMessages = state.hiddenMessages.filter((item) => !isDemoId(item.id) && !isDemoId(item.messageId));
  state.typingStates = state.typingStates.filter((item) => !isDemoId(item.id) && !isDemoId(item.userId));
}

async function seedDemoData(counts = DEFAULT_COUNTS) {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Production demo seeding is disabled. Set ALLOW_DEMO_SEED=true for this deliberate operation.');
  }

  const requested = { ...DEFAULT_COUNTS, ...counts };
  if (!Number.isInteger(requested.profiles) || requested.profiles < 2 || requested.profiles > 5000) {
    throw new Error('Demo profile count must be an integer between 2 and 5000.');
  }
  const maximumPairs = Math.floor(requested.profiles / 2) * Math.ceil(requested.profiles / 2);
  if (!Number.isInteger(requested.connections) || requested.connections < 0 || requested.connections > maximumPairs) {
    throw new Error(`Demo connection count must be between 0 and ${maximumPairs}.`);
  }
  if (!Number.isInteger(requested.messages) || requested.messages < 0 || requested.messages > 100000) {
    throw new Error('Demo message count must be between 0 and 100000.');
  }

  await loadState();
  return withState(async (state) => {
    removePreviousDemoData(state);
    const random = createRandom();
    const { users, profiles } = buildUsersAndProfiles(requested.profiles, random);
    const connections = buildConnections(requested.connections, users, profiles, random);
    const messages = buildMessages(requested.messages, connections);
    state.users.push(...users);
    state.profiles.push(...profiles);
    state.connections.push(...connections);
    state.messages.push(...messages);
    return {
      profiles: profiles.length,
      users: users.length,
      connections: connections.length,
      approvedConnections: connections.filter((item) => item.status === 'approved').length,
      messages: messages.length,
      demoLogin: 'demo001@example.com',
    };
  });
}

export { DEFAULT_COUNTS, seedDemoData };
