let userId;
let score = 0;
let multitapLevel = 1;
let energy = 1000;
let energyLimit = 1000;
let fullTankUses = 0;
let lastFullTank = new Date();
let tapbotActive = false;

const maxEnergy = energyLimit;
const energyRegenRate = maxEnergy / 900; // 2 минуты для полного восстановления

document.addEventListener('DOMContentLoaded', function() {
    getUserId();

    document.getElementById('coin').addEventListener('click', clickCoin);
    document.getElementById('full-tank').addEventListener('click', fullTank);
    document.getElementById('upgrade-multitap').addEventListener('click', upgradeMultitap);
    document.getElementById('upgrade-energy-limit').addEventListener('click', upgradeEnergyLimit);
    document.getElementById('activate-tapbot').addEventListener('click', activateTapbot);
    document.getElementById('boosts-button').addEventListener('click', () => showPage('boosts'));
    document.getElementById('back-to-clicker').addEventListener('click', () => showPage('clicker'));

    // Сохранение баланса и энергии при закрытии или перезагрузке страницы
    window.addEventListener('beforeunload', saveUserData);
});

async function getUserId() {
    const params = new URLSearchParams(window.location.search);
    userId = params.get('user_id');

    // Получить текущий счет пользователя из базы данных
    const response = await fetch(`/api/get_score?user_id=${userId}`);
    if (!response.ok) {
        console.error('Ошибка получения данных пользователя:', response.statusText);
        return;
    }
    const data = await response.json();
    score = data.score;
    multitapLevel = data.multitap_level || 1;
    energy = parseFloat(localStorage.getItem(`energy_${userId}`)) || maxEnergy;
    const lastUpdate = parseInt(localStorage.getItem(`lastUpdate_${userId}`)) || Date.now();

    // Рассчитать восстановленную энергию с момента последнего обновления
    const elapsedTime = (Date.now() - lastUpdate) / 1000; // в секундах
    energy += energyRegenRate * elapsedTime;
    if (energy > maxEnergy) {
        energy = maxEnergy;
    }

    // Обновить UI после получения данных
    updateUI();
}

function updateUI() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = score;

    const energyElement = document.getElementById('energy');
    if (energyElement) {
        const prevWidth = energyElement.style.width;
        energyElement.style.width = (energy / maxEnergy) * 100 + '%';

        // Добавить анимацию для полосы энергии
        energyElement.animate([
            { width: prevWidth },
            { width: (energy / maxEnergy) * 100 + '%' }
        ], {
            duration: 1000,
            easing: 'linear'
        });
    }

    const energyCountElement = document.getElementById('energy-count');
    if (energyCountElement) energyCountElement.innerText = Math.floor(energy);

    // Сохранить текущее значение энергии и время обновления в localStorage
    localStorage.setItem(`energy_${userId}`, energy);
    localStorage.setItem(`lastUpdate_${userId}`, Date.now());
}

function clickCoin() {
    if (energy > 0) {
        score += 1 * multitapLevel;
        energy -= 1 * multitapLevel;
        updateUI();

        // Отправить обновленный счет на сервер
        fetch('/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId, score: score, multitap_level: multitapLevel, energy: energy }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    }
}

function regenerateEnergy() {
    if (energy < maxEnergy) {
        energy += energyRegenRate;
        if (energy > maxEnergy) {
            energy = maxEnergy;
        }
        updateUI();
    }
}

function getUpgradeCost(level) {
    return Math.pow(level, 2) * 100;
}


function showPage(page) {
    const pages = {
        'clicker': 'clicker-page',
        'boosts': 'boosts-page',
        'referrals': 'referrals-page',  // Добавьте эти страницы, если они будут
        'tasks': 'tasks-page',          // Добавьте эти страницы, если они будут
        'wallet': 'wallet-page'         // Добавьте эти страницы, если они будут
    };

    for (const key in pages) {
        document.getElementById(pages[key]).style.display = (key === page) ? 'block' : 'none';
    }

    if (page === 'boosts') {
        updateUI();
    }
}

function saveUserData() {
    // Сохранить текущее значение баланса и энергии
    localStorage.setItem(`score_${userId}`, score);
    localStorage.setItem(`energy_${userId}`, energy);
    localStorage.setItem(`lastUpdate_${userId}`, Date.now());
}

setInterval(regenerateEnergy, 1000);

function fullTank() {
    const now = new Date();
    const timeSinceLastFullTank = (now - lastFullTank) / (1000 * 60 * 60 * 24); // in days

    if (fullTankUses < 3 || timeSinceLastFullTank >= 1) {
        energy = energyLimit;
        fullTankUses = timeSinceLastFullTank >= 1 ? 1 : fullTankUses + 1;
        lastFullTank = now;
        updateUI();
        saveUserData();
    } else {
        alert('You can only use Full Tank 3 times per day.');
    }
}

function upgradeMultitap() {
    const cost = getUpgradeCost(multitapLevel);

    if (balance >= cost) {
        balance -= cost;
        multitapLevel++;
        updateUI();
        saveUserData();
    } else {
        alert('Not enough balance to upgrade Multitap.');
    }
}

function upgradeEnergyLimit() {
    const currentLevel = energyLimit / 500;
    const cost = getUpgradeCost(currentLevel);

    if (balance >= cost) {
        balance -= cost;
        energyLimit += 500;
        updateUI();
        saveUserData();
    } else {
        alert('Not enough balance to upgrade Energy Limit.');
    }
}


function activateTapbot() {
    const cost = 50000;

    if (balance >= cost) {
        balance -= cost;
        tapbotActive = true;
        updateUI();
        saveUserData();
    } else {
        alert('Not enough balance to activate Tapbot.');
    }
}

//function saveUserData() {
//    fetch('/update', {
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/json'
//        },
//        body: JSON.stringify({
//            user_id: userId,
//            score: balance,
//            energy: energy,
//            multitap_level: multitapLevel,
//            energy_limit: energyLimit,
//            full_tank_uses: fullTankUses,
//            last_full_tank: lastFullTank.toISOString(),
//            tapbot_active: tapbotActive
//        })
//    }).then(response => response.json())
//     .then(data => {
//          if (data.status !== 'success') {
//              alert('Failed to save user data.');
//          }
//      });
//}



