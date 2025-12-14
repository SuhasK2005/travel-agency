import { Outlet, redirect } from "react-router";
import RootNavbar from "../../../components/RootNavbar";
import { account } from "~/appwrite/client";
import { getExistingUser, getUser, storeUserData } from "~/appwrite/auth";

export async function clientLoader() {
  try {
    const user = await account.get();

    if (!user.$id) return redirect("/sign-in");

    const existingUser = await getExistingUser(user.$id);

    if (!existingUser) {
      await storeUserData();
    }

    return await getUser();
  } catch (e) {
    console.log("Error in clientLoader", e);
    return redirect("/sign-in");
  }
}

const PageLayout = () => {
  return (
    <>
      <RootNavbar />
      <Outlet />
    </>
  );
};

export default PageLayout;
