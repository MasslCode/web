export function musicServerPort(env = process.env) {
  // Hosting assigns PORT; a development override must not redirect production traffic.
  return env.NODE_ENV === 'production'
    ? env.PORT || env.MUSIC_SERVER_PORT || 3002
    : env.MUSIC_SERVER_PORT || 3002;
}
