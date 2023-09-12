const ErrorPage = () => {
  return (
    <div className="flex w-full max-w-full flex-col flex-wrap items-center justify-center py-8 text-center">
      <h3 className="pb-4 text-2xl font-semibold">
        Sorry, this page isn't available.
      </h3>
      <p>
        The link you followed may be broken, or the page may have been removed.
        Go back to main page.
      </p>
    </div>
  );
};

export default ErrorPage;
