// script.js
let gameData = JSON.parse(localStorage.getItem('yyGame')) || {
    points: 50,
    inventory: []
};

const cardData = [
    { 
        id: 1,
        name: '讚讚卡',
        rarity: 'N',
        effect: '小毓毓會瘋狂讚您',
        execution: '連續講出10個不重複的優點',
        image: 'cards/card1.png'
    },
    {
        id: 2,
        name: '外賣卡',
        rarity: 'R',
        effect: '召喚小毓毓幫你送外賣',
        execution: '寫下想吃的食物（或從推薦餐廳選擇）',
        image: 'cards/card2.png'
    },
    {
        id: 3,
        name: '按摩卡',
        rarity: 'SR',
        effect: '兌換指定部位按摩',
        execution: '15分鐘專業按摩服務（需預約）',
        image: 'cards/card3.png'
    },
    {
        id: 4,
        name: '冷戰終結卡',
        rarity: 'SSR',
        effect: '立即終止冷戰',
        execution: '書面檢討並提出改善方案',
        image: 'cards/card4.png'
    },
    {
        id: 5,
        name: '神秘禮物卡',
        rarity: 'UR',
        effect: '兌換神秘盲盒禮物',
        execution: '準備心跳加速的驚喜',
        image: 'cards/card5.png'
    }
];

// 系統功能
function showNotice(text, duration=1500) {
    const notice = document.querySelector('.save-notice');
    notice.textContent = text;
    notice.style.display = 'block';
    setTimeout(() => notice.style.display = 'none', duration);
}

function saveGame() {
    localStorage.setItem('yyGame', JSON.stringify(gameData));
    showNotice('遊戲進度已保存！');
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    if (pageId === 'inventory') updateInventory();
    document.getElementById('points').textContent = gameData.points;
}

// 遊戲功能
function startGame() {
    const questions = [
        "小毓毓最喜歡的顏色？",
        "我們第一次約會的地點？",
        "小毓毓的生日月份？",
        "我最喜歡小毓毓的哪一點？"
    ];

    let score = 0;
    questions.forEach((q, i) => {
        const answer = prompt(`第 ${i+1} 題：${q}`);
        if (answer) score += 25;
    });

    const earnedPoints = Math.floor(score);
    gameData.points += earnedPoints;
    saveGame();
    alert(`💖 默契度 ${score}%！獲得 ${earnedPoints} 點！`);
    showPage('home');
}

// 抽卡系統
function drawCard() {
    if (gameData.points < 10) {
        alert('點數不足！快去玩遊戲賺點數～');
        return;
    }

    gameData.points -= 10;
    const rarityRoll = Math.random();
    let selectedRarity;

    if (rarityRoll < 0.01) selectedRarity = 'UR';
    else if (rarityRoll < 0.05) selectedRarity = 'SSR';
    else if (rarityRoll < 0.20) selectedRarity = 'SR';
    else if (rarityRoll < 0.50) selectedRarity = 'R';
    else selectedRarity = 'N';

    const pool = cardData.filter(c => c.rarity === selectedRarity);
    const newCard = {...pool[Math.floor(Math.random() * pool.length)]};
    gameData.inventory.push(newCard);
    
    showCardResult(newCard);
    saveGame();
}

function showCardResult(card) {
    const container = document.getElementById('card-result');
    container.innerHTML = `
        <div class="card" onclick="this.classList.toggle('flipped')">
            <div class="card-inner">
                <div class="card-face card-front">
                    <img src="${card.image}" class="card-image">
                    <div class="rarity-badge">${card.rarity}</div>
                </div>
                <div class="card-face card-back">
                    <h3>${card.name}</h3>
                    <p>📌 效果：${card.effect}</p>
                    <p>⚡ 執行：${card.execution}</p>
                </div>
            </div>
        </div>
        <p class="card-result-text">🎉 獲得 ${card.name}！</p>
    `;
    showPage('draw');
}

// 卡庫管理
function updateInventory() {
    const container = document.getElementById('card-list');
    container.innerHTML = gameData.inventory.map((card, index) => `
        <div class="card" onclick="this.classList.toggle('flipped')">
            <div class="card-inner">
                <div class="card-face card-front">
                    <img src="${card.image}" class="card-image">
                    <div class="rarity-badge">${card.rarity}</div>
                </div>
                <div class="card-face card-back">
                    <h3>${card.name}</h3>
                    <p>📌 效果：${card.effect}</p>
                    <p>⚡ 執行：${card.execution}</p>
                    <button onclick="useCard(${index})">使用</button>
                </div>
            </div>
        </div>
    `).join('') || '<p class="empty-tip">卡庫空空如也，快去抽卡吧～</p>';
}

function useCard(index) {
    const card = gameData.inventory[index];
    if (confirm(`確定要使用「${card.name}」嗎？\n效果：${card.effect}`)) {
        alert(`🎉 已使用 ${card.name}！\n執行方式：${card.execution}`);
        gameData.inventory.splice(index, 1);
        updateInventory();
        saveGame();
    }
}

// 合成系統
function craftCard(targetRarity) {
    const recipes = {
        'R': { need: 'N', amount: 3 },
        'SR': { need: 'R', amount: 2 }
    };

    const recipe = recipes[targetRarity];
    const materials = gameData.inventory.filter(c => c.rarity === recipe.need);

    if (materials.length >= recipe.amount) {
        let count = 0;
        gameData.inventory = gameData.inventory.filter(c => {
            if (c.rarity === recipe.need && count < recipe.amount) {
                count++;
                return false;
            }
            return true;
        });

        const newCardPool = cardData.filter(c => c.rarity === targetRarity);
        const newCard = {...newCardPool[Math.floor(Math.random() * newCardPool.length)]};
        gameData.inventory.push(newCard);
        
        updateInventory();
        saveGame();
        alert(`✨ 合成成功！獲得 ${newCard.name}！`);
    } else {
        alert(`材料不足！需要${recipe.amount}張${recipe.need}卡`);
    }
}

// 初始化遊戲
document.getElementById('points').textContent = gameData.points;
showPage('home');

// 圖片預加載
window.addEventListener('load', () => {
    cardData.forEach(card => {
        new Image().src = card.image;
    });
});