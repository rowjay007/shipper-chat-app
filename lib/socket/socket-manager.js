let io = null;

export const setIo = (server) => {
  io = server;
};

export const getIo = () => {
  return io;
};
