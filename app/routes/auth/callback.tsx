import { redirect } from "react-router";
import { account } from "~/appwrite/client";
import { getExistingUser, storeUserData } from "~/appwrite/auth";

export async function clientLoader() {
  try {
    const user = await account.get();

    if (!user.$id) return redirect("/sign-in");

    let existingUser = await getExistingUser(user.$id);

    // Store user data if they're new
    if (!existingUser) {
      await storeUserData();
      existingUser = await getExistingUser(user.$id);
    }

    return redirect("/");
  } catch (error) {
    console.error("Error in auth callback:", error);
    return redirect("/sign-in");
  }
}

const AuthCallback = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Signing you in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
