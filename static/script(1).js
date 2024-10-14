let userId = new URLSearchParams(window.location.search).get('user_id');
let balance = 0;
let multitapLevel = 1;
let energy = 1000;
let energyLimit = 1000;
let fullTankUses = 0;
let lastFullTank = new Date();
let tapbotActive = false;

const maxEnergy = energyLimit;
const energyRegenRate = maxEnergy / 900; // 2 minutes to fully regenerate

document.addEventListener('DOMContentLoaded', function() {
    fetchUserData();

    document.getElementById('coin').addEventListener('click', clickCoin);
    document.getElementById('full-tank').addEventListener('click', fullTank);
    document.getElementById('upgrade-multitap').addEventListener('click', upgradeMultitap);
    document.getElementById('upgrade-energy-limit').addEventListener('click', upgradeEnergyLimit);
    document.getElementById('activate-tapbot').addEventListener('click', activateTapbot);
    document.getElementById('boosts-button').addEventListener('click', () => showPage('boosts'));
    document.getElementById('back-to-clicker').addEventListener('click', () => showPage('clicker'));
});




function fetchUserData() {
    fetch(`/user_data?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            balance = data.score;
            energy = data.energy;
            multitapLevel = data.multitap_level;
            energyLimit = data.energy_limit;
            fullTankUses = data.full_tank_uses;
            lastFullTank = new Date(data.last_full_tank);
            tapbotActive = data.tapbot_active;

            updateUI();
        });
}

function updateUI() {
    document.getElementById('score').innerText = balance;
    document.getElementById('energy-count').innerText = energy;
    document.getElementById('balance-count').innerText = balance;
    document.getElementById('multitap-cost').innerText = getUpgradeCost(multitapLevel);
    document.getElementById('energy-limit-cost').innerText = getUpgradeCost(energyLimit / 500);
}

function clickCoin() {
    if (energy > 0) {
        balance += multitapLevel;
        energy -= 1 * multitapLevel;
        updateUI();
        saveUserData();
    }
}

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

function getUpgradeCost(level) {
    return 500 * Math.pow(2, level - 1);
}

function saveUserData() {
    fetch('/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: userId,
            score: balance,
            energy: energy,
            multitap_level: multitapLevel,
            energy_limit: energyLimit,
            full_tank_uses: fullTankUses,
            last_full_tank: lastFullTank.toISOString(),
            tapbot_active: tapbotActive
        })
    }).then(response => response.json())
      .then(data => {
          if (data.status !== 'success') {
              alert('Failed to save user data.');
          }
      });
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

function regenerateEnergy() {
    if (energy < maxEnergy) {
        energy += energyRegenRate;
        if (energy > maxEnergy) {
            energy = maxEnergy;
        }
        updateUI();
    }
}

setInterval(regenerateEnergy, 1000);

