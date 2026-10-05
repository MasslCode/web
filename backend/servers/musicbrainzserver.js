import 'dotenv/config';
import { createMusicBrainzClient } from './musicbrainz/client.js';
import { createMusicBrainzService } from './musicbrainz/service.js';
import { createMusicApp } from './musicbrainz/app.js';

const port = process.env.MUSIC_SERVER_PORT || (process.env.NODE_ENV === 'production' ? process.env.PORT : undefined) || 3002;
const service = createMusicBrainzService(createMusicBrainzClient());
createMusicApp(service).listen(port, () => {
  console.log(`MusicBrainz server running on port ${port}`);
});
