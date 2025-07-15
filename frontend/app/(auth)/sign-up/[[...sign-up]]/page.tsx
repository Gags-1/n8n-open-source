import { SignUp } from "@clerk/nextjs";

export default function Signup() {
  return (
    <div className="bg-[url(/background.png)] bg-cover bg-center min-h-screen flex flex-col items-center justify-center">
      <SignUp />
    </div>
  );
}
