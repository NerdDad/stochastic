import { useState } from "react";
import "./App.css";

import User from "./components/user/User";
import { useSession } from "./util/supabase";
import Game from "./components/game/Game";

function App() {
  const [mode, setMode] = useState<string>("User");
  const [session] = useSession();

  const nonUserMode = Boolean(session) && mode !== "User";
  console.log({ mode, nonUserMode });

  return (
    <div className="row flex flex-center">
      <div hidden={mode !== "User" && Boolean(session)}>
        <h1 className="header">Stochastic Games</h1>
        <h3>User</h3>
        <User />
        <button
          className="button block"
          type="button"
          onClick={() => setMode("")}
        >
          Main Menu
        </button>
      </div>
      <div hidden={mode !== "Game"}>
        <h1 className="header">Stochastic Games</h1>
        <h3>Game</h3>
        <Game />
        <button
          className="button block"
          type="button"
          onClick={() => setMode("")}
        >
          Main Menu
        </button>
      </div>
      <div hidden={mode !== ""}>
        <h1 className="header">Stochastic Games</h1>
        <button
          className="button block"
          type="button"
          onClick={() => setMode("User")}
        >
          User
        </button>
        <button
          className="button block"
          type="button"
          onClick={() => setMode("Game")}
        >
          Game
        </button>
      </div>
    </div>
  );
}

export default App;

/**
 * game table:
 * id
 * creator_id: user_id
 * game_type_id: num
 * player_count: num, 1 // todo
 * current_turn: num, 0
 * start_time: time|null
 * finish_time: time|null
 * cancelled: bool, false
 *
 * game_players table:
 * id
 * game_id
 * player_id: user_id
 * confirmed: bool, false
 *
 * game_moves table:
 * id
 * game_id
 * player_id: user_id
 * turn_number: num
 * move: text (json)
 *
 * game_types:
 * id
 * name: text
 * max_players: num
 *
 *  func create_game(user, type):
 *    if (!game_types.select(type)) return "Not a game"
 *    if (!games.filter(user).filter(type).filter(!finished)) return "Already a game"
 *    id = game.insert(creator:user, game_type:type)
 *    game_players.insert(game_id:id, player_id:user, confirmed: true)
 *    return id
 *
 *  func current_games(user):
 *    return games.filter(user).filter(type).filter(!finished)
 *
 *  func get_game_to_join(user):
 *    return games.filter(!start_time).filter(game => !game_players(game, player_id: user))
 *
 *  func join_game(user, game_id):
 *    game = game.select(game_id)
 *    if (!game) return "Not a game"
 *    if (game.finish_time) return "Already done"
 *    if (game.started_time) return "Already started"
 *    if (game_players.filter(game_id, player_id:user)) return "Already joined", confirmed
 *    if (game_players.filter(game_id, confirmed:true).length >= game_types.select(game.type).max_players) return "Already full"
 *    game_players.insert(game_id:id, player_id:user)
 *
 *  func confirm_player(user, game_id, player):
 *    game = game.select(game_id)
 *    if (!game) return "Not a game"
 *    if (!game.creator == user) return "No permission"
 *    if (!game_players.select(game_id).filter(player)) return "No request" // later
 *    if (game_players.filter(game_id, confirmed:true).length >= game_types.select(game.type).max_players) return "Already full"
 *    game_players.select(game_id).upsert(player, confirmed:true)
 *
 *  func start_game(user, game_id):
 *    game = game.select(game_id)
 *    if (!game) return "Not a game"
 *    if (!game.creator == user) return "No permission"
 *    game_players.select(game_id).filter(confirmed:false).forEach(delete)
 *    game_players.select(game_id).filter(confirmed:true)
 *    game.start_time = now
 *
 *  func make_move(user, game_id):
 *    game = game.select(game_id)
 *    if (!game) return "Not a game"
 *    if (!game_players.filter(game_id, player_id:user)) return "Mot in this game"
 *
 *
 */
