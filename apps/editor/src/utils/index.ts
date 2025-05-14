const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const searchParams = params.get("fileUrl");
  return searchParams;
};

export { getQueryParams };
