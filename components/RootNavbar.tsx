import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import { logoutUser } from "~/appwrite/auth";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";

const RootNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const user = useLoaderData();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/sign-in");
  };

  return (
    <nav className="bg-white w-full fixed z-50">
      <header className="root-nav wrapper">
        <Link to="/" className="link-logo">
          <img
            src="/assets/icons/logo.svg"
            alt="logo"
            className="size-[30px]"
          />
          <h1>Tourvisto</h1>
        </Link>

        <aside>
          {user.status === "admin" && (
            <Link
              to="/dashboard"
              className="text-base font-semibold text-dark-100 hover:text-primary-500 transition-colors duration-200"
            >
              Dashboard
            </Link>
          )}

          <div className="flex items-center gap-2.5">
            <img
              src={user?.imageUrl || "/assets/images/david.webp"}
              alt={user?.name || "User"}
              referrerPolicy="no-referrer"
              className="size-10 rounded-full"
            />
            <h2 className="text-base font-medium text-dark-100">
              {user?.name}
            </h2>
          </div>

          <button onClick={handleLogout} className="cursor-pointer">
            <img
              src="/assets/icons/logout.svg"
              alt="logout"
              className="size-6 rotate-180"
            />
          </button>
        </aside>
      </header>
    </nav>
  );
};
export default RootNavbar;
