import { redirect } from "react-router";
import { account } from "~/appwrite/client";
import { getExistingUser, storeUserData } from "~/appwrite/auth";

export async function clientLoader() {
  try {
    const user = await account.get();

    if (!user.$id) {
      window.location.replace("/sign-in");
      return null;
    }

    let existingUser = await getExistingUser(user.$id);

    // Store user data if they're new
    if (!existingUser) {
      await storeUserData();
      existingUser = await getExistingUser(user.$id);
    }

    window.location.replace("/");
    return null;
  } catch (error) {
    console.error("Error in auth callback:", error);
    window.location.replace("/sign-in");
    return null;
  }
}

const AuthCallback = () => {
  return null;
};

export default AuthCallback;
