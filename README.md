# Album review app

Search MusicBrainz for albums and EPs, view their tracks, save personal ratings,
and browse the saved collection and tier list.

Run locally from the repository root:

```powershell
npm install
npm run install:all
npm run dev
```

Configure `backend/.env` using `backend/.env.example` and your existing PostgreSQL
connection. The frontend's `client/.env.development` points to the collection API
on port 5000 and the music API on port 3002. Open the URL printed by Vite
(normally http://localhost:5173).

If PowerShell blocks `npm.ps1`, use `npm.cmd` in place of `npm`, for example
`npm.cmd run dev`.

The collection API imports the database pool itself; no separate database
process is needed. The existing database ID columns support MusicBrainz UUIDs,
so this change requires no schema migration. Existing Tidal entries and ratings
remain available. They are not automatically matched to MusicBrainz entries;
adding the same album from MusicBrainz can create a separate entry.

Music data comes from the [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API).
No API key is needed for these reads. The server identifies itself with
`MUSICBRAINZ_USER_AGENT` (defaulting to this project's name/version and GitHub URL),
queues requests at least 1.1 seconds apart, retries temporary throttling, and
caches successful upstream responses for five minutes and complete tracklists
for thirty minutes. Run one music server instance per
outbound IP, or add a shared rate limiter before scaling across instances.

Search returns release groups, which combine editions of an album. Selecting an
album loads the earliest dated official release with track metadata, trying up
to three releases if tracklists are incomplete. If no official release exists,
other releases are considered. Multi-disc tracks are numbered consecutively;
unknown durations are stored as null. Edition browsing retrieves only metadata;
tracks are fetched for the selected edition. For albums with many editions,
MusicBrainz still requires pagination. Edition selection is automatic for now.

The drawer preloads the first result after a 600 ms pause, or an album you hover
for 200 ms or focus with the keyboard. Only one speculative album load runs at a
time. The dialog shares pending requests and reuses completed tracklists from a
bounded thirty-minute browser cache; closing it does not discard a useful load.

Artwork comes from the [Cover Art Archive](https://musicbrainz.org/doc/Cover_Art_Archive/API).
Albums without available artwork show a local placeholder.
The drawer and add-album dialog share 250-pixel thumbnails. Covers farther down
the drawer load as you scroll, and the page opens connections to the artwork
hosts early. Saved albums retain the 500-pixel cover URL.

Verify the change:

```powershell
npm test --prefix backend
npm run build --prefix client
```

For an optional live search and tracklist check against MusicBrainz (without
accessing the collection database), run `npm run check:music --prefix backend`.

For deployment, start the collection service with `npm run start:server` and the
music service with `npm run start:musicserver`, both from `backend/`. The music
service replaces the old `start:tidalserver` command. If reusing the existing
Render music service (currently named `tidalserver`), its hostname can stay the
same; redeploy the new code and update its start command. Otherwise, set
`VITE_API_MUSIC_BASE_URL` in the frontend deployment to the new service URL and
rebuild it. Production music services use `PORT` unless `MUSIC_SERVER_PORT` is
explicitly configured. Tidal credentials are no longer used.
