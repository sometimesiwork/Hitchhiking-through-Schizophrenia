/*
  # Create game saves and statistics tables

  1. New Tables
    - `game_saves`
      - `id` (uuid, primary key)
      - `player_name` (text)
      - `save_data` (jsonb) - complete game state
      - `chapter` (integer) - current chapter
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `game_statistics`
      - `id` (uuid, primary key)
      - `player_name` (text)
      - `total_plays` (integer)
      - `endings_reached` (jsonb) - track different endings
      - `achievements` (jsonb) - unlocked achievements
      - `best_stats` (jsonb) - highest stats achieved
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Allow anyone to read/write (public game)
*/

CREATE TABLE IF NOT EXISTS game_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  save_data jsonb NOT NULL,
  chapter integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text UNIQUE NOT NULL,
  total_plays integer DEFAULT 0,
  endings_reached jsonb DEFAULT '[]'::jsonb,
  achievements jsonb DEFAULT '[]'::jsonb,
  best_stats jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_statistics ENABLE ROW LEVEL SECURITY;

-- Public game - anyone can read and write
CREATE POLICY "Anyone can read game saves"
  ON game_saves
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert game saves"
  ON game_saves
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update game saves"
  ON game_saves
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete game saves"
  ON game_saves
  FOR DELETE
  USING (true);

CREATE POLICY "Anyone can read statistics"
  ON game_statistics
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert statistics"
  ON game_statistics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update statistics"
  ON game_statistics
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS game_saves_player_name_idx ON game_saves(player_name);
CREATE INDEX IF NOT EXISTS game_saves_created_at_idx ON game_saves(created_at DESC);
CREATE INDEX IF NOT EXISTS game_statistics_player_name_idx ON game_statistics(player_name);