import { NextRequest, NextResponse } from 'next/server';

// Mock data для leaderboard
// В будущем заменить на реальную базу данных (Vercel KV, Supabase, или MongoDB)
const generateMockLeaderboard = (count: number = 100) => {
  const names = [
    'SpaceAce', 'AlienHunter', 'CosmicWarrior', 'StarDefender', 'GalaxyGuard',
    'NeonNinja', 'PixelPilot', 'RetroRacer', 'ArcadeKing', 'HighScoreHero',
    'LaserLegend', 'ShieldMaster', 'BlasterBoss', 'InvaderSlayer', 'PowerPlayer',
    'TurboTactician', 'SuperShooter', 'MegaMaster', 'UltraGamer', 'ProPlayer',
  ];

  const entries = [];
  let baseScore = 1000000;

  for (let i = 0; i < count; i++) {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomNumber = Math.floor(Math.random() * 9999);

    entries.push({
      rank: i + 1,
      player: `${randomName}#${randomNumber}`,
      score: baseScore - (i * 5000) + Math.floor(Math.random() * 2000),
      level: Math.max(1, 50 - Math.floor(i / 2) + Math.floor(Math.random() * 5)),
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  }

  return entries;
};

// Кэш для mock данных (в production использовать Redis/KV)
let cachedLeaderboard: ReturnType<typeof generateMockLeaderboard> | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 60000; // 1 минута

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all'; // all, weekly, daily
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Использовать кэш если актуален
    const now = Date.now();
    if (!cachedLeaderboard || (now - cacheTime) > CACHE_DURATION) {
      cachedLeaderboard = generateMockLeaderboard(100);
      cacheTime = now;
    }

    let filteredEntries = cachedLeaderboard;

    // Фильтрация по времени (для weekly/daily - упрощенная логика)
    if (filter === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredEntries = cachedLeaderboard.filter(entry =>
        new Date(entry.date) >= weekAgo
      );
    } else if (filter === 'daily') {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      filteredEntries = cachedLeaderboard.filter(entry =>
        new Date(entry.date) >= dayAgo
      );
    }

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      entries: paginatedEntries,
      total: filteredEntries.length,
      page,
      limit,
      hasMore: endIndex < filteredEntries.length,
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

// POST endpoint для добавления новых scores (будущая функциональность)
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
