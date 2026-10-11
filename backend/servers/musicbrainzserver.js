import 'dotenv/config';
import { createMusicBrainzClient } from './musicbrainz/client.js';
import { createMusicBrainzService } from './musicbrainz/service.js';
import { createMusicApp } from './musicbrainz/app.js';
import { musicServerPort } from './musicbrainz/config.js';

const port = musicServerPort();
const service = createMusicBrainzService(createMusicBrainzClient());
createMusicApp(service).listen(port, () => {
  console.log(`MusicBrainz server running on port ${port}`);
});
