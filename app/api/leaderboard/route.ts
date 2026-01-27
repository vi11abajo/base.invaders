import { NextRequest, NextResponse } from 'next/server';

// Типы для leaderboard entries
interface LeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  level: number;
  date: string;
}

interface PlayerScores {
  [player: string]: LeaderboardEntry[];
}

// Mock данные - первые 50 мест с результатами 10-50K
const generateMockLeaderboard = (count: number = 50) => {
  const names = [
    'SpaceAce', 'AlienHunter', 'CosmicWarrior', 'StarDefender', 'GalaxyGuard',
    'NeonNinja', 'PixelPilot', 'RetroRacer', 'ArcadeKing', 'HighScoreHero',
    'LaserLegend', 'ShieldMaster', 'BlasterBoss', 'InvaderSlayer', 'PowerPlayer',
    'TurboTactician', 'SuperShooter', 'MegaMaster', 'UltraGamer', 'ProPlayer',
    'OctoMaster', 'CrabDestroyer', 'WaveRider', 'SeaWarrior', 'DeepDiver',
    'TidalForce', 'CoralCrusher', 'KrakenSlayer', 'SailorSniper', 'BaseHero',
  ];

  const entries: LeaderboardEntry[] = [];
  const usedPlayers = new Set<string>();

  // Генерируем топ 50 с очками от 50K до 10K
  const maxScore = 50000;
  const minScore = 10000;
  const scoreRange = maxScore - minScore;

  for (let i = 0; i < count; i++) {
    // Уникальное имя игрока
    let playerName: string;
    do {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomNumber = Math.floor(Math.random() * 9999);
      playerName = `${randomName}#${randomNumber}`;
    } while (usedPlayers.has(playerName));
    usedPlayers.add(playerName);

    // Очки уменьшаются от 50K до 10K
    const scoreProgress = i / (count - 1); // 0 to 1
    const baseScore = maxScore - (scoreRange * scoreProgress);
    const score = Math.floor(baseScore + (Math.random() * 500 - 250)); // Small random variation

    // Уровень зависит от очков
    const level = Math.max(1, Math.floor(score / 2000) + Math.floor(Math.random() * 3));

    // Дата: разные периоды для all-time, weekly, daily
    let date: Date;
    if (i < 15) {
      // Первые 15 - сегодня (для daily)
      date = new Date();
      date.setHours(date.getHours() - Math.floor(Math.random() * 12));
    } else if (i < 35) {
      // 16-35 - на этой неделе (для weekly)
      date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 7));
    } else {
      // 36-50 - за последний месяц (для all-time)
      date = new Date();
      date.setDate(date.getDate() - (7 + Math.floor(Math.random() * 23)));
    }

    entries.push({
      rank: i + 1,
      player: playerName,
      score: score,
      level: level,
      date: date.toISOString().split('T')[0],
    });
  }

  return entries;
};

// Функция для получения лучшего результата каждого игрока
const getBestScorePerPlayer = (entries: LeaderboardEntry[]): LeaderboardEntry[] => {
  const playerBest: { [player: string]: LeaderboardEntry } = {};

  // Для каждого игрока оставляем только лучший результат
  entries.forEach(entry => {
    if (!playerBest[entry.player] || entry.score > playerBest[entry.player].score) {
      playerBest[entry.player] = entry;
    }
  });

  // Преобразуем в массив и сортируем по очкам
  const bestScores = Object.values(playerBest);
  bestScores.sort((a, b) => b.score - a.score);

  // Обновляем ранги
  bestScores.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return bestScores;
};

// Кэш для mock данных
let cachedLeaderboard: LeaderboardEntry[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 60000; // 1 минута

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all'; // all, weekly, daily
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Использовать кэш если актуален
    const now = Date.now();
    if (!cachedLeaderboard || (now - cacheTime) > CACHE_DURATION) {
      cachedLeaderboard = generateMockLeaderboard(50);
      cacheTime = now;
    }

    let filteredEntries = cachedLeaderboard;

    // Фильтрация по времени
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    if (filter === 'weekly') {
      filteredEntries = cachedLeaderboard.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekAgo;
      });
    } else if (filter === 'daily') {
      filteredEntries = cachedLeaderboard.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= today;
      });
    }

    // Получаем лучший результат каждого игрока
    const bestScores = getBestScorePerPlayer(filteredEntries);

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = bestScores.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      entries: paginatedEntries,
      total: bestScores.length,
      page,
      limit,
      hasMore: endIndex < bestScores.length,
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

// POST endpoint для добавления новых scores
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { player, score, level } = body;

    // TODO: Валидация данных
    // TODO: Проверка на читы (rate limiting, score validation)
    // TODO: Сохранение в базу данных

    console.log('New score submitted:', { player, score, level });

    return NextResponse.json({
      success: true,
      message: 'Score submitted (mock response)',
      rank: Math.floor(Math.random() * 100) + 1,
    });
  } catch (error) {
    console.error('Score submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}
