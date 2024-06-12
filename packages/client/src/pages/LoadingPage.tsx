import Logo from "../components/Logo";

const LoadingPage = () => {
  return (
    <div className="flex h-[100svh] w-screen items-center justify-center bg-white text-black">
      <Logo isList={false} />
    </div>
  );
};

export default LoadingPage;
