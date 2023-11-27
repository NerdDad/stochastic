import { serve } from "../_shared/serve.ts";

serve(async (_, supabase, user) => {
  if (!user) throw "Not authenticated";

  const games = await supabase
    .from("game")
    .select(`*, game_players(*), game_types(max_players)`)
    .is("finish_time", null);

  if (!games?.data) throw "Unable to get games";
  // for (const g in current_games) {
  //   await supabase.from("game_players").select().eq('')
  // }
  console.log(games.data);

  const toJoin = games.data.filter((g) => {
    if (g.game_players.find((p) => p.player_id === user.id)) return false;
    return g.game_players.length < (g.game_types?.max_players ?? 5);
  });

  const playing = games.data.filter((g) => {
    if (g.start_time && g.game_players.find((p) => p.player_id === user.id))
      return true;
  });

  return {
    message: `Current games`,
    info: games.data,
    toJoin,
    playing,
  };
});
