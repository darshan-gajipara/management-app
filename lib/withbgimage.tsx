export const withBgImage = (WrappedComponent: React.ComponentType<unknown>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function ComponentWithUser(props:any) {
   

    return <div
        style={{
          backgroundImage: "url('/background.jpg')",
          backgroundSize: "cover",      
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center", 
          minHeight: "100vh",         
          width: "100%",
        }}
      >
        <WrappedComponent {...props} />
      </div>
  };
};