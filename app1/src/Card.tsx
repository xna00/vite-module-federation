export default ({
  children,
  size,
}: {
  children: React.ReactNode;
  size: "small";
}) => {
  return (
    <div
      style={{
        border: "1px solid gray",
        borderRadius: 4,
      }}
    >
      <div>{size}</div>
      {children}
    </div>
  );
};
