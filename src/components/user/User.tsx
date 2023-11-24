import "../../App.css";
import { useSession } from "../../util/supabase";
import Auth from "./Auth";
import Account from "./Account";

function User() {
  const [session] = useSession();
  return (
    <div className="container" style={{ padding: "50px 0 100px 0" }}>
      {!session ? <Auth /> : <Account key={session.user.id} />}
    </div>
  );
}

export default User;
