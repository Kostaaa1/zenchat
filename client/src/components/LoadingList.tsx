const LoadingList = () => {
  return (
    <div className="flex w-full items-center px-6 py-2">
      <div className="block h-16 w-16 rounded-full bg-neutral-800"></div>
      <div className="ml-4 flex h-full flex-col justify-between py-[6px]">
        <div className="mb-2 h-4 w-[240px] rounded-lg bg-neutral-800"></div>
        <div className="h-4 w-[80px] rounded-lg bg-neutral-800"> </div>
      </div>
    </div>
  );
};

export default LoadingList;
