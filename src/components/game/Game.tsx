import { useCallback, useEffect, useState } from "react";
import { supabase, useSession } from "../../util/supabase";
import { Tables } from "../../util/database.types";

type GameTypeRow = Tables<"game_types">;

function Game() {
  const [session] = useSession();
  const [mode, setMode] = useState("");
  const [gameTypes, setGameTypes] = useState<GameTypeRow[] | null>();
  const [gamesToJoin, setGamesToJoin] = useState<Tables<"game">[] | null>();
  const [_gamesPlaying, setGamesPlaying] = useState<Tables<"game">[] | null>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getTypes() {
      supabase
        .from("game_types")
        .select()
        .then((response) => setGameTypes(response.data));
    }
    supabase.functions
      .invoke("load-games")
      .then(({ data: { toJoin, playing } }) => {
        setGamesToJoin(toJoin);
        setGamesPlaying(playing);
      });
    getTypes();
  }, []);

  const createGame = useCallback(
    async (type_id: string) => {
      const gameType = gameTypes?.find((gt) => gt.id === type_id);
      if (!gameType) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("create-game", {
          body: { type: type_id },
        });
        console.log({ data, error });
      } finally {
        setLoading(false);
      }
    },
    [gameTypes]
  );

  if (!session) return <></>;

  if (mode === "Create") {
    return (
      <>
        {gameTypes &&
          gameTypes.map((gt) => (
            <div key={gt.id}>
              <button
                className="button block"
                type="button"
                onClick={() => createGame(gt.id)}
                disabled={loading}
              >
                {loading ? "Loading ..." : `Create ${gt.name}`}
              </button>
            </div>
          ))}
        <div>
          <button
            className="button block"
            type="button"
            onClick={() => setMode("")}
          >
            Cancel Create
          </button>
        </div>
      </>
    );
  }

  if (mode === "Join") {
    return (
      <>
        <div>
          {gamesToJoin?.map((game) => (
            <button
              className="button block"
              type="button"
              onClick={() => setMode("")}
            >
              Join {game.id}
            </button>
          ))}
          <button
            className="button block"
            type="button"
            onClick={() => setMode("")}
          >
            Cancel Join
          </button>
        </div>
      </>
    );
  }

  return (
    <div>
      {["Play", "Join", "Create"].map((newMode) => (
        <button
          className="button block"
          type="button"
          onClick={() => setMode(newMode)}
        >
          {newMode} Game...
        </button>
      ))}
    </div>
  );
}
export default Game;
