import { serve } from "../_shared/serve.ts";

serve(async (req, supabase, user) => {
  if (!user) throw "Not authenticated";
  const { type } = await req.json();
  const game_type = await supabase
    .from("game_types")
    .select()
    .eq("id", type)
    .single();

  if (!game_type?.data) throw "Not a game!";
  console.log("valid game type:", game_type.data.name);

  const current_games = await supabase
    .from("game")
    .select()
    .eq("creator_id", user.id)
    // .eq("game_type_id", game_type.data.id)
    .is("finish_time", null);

  console.log("current games:", current_games?.data);
  if (current_games?.data?.length ?? 0 > 0) throw "Already in a game";

  const new_game = await supabase
    .from("game")
    .insert({ game_type_id: game_type.data.id })
    .select()
    .single();

  console.log("new game: ", JSON.stringify(new_game.data));

  if (!new_game.data?.id) throw "Could not create game";
  const new_player = await supabase
    .from("game_players")
    .insert({
      game_id: new_game.data.id,
      player_id: user.id,
      confirmed: true,
    })
    .select();

  console.log("new player:", JSON.stringify(new_player));

  const profile = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  return {
    message: `Created game ${game_type.data.name} for ${profile.data?.username}!`,
    game: new_game.data,
  };
});
