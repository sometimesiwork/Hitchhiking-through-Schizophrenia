// Supabase client configuration
class SupabaseClient {
    constructor() {
        const supabaseUrl = window.ENV?.SUPABASE_URL;
        const supabaseKey = window.ENV?.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase credentials not found. Running in offline mode.');
            this.offline = true;
            return;
        }

        this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        this.offline = false;
    }

    async saveGame(playerName, gameState) {
        if (this.offline) {
            localStorage.setItem('gameSave', JSON.stringify({ playerName, gameState }));
            return { success: true, offline: true };
        }

        try {
            const { data, error } = await this.supabase
                .from('game_saves')
                .upsert({
                    player_name: playerName,
                    save_data: gameState,
                    chapter: gameState.chapter,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'player_name'
                });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error saving game:', error);
            localStorage.setItem('gameSave', JSON.stringify({ playerName, gameState }));
            return { success: false, error, offline: true };
        }
    }

    async loadGame(playerName) {
        if (this.offline) {
            const saved = localStorage.getItem('gameSave');
            return saved ? JSON.parse(saved) : null;
        }

        try {
            const { data, error } = await this.supabase
                .from('game_saves')
                .select('*')
                .eq('player_name', playerName)
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            return data ? data.save_data : null;
        } catch (error) {
            console.error('Error loading game:', error);
            const saved = localStorage.getItem('gameSave');
            return saved ? JSON.parse(saved).gameState : null;
        }
    }

    async updateStatistics(playerName, stats) {
        if (this.offline) {
            localStorage.setItem('gameStats', JSON.stringify(stats));
            return { success: true, offline: true };
        }

        try {
            const { data, error } = await this.supabase
                .from('game_statistics')
                .upsert({
                    player_name: playerName,
                    total_plays: stats.totalPlays || 0,
                    endings_reached: stats.endingsReached || [],
                    achievements: stats.achievements || [],
                    best_stats: stats.bestStats || {},
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'player_name'
                });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error updating statistics:', error);
            localStorage.setItem('gameStats', JSON.stringify(stats));
            return { success: false, error, offline: true };
        }
    }

    async getLeaderboard(limit = 10) {
        if (this.offline) {
            return [];
        }

        try {
            const { data, error } = await this.supabase
                .from('game_statistics')
                .select('player_name, total_plays, achievements, endings_reached')
                .order('total_plays', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
    }
}

// Initialize client
const supabaseClient = new SupabaseClient();
