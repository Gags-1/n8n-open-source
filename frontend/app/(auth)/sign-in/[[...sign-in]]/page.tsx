import { SignIn } from "@clerk/nextjs";

export default function Signin() {
  return (
    <div className="bg-[url(/background.png)] bg-cover bg-center min-h-screen flex items-center justify-center">
      <SignIn  />
    </div>
  );
}
